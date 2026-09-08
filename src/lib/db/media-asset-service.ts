import "server-only";
import { sql } from "drizzle-orm";
import { withCmsTransaction, type CmsTransactionContext } from "./index";
import { postgresErrorFields } from "./mutation-errors";
import {
  assetIdSchema,
  createStorageKey,
  generateAssetId,
  mediaOwnershipSubjectSchema,
  originalFilenameSchema,
  storageKeySchema,
  type AssetLifecycleState,
  type MediaOwnershipSubject,
  type OwnedMediaProvider,
  parseStorageKey,
} from "@/lib/media/ownership";
import { entityIdSchema } from "@/lib/validations/identifiers";
import { externalWebUrlSchema } from "@/lib/validations/urls";
import { uploadKindSchema } from "@/lib/validations/upload";
import {
  decideMediaCleanupCandidate,
  parseMediaCleanupPolicy,
  type MediaCleanupPolicy,
} from "@/lib/media/cleanup-policy";

export class MediaAssetNotFoundError extends Error {
  constructor() { super("Media asset was not found."); this.name = "MediaAssetNotFoundError"; }
}

export class MediaAssetNotAttachableError extends Error {
  constructor() { super("Media asset is not attachable."); this.name = "MediaAssetNotAttachableError"; }
}

export class MediaAssetFinalizationMismatchError extends Error {
  constructor() { super("Media asset finalization did not match the pending asset."); this.name = "MediaAssetFinalizationMismatchError"; }
}

export class MediaAssetNotFinalizableError extends Error {
  constructor() { super("Media asset is not finalizable."); this.name = "MediaAssetNotFinalizableError"; }
}
export class MediaOwnerNotFoundError extends Error {
  constructor() { super("Media owner was not found."); this.name = "MediaOwnerNotFoundError"; }
}

export class MediaSlotOccupiedError extends Error {
  constructor() { super("Media owner slot is already occupied."); this.name = "MediaSlotOccupiedError"; }
}

export class MediaReferenceNotFoundError extends Error {
  constructor() { super("Media reference was not found."); this.name = "MediaReferenceNotFoundError"; }
}

export class MediaAssetBindingError extends Error {
  constructor() { super("Media asset identity does not match the submitted media."); this.name = "MediaAssetBindingError"; }
}
export class MediaAssetDeleteNotEligibleError extends Error {
  constructor() { super("Media asset is not eligible for deletion."); this.name = "MediaAssetDeleteNotEligibleError"; }
}

export type MediaCleanupSynchronization = Readonly<{
  afterCandidateLocks?: (backendPid: number, assetIds: readonly string[]) => Promise<void>;
}>;

type ClaimedCleanupAsset = Readonly<{ assetId: string; providerKey: ReturnType<typeof storageKeySchema.parse> }>;
export type MediaCleanupItemResult = Readonly<{
  assetId: string;
  status: "discarded" | "deleted" | "delete_failed";
  errorCode?: string;
}>;

export type MediaCleanupRunResult = Readonly<{
  claimed: number;
  discarded: number;
  deleted: number;
  failed: number;
  items: readonly MediaCleanupItemResult[];
}>;

export type MediaSlotInput = Readonly<{ assetId?: string | null; url: string | null; kind: "image" | "video" }>;
export type PreparedMediaSlot = Readonly<{ assetId: string | null; url: string | null; kind: "image" | "video" }>;

export type MediaAssetLockSynchronization = Readonly<{
  beforeAssetLocks?: (backendPid: number, assetIds: readonly string[]) => Promise<void>;
  afterAssetLocks?: (backendPid: number, assetIds: readonly string[]) => Promise<void>;
}>;

async function synchronizeAssetLocks(
  tx: CmsTransactionContext,
  assetIds: readonly string[],
  synchronization?: MediaAssetLockSynchronization
): Promise<readonly { id: string; url: string | null; kind: "image" | "video"; state: AssetLifecycleState }[]> {
  const orderedIds = [...new Set(assetIds)].sort();
  if (orderedIds.length === 0) return [];
  const pid = synchronization ? (await tx.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid : 0;
  await synchronization?.beforeAssetLocks?.(pid, orderedIds);
  const result = await tx.query<{ id: string; url: string | null; kind: "image" | "video"; state: AssetLifecycleState }>(
    "SELECT id,url,kind,state FROM media_assets WHERE id = ANY($1::text[]) ORDER BY id FOR UPDATE",
    [orderedIds]
  );
  await synchronization?.afterAssetLocks?.(pid, orderedIds);
  return result.rows;
}

export async function prepareMediaSlot(tx: CmsTransactionContext, input: MediaSlotInput): Promise<PreparedMediaSlot> {
  const url = input.url || null;
  if (!input.assetId) return Object.freeze({ assetId: null, url, kind: input.kind });
  const assetId = assetIdSchema.parse(input.assetId);
  const result = await tx.db.select<{ url: string | null; kind: "image" | "video"; state: AssetLifecycleState }>(sql`
    SELECT url,kind,state FROM media_assets WHERE id=${assetId}
  `);
  const asset = result.rows[0];
  if (!asset) throw new MediaAssetNotFoundError();
  if (!asset.url || asset.url !== url || asset.kind !== input.kind) throw new MediaAssetBindingError();
  if (!["pending", "attached", "orphaned"].includes(asset.state)) throw new MediaAssetNotAttachableError();
  return Object.freeze({ assetId, url: asset.url, kind: input.kind });
}

export async function synchronizeMediaSlot(
  tx: CmsTransactionContext,
  subjectInput: unknown,
  prepared: PreparedMediaSlot,
  synchronization?: MediaAssetLockSynchronization
): Promise<void> {
  const subject = mediaOwnershipSubjectSchema.parse(subjectInput);
  if (subject.entityType === "site_settings" && prepared.kind !== "image") throw new MediaAssetBindingError();
  const ownerColumn = subject.entityType === "portfolio_project"
    ? "portfolio_project_id"
    : subject.entityType === "showreel" ? "showreel_id" : "site_settings_id";
  const current = await tx.query<{ id: string; asset_id: string }>(
    `SELECT id,asset_id FROM media_asset_references WHERE owner_type=$1 AND ${ownerColumn}=$2 AND slot=$3 FOR UPDATE`,
    [subject.entityType, subject.entityId, subject.slot]
  );
  const oldAssetId = current.rows[0]?.asset_id ?? null;
  const lockedAssets = await synchronizeAssetLocks(
    tx,
    [oldAssetId, prepared.assetId].filter((id): id is string => id !== null),
    synchronization
  );
  if (oldAssetId && !lockedAssets.some((asset) => asset.id === oldAssetId)) throw new MediaAssetNotFoundError();
  if (prepared.assetId) {
    const asset = lockedAssets.find((candidate) => candidate.id === prepared.assetId);
    if (!asset) throw new MediaAssetNotFoundError();
    if (!asset.url || asset.url !== prepared.url || asset.kind !== prepared.kind) throw new MediaAssetBindingError();
    if (!["pending", "attached", "orphaned"].includes(asset.state)) throw new MediaAssetNotAttachableError();
  }
  if (oldAssetId === prepared.assetId) return;
  if (prepared.assetId) {
    if (current.rows[0]) {
      await tx.db.update(sql`UPDATE media_asset_references SET asset_id=${prepared.assetId} WHERE id=${current.rows[0].id}`);
    } else if (subject.entityType === "portfolio_project") {
      await tx.db.insert(sql`INSERT INTO media_asset_references(id,asset_id,owner_type,portfolio_project_id,slot) VALUES (${crypto.randomUUID()},${prepared.assetId},'portfolio_project',${subject.entityId},${subject.slot})`);
    } else if (subject.entityType === "showreel") {
      await tx.db.insert(sql`INSERT INTO media_asset_references(id,asset_id,owner_type,showreel_id,slot) VALUES (${crypto.randomUUID()},${prepared.assetId},'showreel',${subject.entityId},${subject.slot})`);
    } else {
      await tx.db.insert(sql`INSERT INTO media_asset_references(id,asset_id,owner_type,site_settings_id,slot) VALUES (${crypto.randomUUID()},${prepared.assetId},'site_settings',${subject.entityId},${subject.slot})`);
    }
    await tx.db.update(sql`UPDATE media_assets SET state='attached',updated_at=now() WHERE id=${prepared.assetId}`);
  } else if (current.rows[0]) {
    await tx.db.delete(sql`DELETE FROM media_asset_references WHERE id=${current.rows[0].id}`);
  }
  if (oldAssetId) {
    const count = await tx.db.count(sql`SELECT count(*) FROM media_asset_references WHERE asset_id=${oldAssetId}`);
    await tx.db.update(sql`UPDATE media_assets SET state=${count === 0 ? "orphaned" : "attached"},updated_at=now() WHERE id=${oldAssetId} AND state IN ('pending','attached','orphaned')`);
  }
}

export type DeleteLifecycleResult = Readonly<{ status: "deleted" | "delete_failed" | "already_deleted" | "busy"; errorCode?: string }>;
export async function deleteOrphanedMediaAsset(assetIdInput: unknown, provider: OwnedMediaProvider): Promise<DeleteLifecycleResult> {
  const assetId = assetIdSchema.parse(assetIdInput);
  const claim = await withCmsTransaction(async (tx) => {
    const result = await tx.db.select<{ providerKey: string; state: AssetLifecycleState }>(sql`SELECT provider_key AS "providerKey",state FROM media_assets WHERE id=${assetId} FOR UPDATE`);
    const asset = result.rows[0];
    if (!asset) throw new MediaAssetNotFoundError();
    if (asset.state === "deleted") return { status: "already_deleted" as const };
    if (asset.state === "deleting") return { status: "busy" as const };
    const references = await tx.db.count(sql`SELECT count(*) FROM media_asset_references WHERE asset_id=${assetId}`);
    if (references !== 0 || (asset.state !== "orphaned" && asset.state !== "delete_failed")) throw new MediaAssetDeleteNotEligibleError();
    const providerKey = storageKeySchema.parse(asset.providerKey);
    if (createStorageKey(assetId, parseStorageKey(providerKey).kind) !== providerKey) throw new MediaAssetDeleteNotEligibleError();
    await tx.db.update(sql`UPDATE media_assets SET state='deleting',delete_attempts=delete_attempts+1,last_delete_attempt_at=now(),last_delete_error_code=NULL,updated_at=now() WHERE id=${assetId}`);
    return { status: "claimed" as const, providerKey };
  });
  if (claim.status !== "claimed") return claim;
  let signal: Awaited<ReturnType<OwnedMediaProvider["deleteOwnedKey"]>>;
  try { signal = await provider.deleteOwnedKey(claim.providerKey); } catch { signal = "unknown_outcome"; }
  const confirmed = signal === "success" || signal === "not_found";
  const errorCode = confirmed ? null : signal;
  return withCmsTransaction(async (tx) => {
    const result = await tx.db.update(sql`UPDATE media_assets SET state=${confirmed ? "deleted" : "delete_failed"},last_delete_error_code=${errorCode},updated_at=now() WHERE id=${assetId} AND state='deleting' RETURNING id`);
    if (!result.rows[0]) throw new MediaAssetDeleteNotEligibleError();
    return confirmed ? { status: "deleted" as const } : { status: "delete_failed" as const, errorCode: errorCode! };
  });
}

export async function reconcileMediaAssetLifecycle(
  batchSizeInput?: number,
  now = new Date(),
  claimTimeoutMs?: number
): Promise<{ attached: number; orphaned: number; recovered: number }> {
  const policy = parseMediaCleanupPolicy({
    ...(batchSizeInput === undefined ? {} : { batchSize: batchSizeInput }),
    ...(claimTimeoutMs === undefined ? {} : { claimTimeoutMs }),
  });
  if (!Number.isFinite(now.getTime())) throw new Error("Invalid media reconciliation time.");
  const staleClaimCutoff = new Date(now.getTime() - policy.claimTimeoutMs);
  return withCmsTransaction(async (tx) => {
    const inconsistent = await tx.query<{ id: string; state: AssetLifecycleState; reference_count: number }>(
      `SELECT a.id,a.state,(SELECT count(*)::int FROM media_asset_references r WHERE r.asset_id=a.id) AS reference_count
       FROM media_assets a
       WHERE a.state IN ('attached','orphaned','delete_failed','deleting')
         AND ((a.state='attached' AND NOT EXISTS (SELECT 1 FROM media_asset_references r WHERE r.asset_id=a.id))
           OR (a.state IN ('orphaned','delete_failed') AND EXISTS (SELECT 1 FROM media_asset_references r WHERE r.asset_id=a.id))
           OR (a.state='deleting' AND a.updated_at <= $2 AND NOT EXISTS (SELECT 1 FROM media_asset_references r WHERE r.asset_id=a.id)))
       ORDER BY a.updated_at,a.id
       FOR UPDATE SKIP LOCKED
       LIMIT $1`,
      [policy.batchSize, staleClaimCutoff]
    );
    let attached = 0;
    let orphaned = 0;
    let recovered = 0;
    for (const asset of inconsistent.rows) {
      if (asset.state === "deleting") {
        const updated = await tx.query(
          "UPDATE media_assets SET state='delete_failed',last_delete_error_code='unknown_outcome',updated_at=$2 WHERE id=$1 AND state='deleting' RETURNING id",
          [asset.id, now]
        );
        if (updated.rows[0]) recovered++;
        continue;
      }
      const state = asset.reference_count > 0 ? "attached" : "orphaned";
      const updated = await tx.query(
        "UPDATE media_assets SET state=$2,updated_at=now() WHERE id=$1 AND state=$3 RETURNING id",
        [asset.id, state, asset.state]
      );
      if (updated.rows[0]) {
        if (state === "attached") attached++;
        else orphaned++;
      }
    }
    return { attached, orphaned, recovered };
  });
}

async function claimMediaCleanupBatch(
  now: Date,
  policyInput: Partial<MediaCleanupPolicy>,
  synchronization?: MediaCleanupSynchronization
): Promise<{ claims: ClaimedCleanupAsset[]; discarded: MediaCleanupItemResult[] }> {
  const policy = parseMediaCleanupPolicy(policyInput);
  const pendingCutoff = new Date(now.getTime() - policy.pendingAgeMs);
  const orphanCutoff = new Date(now.getTime() - policy.orphanAgeMs);
  return withCmsTransaction(async (tx) => {
    const pid = synchronization
      ? (await tx.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid
      : 0;
    const candidates = await tx.query<{
      id: string;
      provider_key: string;
      url: string | null;
      kind: "image" | "video";
      state: AssetLifecycleState;
      delete_attempts: number;
      last_delete_attempt_at: Date | null;
      last_delete_error_code: string | null;
      updated_at: Date;
    }>(
      `SELECT id,provider_key,url,kind,state,delete_attempts,last_delete_attempt_at,last_delete_error_code,updated_at
       FROM media_assets a
       WHERE NOT EXISTS (SELECT 1 FROM media_asset_references r WHERE r.asset_id=a.id)
         AND (
           (state='pending' AND updated_at <= $1)
           OR (state='orphaned' AND updated_at <= $2)
           OR (state='delete_failed' AND delete_attempts < $3
             AND last_delete_error_code IN ('retryable_failure','unknown_outcome')
             AND last_delete_attempt_at IS NOT NULL
             AND last_delete_attempt_at + make_interval(secs => LEAST($4, $5 * power(2, GREATEST(delete_attempts-1,0)))) <= $6)
         )
       ORDER BY COALESCE(last_delete_attempt_at,updated_at),id
       FOR UPDATE SKIP LOCKED
       LIMIT $7`,
      [pendingCutoff, orphanCutoff, policy.maxDeleteAttempts, policy.retryMaxDelayMs / 1000,
        policy.retryBaseDelayMs / 1000, now, policy.batchSize]
    );
    await synchronization?.afterCandidateLocks?.(pid, candidates.rows.map((candidate) => candidate.id));
    const claims: ClaimedCleanupAsset[] = [];
    const discarded: MediaCleanupItemResult[] = [];
    for (const candidate of candidates.rows) {
      let providerKey: ReturnType<typeof storageKeySchema.parse>;
      try {
        providerKey = storageKeySchema.parse(candidate.provider_key);
        if (createStorageKey(candidate.id, candidate.kind) !== providerKey) continue;
      } catch { continue; }
      const referenceCount = await tx.db.count(sql`SELECT count(*) FROM media_asset_references WHERE asset_id=${candidate.id}`);
      const decision = decideMediaCleanupCandidate({
        state: candidate.state,
        url: candidate.url,
        updatedAtMs: candidate.updated_at.getTime(),
        lastDeleteAttemptAtMs: candidate.last_delete_attempt_at?.getTime() ?? null,
        lastDeleteErrorCode: candidate.last_delete_error_code,
        deleteAttempts: candidate.delete_attempts,
        referenceCount,
        nowMs: now.getTime(),
        canonicalIdentity: true,
      }, policy);
      if (!decision.eligible) continue;
      if (decision.action === "discard_unfinalized") {
        const removed = await tx.query("DELETE FROM media_assets WHERE id=$1 AND state='pending' AND url IS NULL RETURNING id", [candidate.id]);
        if (removed.rows[0]) discarded.push({ assetId: candidate.id, status: "discarded" });
        continue;
      }
      const updated = await tx.query(
        `UPDATE media_assets SET state='deleting',delete_attempts=delete_attempts+1,
           last_delete_attempt_at=$2,last_delete_error_code=NULL,updated_at=$2
         WHERE id=$1 AND state=$3 RETURNING id`,
        [candidate.id, now, candidate.state]
      );
      if (updated.rows[0]) claims.push({ assetId: candidate.id, providerKey });
    }
    return { claims, discarded };
  });
}

export async function runMediaAssetCleanup(input: {
  provider: OwnedMediaProvider;
  now?: Date;
  policy?: Partial<MediaCleanupPolicy>;
  synchronization?: MediaCleanupSynchronization;
}): Promise<MediaCleanupRunResult> {
  const now = input.now ?? new Date();
  if (!Number.isFinite(now.getTime())) throw new Error("Invalid media cleanup time.");
  const policy = parseMediaCleanupPolicy(input.policy);
  await reconcileMediaAssetLifecycle(policy.batchSize, now, policy.claimTimeoutMs);
  const { claims, discarded } = await claimMediaCleanupBatch(now, policy, input.synchronization);
  const items: MediaCleanupItemResult[] = [...discarded];
  for (const claim of claims) {
    let signal: Awaited<ReturnType<OwnedMediaProvider["deleteOwnedKey"]>>;
    try { signal = await input.provider.deleteOwnedKey(claim.providerKey); } catch { signal = "unknown_outcome"; }
    const confirmed = signal === "success" || signal === "not_found";
    const errorCode = confirmed ? null : signal;
    const finalized = await withCmsTransaction((tx) => tx.query(
      `UPDATE media_assets SET state=$2,last_delete_error_code=$3,updated_at=now()
       WHERE id=$1 AND state='deleting' RETURNING id`,
      [claim.assetId, confirmed ? "deleted" : "delete_failed", errorCode]
    ));
    if (!finalized.rows[0]) continue;
    items.push(confirmed
      ? { assetId: claim.assetId, status: "deleted" }
      : { assetId: claim.assetId, status: "delete_failed", errorCode: errorCode! });
  }
  return Object.freeze({
    claimed: claims.length + discarded.length,
    discarded: discarded.length,
    deleted: items.filter((item) => item.status === "deleted").length,
    failed: items.filter((item) => item.status === "delete_failed").length,
    items: Object.freeze(items),
  });
}
export type PendingMediaAssetInput = {
  id?: unknown;
  provider?: unknown;
  kind: unknown;
  originalFilename: unknown;
  uploadedByAdminId: unknown;
};

export type PersistedMediaAsset = Readonly<{
  id: string;
  provider: "vercel_blob";
  providerKey: string;
  url: string | null;
  kind: "image" | "video";
  originalFilename: string;
  uploadedByAdminId: string | null;
  state: AssetLifecycleState;
  deleteAttempts: number;
}>;

function parsePendingInput(input: PendingMediaAssetInput) {
  const id = input.id === undefined ? generateAssetId() : assetIdSchema.parse(input.id);
  if (input.provider !== undefined && input.provider !== "vercel_blob") throw new Error("Unsupported media provider.");
  const kind = uploadKindSchema.parse(input.kind);
  return {
    id,
    provider: "vercel_blob" as const,
    providerKey: createStorageKey(id, kind),
    kind,
    originalFilename: originalFilenameSchema.parse(input.originalFilename),
    uploadedByAdminId: entityIdSchema.parse(input.uploadedByAdminId),
  };
}

function isExclusiveSlotConflict(error: unknown): boolean {
  const constraint = postgresErrorFields(error).constraint;
  return constraint === "media_asset_references_project_slot_unique"
    || constraint === "media_asset_references_showreel_slot_unique"
    || constraint === "media_asset_references_settings_slot_unique"
    || constraint === "media_asset_references_asset_owner_slot_unique";
}

export async function createPendingMediaAsset(input: PendingMediaAssetInput): Promise<PersistedMediaAsset> {
  const asset = parsePendingInput(input);
  return withCmsTransaction(async (tx) => {
    const result = await tx.db.insert<PersistedMediaAsset>(sql`
      INSERT INTO media_assets(id,provider,provider_key,kind,original_filename,uploaded_by_admin_id)
      VALUES (${asset.id},${asset.provider},${asset.providerKey},${asset.kind},${asset.originalFilename},${asset.uploadedByAdminId})
      RETURNING id,provider,provider_key AS "providerKey",url,kind,original_filename AS "originalFilename",
        uploaded_by_admin_id AS "uploadedByAdminId",state,delete_attempts AS "deleteAttempts"
    `);
    return result.rows[0];
  });
}

export type FinalizePendingMediaAssetUploadInput = {
  assetId: unknown;
  expectedProviderKey: unknown;
  kind: unknown;
  url: unknown;
};

export async function finalizePendingMediaAssetUpload(input: FinalizePendingMediaAssetUploadInput): Promise<PersistedMediaAsset> {
  const assetId = assetIdSchema.parse(input.assetId);
  const kind = uploadKindSchema.parse(input.kind);
  const expectedProviderKey = storageKeySchema.parse(input.expectedProviderKey);
  const url = externalWebUrlSchema.parse(input.url);
  if (expectedProviderKey !== createStorageKey(assetId, kind)) throw new MediaAssetFinalizationMismatchError();

  return withCmsTransaction(async (tx) => {
    const result = await tx.db.select<PersistedMediaAsset>(sql`
      SELECT id,provider,provider_key AS "providerKey",url,kind,original_filename AS "originalFilename",
        uploaded_by_admin_id AS "uploadedByAdminId",state,delete_attempts AS "deleteAttempts"
      FROM media_assets WHERE id=${assetId} FOR UPDATE
    `);
    const asset = result.rows[0];
    if (!asset) throw new MediaAssetNotFoundError();
    if (asset.state !== "pending") throw new MediaAssetNotFinalizableError();
    if (asset.provider !== "vercel_blob" || asset.providerKey !== expectedProviderKey || asset.kind !== kind) {
      throw new MediaAssetFinalizationMismatchError();
    }
    if (asset.url !== null) {
      if (asset.url !== url) throw new MediaAssetFinalizationMismatchError();
      return asset;
    }
    const updated = await tx.db.update<PersistedMediaAsset>(sql`
      UPDATE media_assets SET url=${url},updated_at=now() WHERE id=${assetId}
      RETURNING id,provider,provider_key AS "providerKey",url,kind,original_filename AS "originalFilename",
        uploaded_by_admin_id AS "uploadedByAdminId",state,delete_attempts AS "deleteAttempts"
    `);
    return updated.rows[0];
  });
}
export async function readMediaAsset(id: unknown): Promise<PersistedMediaAsset | null> {
  const assetId = assetIdSchema.parse(id);
  return withCmsTransaction(async (tx) => {
    const result = await tx.db.select<PersistedMediaAsset>(sql`
      SELECT id,provider,provider_key AS "providerKey",url,kind,original_filename AS "originalFilename",
        uploaded_by_admin_id AS "uploadedByAdminId",state,delete_attempts AS "deleteAttempts"
      FROM media_assets WHERE id=${assetId}
    `);
    return result.rows[0] ?? null;
  });
}

export type AuthorizePendingMediaAssetUploadInput = {
  assetId: unknown;
  expectedProviderKey: unknown;
  kind: unknown;
  uploaderAdminId: unknown;
};

export async function authorizePendingMediaAssetUpload(input: AuthorizePendingMediaAssetUploadInput): Promise<PersistedMediaAsset> {
  const assetId = assetIdSchema.parse(input.assetId);
  const kind = uploadKindSchema.parse(input.kind);
  const expectedProviderKey = storageKeySchema.parse(input.expectedProviderKey);
  const uploaderAdminId = entityIdSchema.parse(input.uploaderAdminId);
  if (expectedProviderKey !== createStorageKey(assetId, kind)) throw new MediaAssetFinalizationMismatchError();
  return withCmsTransaction(async (tx) => {
    const result = await tx.db.select<PersistedMediaAsset>(sql`
      SELECT id,provider,provider_key AS "providerKey",url,kind,original_filename AS "originalFilename",
        uploaded_by_admin_id AS "uploadedByAdminId",state,delete_attempts AS "deleteAttempts"
      FROM media_assets WHERE id=${assetId}
    `);
    const asset = result.rows[0];
    if (!asset) throw new MediaAssetNotFoundError();
    if (asset.provider !== "vercel_blob" || asset.providerKey !== expectedProviderKey || asset.kind !== kind
      || asset.uploadedByAdminId !== uploaderAdminId || asset.state !== "pending" || asset.url !== null) {
      throw new MediaAssetNotFinalizableError();
    }
    return asset;
  });
}
export async function countMediaAssetReferences(id: unknown): Promise<number> {
  const assetId = assetIdSchema.parse(id);
  return withCmsTransaction((tx) => tx.db.count(sql`SELECT count(*) FROM media_asset_references WHERE asset_id=${assetId}`));
}

async function assertOwnerExists(tx: CmsTransactionContext, subject: MediaOwnershipSubject): Promise<void> {
  const result = subject.entityType === "portfolio_project"
    ? await tx.db.select(sql`SELECT 1 FROM portfolio_projects WHERE id=${subject.entityId}`)
    : subject.entityType === "showreel"
      ? await tx.db.select(sql`SELECT 1 FROM showreels WHERE id=${subject.entityId}`)
      : await tx.db.select(sql`SELECT 1 FROM site_settings WHERE id=${subject.entityId}`);
  if (!result.rows[0]) throw new MediaOwnerNotFoundError();
}

export async function attachMediaAsset(assetIdInput: unknown, subjectInput: unknown): Promise<number> {
  const assetId = assetIdSchema.parse(assetIdInput);
  const subject = mediaOwnershipSubjectSchema.parse(subjectInput);
  try {
    return await withCmsTransaction(async (tx) => {
      const asset = await tx.db.select<{ state: AssetLifecycleState; url: string | null; kind: "image" | "video" }>(sql`SELECT state,url,kind FROM media_assets WHERE id=${assetId} FOR UPDATE`);
      if (!asset.rows[0]) throw new MediaAssetNotFoundError();
      if (!asset.rows[0].url || !["pending", "attached", "orphaned"].includes(asset.rows[0].state)) throw new MediaAssetNotAttachableError();
      if (subject.entityType === "site_settings" && asset.rows[0].kind !== "image") throw new MediaAssetBindingError();
      await assertOwnerExists(tx, subject);
      const referenceId = crypto.randomUUID();
      if (subject.entityType === "portfolio_project") {
        await tx.db.insert(sql`INSERT INTO media_asset_references(id,asset_id,owner_type,portfolio_project_id,slot) VALUES (${referenceId},${assetId},'portfolio_project',${subject.entityId},${subject.slot})`);
      } else if (subject.entityType === "showreel") {
        await tx.db.insert(sql`INSERT INTO media_asset_references(id,asset_id,owner_type,showreel_id,slot) VALUES (${referenceId},${assetId},'showreel',${subject.entityId},${subject.slot})`);
      } else {
        await tx.db.insert(sql`INSERT INTO media_asset_references(id,asset_id,owner_type,site_settings_id,slot) VALUES (${referenceId},${assetId},'site_settings',${subject.entityId},${subject.slot})`);
      }
      await tx.db.update(sql`UPDATE media_assets SET state='attached',updated_at=now() WHERE id=${assetId}`);
      return tx.db.count(sql`SELECT count(*) FROM media_asset_references WHERE asset_id=${assetId}`);
    });
  } catch (error) {
    if (isExclusiveSlotConflict(error)) throw new MediaSlotOccupiedError();
    throw error;
  }
}

export async function detachMediaAsset(assetIdInput: unknown, subjectInput: unknown, synchronization?: MediaAssetLockSynchronization): Promise<{ referenceCount: number; state: "attached" | "orphaned" }> {
  const assetId = assetIdSchema.parse(assetIdInput);
  const subject = mediaOwnershipSubjectSchema.parse(subjectInput);
  return withCmsTransaction(async (tx) => {
    const ownerColumn = subject.entityType === "portfolio_project"
      ? "portfolio_project_id"
      : subject.entityType === "showreel" ? "showreel_id" : "site_settings_id";
    const reference = await tx.query<{ id: string }>(
      `SELECT id FROM media_asset_references WHERE asset_id=$1 AND owner_type=$2 AND ${ownerColumn}=$3 AND slot=$4 FOR UPDATE`,
      [assetId, subject.entityType, subject.entityId, subject.slot]
    );
    if (!reference.rows[0]) throw new MediaReferenceNotFoundError();
    const assets = await synchronizeAssetLocks(tx, [assetId], synchronization);
    if (!assets[0]) throw new MediaAssetNotFoundError();
    const removed = await tx.db.delete(sql`DELETE FROM media_asset_references WHERE id=${reference.rows[0].id} RETURNING id`);
    if (!removed.rows[0]) throw new MediaReferenceNotFoundError();
    const referenceCount = await tx.db.count(sql`SELECT count(*) FROM media_asset_references WHERE asset_id=${assetId}`);
    const state = referenceCount === 0 ? "orphaned" as const : "attached" as const;
    await tx.db.update(sql`UPDATE media_assets SET state=${state},updated_at=now() WHERE id=${assetId}`);
    return { referenceCount, state };
  });
}
