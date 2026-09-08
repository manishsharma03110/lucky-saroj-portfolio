import assert from "node:assert/strict";
import { after, before, mock, test } from "node:test";
import { Pool } from "pg";
import { generateAssetId } from "@/lib/media/ownership";
import { validatePhase3gTestTarget } from "./media-test-target";

const target = validatePhase3gTestTarget({
  PHASE3G_TEST_DATABASE_URL: process.env.PHASE3G_TEST_DATABASE_URL,
  CMS_ALLOW_PHASE3G_LOCAL_DB_TESTS: process.env.CMS_ALLOW_PHASE3G_LOCAL_DB_TESTS,
});
const pool = new Pool({ connectionString: target.href, max: 8 });

let service: typeof import("./media-asset-service");
let singleton: typeof import("./singleton-content-service");
let closeDatabasePool: typeof import("./index").closeDatabasePool;
const roleId = "10000000-0000-4000-8000-000000000001";
const adminId = "aaaaaaaa-0000-4000-8000-000000000001";
const showreelId = "singleton:showreel";
const settingsId = "singleton:settings";

mock.module("server-only", { defaultExport: {} });

function projectId() { return generateAssetId(); }
async function createProject(id = projectId()) {
  await pool.query("INSERT INTO portfolio_projects(id,title,slug) VALUES ($1,$2,$3)", [id, "Media Test", `media-${id}`]);
  return id;
}
async function createPendingAsset(overrides: Partial<import("./media-asset-service").PendingMediaAssetInput> = {}) {
  const id = generateAssetId();
  return service.createPendingMediaAsset({
    id,
    provider: "vercel_blob",
    kind: "image",
    originalFilename: "asset.webp",
    uploadedByAdminId: adminId,
    ...overrides,
  });
}
async function createAsset(overrides: Partial<import("./media-asset-service").PendingMediaAssetInput> = {}) {
  const asset = await createPendingAsset(overrides);
  return service.finalizePendingMediaAssetUpload({
    assetId: asset.id,
    expectedProviderKey: asset.providerKey,
    kind: asset.kind,
    url: `https://example.test/${asset.id}`,
  });
}

before(async () => {
  const version = await pool.query<{ major: number }>("SELECT current_setting('server_version_num')::int/10000 AS major");
  assert.equal(version.rows[0].major, 18, "Phase 3G integration requires PostgreSQL 18");
  process.env.DATABASE_URL = target.href;
  service = await import("./media-asset-service");
  singleton = await import("./singleton-content-service");
  ({ closeDatabasePool } = await import("./index"));
  await pool.query(
    "INSERT INTO admin_users(id,email,name,password_hash,role_id) VALUES ($1,$2,$3,$4,$5) ON CONFLICT(id) DO NOTHING",
    [adminId, "phase3g@example.test", "Phase 3G", "not-a-real-password-hash", roleId]
  );
  await pool.query(
    "INSERT INTO showreels(id,title,status) VALUES ($1,$2,$3) ON CONFLICT(id) DO NOTHING",
    [showreelId, "Phase 3G Showreel", "draft"]
  );
  await pool.query("INSERT INTO site_settings(id) VALUES ($1) ON CONFLICT(id) DO NOTHING", [settingsId]);
  await pool.query("DELETE FROM media_asset_references WHERE showreel_id=$1 OR site_settings_id=$2", [showreelId, settingsId]);
});

after(async () => {
  if (closeDatabasePool) await closeDatabasePool();
  await pool.end();
});

test("pending asset persistence retains canonical provider identity and safe defaults", async () => {
  const asset = await createPendingAsset();
  assert.equal(asset.provider, "vercel_blob");
  assert.equal(asset.providerKey, `cms-media/${asset.id}/image`);
  assert.equal(asset.state, "pending");
  assert.equal(asset.url, null);
  assert.equal(asset.deleteAttempts, 0);
  assert.equal((await service.readMediaAsset(asset.id))?.id, asset.id);
  assert.equal(await service.countMediaAssetReferences(asset.id), 0);
});

test("service and DB reject invalid provider, kind, state, negative attempts, and duplicate keys", async () => {
  await assert.rejects(createPendingAsset({ provider: "other" }));
  await assert.rejects(createPendingAsset({ kind: "document" }));
  const id = generateAssetId();
  const values = [id, `cms-media/${id}/image`, `https://example.test/${id}`, adminId];
  await assert.rejects(pool.query("INSERT INTO media_assets(id,provider,provider_key,url,kind,original_filename,uploaded_by_admin_id,state) VALUES ($1,'vercel_blob',$2,$3,'image','x.webp',$4,'invalid')", values));
  await assert.rejects(pool.query("INSERT INTO media_assets(id,provider,provider_key,url,kind,original_filename,uploaded_by_admin_id,delete_attempts) VALUES ($1,'vercel_blob',$2,$3,'image','x.webp',$4,-1)", values));
  const asset = await createAsset();
  await assert.rejects(pool.query("INSERT INTO media_assets(id,provider,provider_key,url,kind,original_filename,uploaded_by_admin_id) VALUES ($1,'vercel_blob',$2,$3,'image','x.webp',$4)", [generateAssetId(), asset.providerKey, "https://example.test/duplicate", adminId]));
});

test("pending upload authorization binds uploader, key, kind, null URL, and state", async () => {
  const asset = await createPendingAsset();
  assert.equal((await service.authorizePendingMediaAssetUpload({ assetId: asset.id, expectedProviderKey: asset.providerKey, kind: asset.kind, uploaderAdminId: adminId })).id, asset.id);
  await assert.rejects(service.authorizePendingMediaAssetUpload({ assetId: asset.id, expectedProviderKey: asset.providerKey, kind: asset.kind, uploaderAdminId: generateAssetId() }), { name: "MediaAssetNotFinalizableError" });
  await service.finalizePendingMediaAssetUpload({ assetId: asset.id, expectedProviderKey: asset.providerKey, kind: asset.kind, url: `https://example.test/${asset.id}` });
  await assert.rejects(service.authorizePendingMediaAssetUpload({ assetId: asset.id, expectedProviderKey: asset.providerKey, kind: asset.kind, uploaderAdminId: adminId }), { name: "MediaAssetNotFinalizableError" });
});
test("pending upload finalization is bound, HTTPS-only, idempotent, and remains pending", async () => {
  const asset = await createPendingAsset();
  const input = {
    assetId: asset.id,
    expectedProviderKey: asset.providerKey,
    kind: asset.kind,
    url: `https://example.test/${asset.id}`,
  };
  const finalized = await service.finalizePendingMediaAssetUpload(input);
  assert.equal(finalized.url, input.url);
  assert.equal(finalized.state, "pending");
  assert.deepEqual(await service.finalizePendingMediaAssetUpload(input), finalized);
  await assert.rejects(service.finalizePendingMediaAssetUpload({ ...input, url: `https://example.test/different-${asset.id}` }), { name: "MediaAssetFinalizationMismatchError" });
  assert.equal((await service.readMediaAsset(asset.id))?.url, input.url);
});

test("finalization rejects wrong identity, kind, URL, missing asset, and non-pending state", async () => {
  const image = await createPendingAsset();
  const video = await createPendingAsset({ kind: "video" });
  await assert.rejects(service.finalizePendingMediaAssetUpload({ assetId: image.id, expectedProviderKey: video.providerKey, kind: "video", url: "https://example.test/cross" }), { name: "MediaAssetFinalizationMismatchError" });
  await assert.rejects(service.finalizePendingMediaAssetUpload({ assetId: image.id, expectedProviderKey: image.providerKey, kind: "video", url: "https://example.test/wrong-kind" }), { name: "MediaAssetFinalizationMismatchError" });
  await assert.rejects(service.finalizePendingMediaAssetUpload({ assetId: image.id, expectedProviderKey: image.providerKey, kind: image.kind, url: "http://example.test/unsafe" }));
  const missingId = generateAssetId();
  await assert.rejects(service.finalizePendingMediaAssetUpload({ assetId: missingId, expectedProviderKey: `cms-media/${missingId}/image`, kind: "image", url: "https://example.test/missing" }), { name: "MediaAssetNotFoundError" });
  const attached = await createAsset();
  const project = await createProject();
  await service.attachMediaAsset(attached.id, { entityType: "portfolio_project", entityId: project, slot: "thumbnail" });
  await assert.rejects(service.finalizePendingMediaAssetUpload({ assetId: attached.id, expectedProviderKey: attached.providerKey, kind: attached.kind, url: attached.url }), { name: "MediaAssetNotFinalizableError" });
  assert.equal((await service.readMediaAsset(image.id))?.url, null);
  assert.equal((await service.readMediaAsset(video.id))?.url, null);
});

test("competing different-URL finalizations preserve exactly one coherent URL", async () => {
  const asset = await createPendingAsset();
  const base = { assetId: asset.id, expectedProviderKey: asset.providerKey, kind: asset.kind };
  const urls = ["https://example.test/first", "https://example.test/second"];
  const results = await Promise.allSettled(urls.map((url) => service.finalizePendingMediaAssetUpload({ ...base, url })));
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.filter((result) => result.status === "rejected").length, 1);
  assert.ok(urls.includes((await service.readMediaAsset(asset.id))?.url ?? ""));
});

test("unfinalized assets cannot attach", async () => {
  const asset = await createPendingAsset();
  const project = await createProject();
  await assert.rejects(service.attachMediaAsset(asset.id, { entityType: "portfolio_project", entityId: project, slot: "thumbnail" }), { name: "MediaAssetNotAttachableError" });
  assert.equal(await service.countMediaAssetReferences(asset.id), 0);
});
test("uploader FK rejects unknown admins and uses SET NULL on account deletion", async () => {
  await assert.rejects(createAsset({ uploadedByAdminId: generateAssetId() }));
  const disposableAdmin = generateAssetId();
  await pool.query("INSERT INTO admin_users(id,email,name,password_hash,role_id) VALUES ($1,$2,'Disposable','x',$3)", [disposableAdmin, `${disposableAdmin}@example.test`, roleId]);
  const asset = await createAsset({ uploadedByAdminId: disposableAdmin });
  await pool.query("DELETE FROM admin_users WHERE id=$1", [disposableAdmin]);
  assert.equal((await service.readMediaAsset(asset.id))?.uploadedByAdminId, null);
});

test("all four finite owner slots attach and transition assets to attached", async () => {
  const project = await createProject();
  const cases = [
    { subject: { entityType: "portfolio_project", entityId: project, slot: "thumbnail" }, kind: "image" },
    { subject: { entityType: "portfolio_project", entityId: project, slot: "video" }, kind: "video" },
    { subject: { entityType: "showreel", entityId: showreelId, slot: "thumbnail" }, kind: "image" },
    { subject: { entityType: "showreel", entityId: showreelId, slot: "video" }, kind: "video" },
  ] as const;
  for (const item of cases) {
    const asset = await createAsset({ kind: item.kind });
    assert.equal(await service.attachMediaAsset(asset.id, item.subject), 1);
    assert.equal((await service.readMediaAsset(asset.id))?.state, "attached");
  }
});

test("unknown slots, malformed owners, missing owners, and missing assets fail closed", async () => {
  const asset = await createAsset();
  await assert.rejects(service.attachMediaAsset(asset.id, { entityType: "portfolio_project", entityId: "bad", slot: "thumbnail" }));
  await assert.rejects(service.attachMediaAsset(asset.id, { entityType: "portfolio_project", entityId: await createProject(), slot: "poster" }));
  await assert.rejects(service.attachMediaAsset(asset.id, { entityType: "portfolio_project", entityId: generateAssetId(), slot: "thumbnail" }), { name: "MediaOwnerNotFoundError" });
  await assert.rejects(service.attachMediaAsset(generateAssetId(), { entityType: "portfolio_project", entityId: await createProject(), slot: "thumbnail" }), { name: "MediaAssetNotFoundError" });
});

test("exclusive owner-slot uniqueness prevents competing claims", async () => {
  const project = await createProject();
  const first = await createAsset();
  const second = await createAsset();
  const subject = { entityType: "portfolio_project" as const, entityId: project, slot: "thumbnail" as const };
  const results = await Promise.allSettled([
    service.attachMediaAsset(first.id, subject),
    service.attachMediaAsset(second.id, subject),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  const rejected = results.find((result): result is PromiseRejectedResult => result.status === "rejected");
  assert.equal(rejected?.reason?.name, "MediaSlotOccupiedError");
  assert.equal((await pool.query("SELECT count(*)::int AS count FROM media_asset_references WHERE portfolio_project_id=$1 AND slot='thumbnail'", [project])).rows[0].count, 1);
});

test("one asset may be shared across distinct slots and positive references preserve attached state", async () => {
  const firstProject = await createProject();
  const secondProject = await createProject();
  const asset = await createAsset();
  const first = { entityType: "portfolio_project" as const, entityId: firstProject, slot: "thumbnail" as const };
  const second = { entityType: "portfolio_project" as const, entityId: secondProject, slot: "video" as const };
  assert.equal(await service.attachMediaAsset(asset.id, first), 1);
  assert.equal(await service.attachMediaAsset(asset.id, second), 2);
  assert.deepEqual(await service.detachMediaAsset(asset.id, first), { referenceCount: 1, state: "attached" });
  assert.equal((await service.readMediaAsset(asset.id))?.state, "attached");
});

test("detaching the final reference atomically transitions the asset to orphaned", async () => {
  const project = await createProject();
  const asset = await createAsset();
  const subject = { entityType: "portfolio_project" as const, entityId: project, slot: "video" as const };
  await service.attachMediaAsset(asset.id, subject);
  assert.deepEqual(await service.detachMediaAsset(asset.id, subject), { referenceCount: 0, state: "orphaned" });
  assert.equal(await service.countMediaAssetReferences(asset.id), 0);
});

test("live references restrict asset-row deletion", async () => {
  const project = await createProject();
  const asset = await createAsset();
  await service.attachMediaAsset(asset.id, { entityType: "portfolio_project", entityId: project, slot: "thumbnail" });
  await assert.rejects(pool.query("DELETE FROM media_assets WHERE id=$1", [asset.id]));
  assert.equal((await service.readMediaAsset(asset.id))?.state, "attached");
});

test("owner deletion cascades references but retains and orphans the provider asset", async () => {
  const project = await createProject();
  const asset = await createAsset();
  await service.attachMediaAsset(asset.id, { entityType: "portfolio_project", entityId: project, slot: "thumbnail" });
  await pool.query("DELETE FROM portfolio_projects WHERE id=$1", [project]);
  assert.equal(await service.countMediaAssetReferences(asset.id), 0);
  assert.equal((await service.readMediaAsset(asset.id))?.state, "orphaned");
});

test("reference FK rejects nonexistent assets and owner consistency CHECK rejects malformed polymorphism", async () => {
  const project = await createProject();
  await assert.rejects(pool.query("INSERT INTO media_asset_references(id,asset_id,owner_type,portfolio_project_id,slot) VALUES ($1,$2,'portfolio_project',$3,'thumbnail')", [generateAssetId(), generateAssetId(), project]));
  const asset = await createAsset();
  await assert.rejects(pool.query("INSERT INTO media_asset_references(id,asset_id,owner_type,portfolio_project_id,showreel_id,slot) VALUES ($1,$2,'portfolio_project',$3,$4,'thumbnail')", [generateAssetId(), asset.id, project, showreelId]));
});

test("prepared slots require exact canonical ID URL kind and attachable state", async () => {
  const asset = await createAsset();
  const { withCmsTransaction } = await import("./index");
  const prepared = await withCmsTransaction((tx) => service.prepareMediaSlot(tx, { assetId: asset.id, url: asset.url, kind: "image" }));
  assert.deepEqual(prepared, { assetId: asset.id, url: asset.url, kind: "image" });
  await assert.rejects(withCmsTransaction((tx) => service.prepareMediaSlot(tx, { assetId: asset.id, url: "https://example.test/wrong", kind: "image" })), { name: "MediaAssetBindingError" });
  await assert.rejects(withCmsTransaction((tx) => service.prepareMediaSlot(tx, { assetId: asset.id, url: asset.url, kind: "video" })), { name: "MediaAssetBindingError" });
});

test("transactional slot synchronization replaces ownership and orphans only the unshared old asset", async () => {
  const project = await createProject();
  const oldAsset = await createAsset();
  const newAsset = await createAsset();
  const { withCmsTransaction } = await import("./index");
  const subject = { entityType: "portfolio_project" as const, entityId: project, slot: "thumbnail" as const };
  await service.attachMediaAsset(oldAsset.id, subject);
  await withCmsTransaction(async (tx) => {
    const prepared = await service.prepareMediaSlot(tx, { assetId: newAsset.id, url: newAsset.url, kind: "image" });
    await service.synchronizeMediaSlot(tx, subject, prepared);
  });
  assert.equal((await service.readMediaAsset(oldAsset.id))?.state, "orphaned");
  assert.equal((await service.readMediaAsset(newAsset.id))?.state, "attached");
  assert.equal((await pool.query("SELECT asset_id FROM media_asset_references WHERE portfolio_project_id=$1 AND slot='thumbnail'", [project])).rows[0].asset_id, newAsset.id);
});

test("URL-only external replacement detaches ownership without ever claiming the URL", async () => {
  const project = await createProject();
  const asset = await createAsset();
  const subject = { entityType: "portfolio_project" as const, entityId: project, slot: "video" as const };
  await service.attachMediaAsset(asset.id, subject);
  const { withCmsTransaction } = await import("./index");
  await withCmsTransaction(async (tx) => service.synchronizeMediaSlot(tx, subject, await service.prepareMediaSlot(tx, { url: "https://youtube.example/watch/1", kind: "video" })));
  assert.equal(await service.countMediaAssetReferences(asset.id), 0);
  assert.equal((await service.readMediaAsset(asset.id))?.state, "orphaned");
});

test("mocked provider success and not-found both complete deletion idempotently", async () => {
  for (const signal of ["success", "not_found"] as const) {
    const asset = await createAsset();
    await pool.query("UPDATE media_assets SET state='orphaned' WHERE id=$1", [asset.id]);
    const keys: string[] = [];
    assert.equal((await service.deleteOrphanedMediaAsset(asset.id, { deleteOwnedKey: async (key) => { keys.push(key); return signal; } })).status, "deleted");
    assert.deepEqual(keys, [asset.providerKey]);
    assert.equal((await service.deleteOrphanedMediaAsset(asset.id, { deleteOwnedKey: async () => { throw new Error("must not call"); } })).status, "already_deleted");
  }
});

test("retryable permanent and unknown provider results persist bounded retryable failure codes", async () => {
  for (const signal of ["retryable_failure", "permanent_failure", "unknown_outcome"] as const) {
    const asset = await createAsset();
    await pool.query("UPDATE media_assets SET state='orphaned' WHERE id=$1", [asset.id]);
    const result = await service.deleteOrphanedMediaAsset(asset.id, { deleteOwnedKey: async () => signal });
    assert.deepEqual(result, { status: "delete_failed", errorCode: signal });
    const row = (await pool.query("SELECT state,delete_attempts,last_delete_error_code FROM media_assets WHERE id=$1", [asset.id])).rows[0];
    assert.equal(row.state, "delete_failed"); assert.equal(row.delete_attempts, 1); assert.equal(row.last_delete_error_code, signal);
  }
});

test("provider throw remains unknown and a later retry can confirm deletion", async () => {
  const asset = await createAsset();
  await pool.query("UPDATE media_assets SET state='orphaned' WHERE id=$1", [asset.id]);
  assert.deepEqual(await service.deleteOrphanedMediaAsset(asset.id, { deleteOwnedKey: async () => { throw new Error("timeout"); } }), { status: "delete_failed", errorCode: "unknown_outcome" });
  assert.equal((await service.deleteOrphanedMediaAsset(asset.id, { deleteOwnedKey: async () => "success" })).status, "deleted");
  assert.equal((await pool.query("SELECT delete_attempts FROM media_assets WHERE id=$1", [asset.id])).rows[0].delete_attempts, 2);
});

test("live references and pending assets block provider deletion before any provider call", async () => {
  const project = await createProject();
  const attached = await createAsset();
  await service.attachMediaAsset(attached.id, { entityType: "portfolio_project", entityId: project, slot: "thumbnail" });
  const pending = await createAsset();
  let calls = 0;
  const provider = { deleteOwnedKey: async () => { calls += 1; return "success" as const; } };
  await assert.rejects(service.deleteOrphanedMediaAsset(attached.id, provider), { name: "MediaAssetDeleteNotEligibleError" });
  await assert.rejects(service.deleteOrphanedMediaAsset(pending.id, provider), { name: "MediaAssetDeleteNotEligibleError" });
  assert.equal(calls, 0);
});

test("concurrent delete claimers serialize and invoke the mocked provider exactly once", async () => {
  const asset = await createAsset();
  await pool.query("UPDATE media_assets SET state='orphaned' WHERE id=$1", [asset.id]);
  let calls = 0;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const provider = { deleteOwnedKey: async () => { calls += 1; await gate; return "success" as const; } };
  const first = service.deleteOrphanedMediaAsset(asset.id, provider);
  while (calls === 0) await new Promise((resolve) => setTimeout(resolve, 5));
  const second = await service.deleteOrphanedMediaAsset(asset.id, provider);
  assert.equal(second.status, "busy");
  release();
  assert.equal((await first).status, "deleted");
  assert.equal(calls, 1);
});
test("Project service atomically persists canonical URLs and both owned slot references", async () => {
  const portfolio = await import("./portfolio-service");
  const thumbnail = await createAsset();
  const video = await createAsset({ kind: "video" });
  const id = await portfolio.createPortfolioProject({ title: "Owned Project", slug: `owned-${thumbnail.id}`, clientName: "", year: 2026, categoryId: "", description: "", challenge: "", approach: "", result: "", thumbnailUrl: thumbnail.url!, thumbnailAssetId: thumbnail.id, videoUrl: video.url!, videoAssetId: video.id, isFeatured: false, status: "draft", seoTitle: "", seoDescription: "", tools: [] });
  const row = (await pool.query("SELECT thumbnail_url,video_url FROM portfolio_projects WHERE id=$1", [id])).rows[0];
  assert.equal(row.thumbnail_url, thumbnail.url); assert.equal(row.video_url, video.url);
  assert.equal((await pool.query("SELECT count(*)::int AS count FROM media_asset_references WHERE portfolio_project_id=$1", [id])).rows[0].count, 2);
});

test("stale Project revision rolls back all proposed media ownership changes", async () => {
  const portfolio = await import("./portfolio-service");
  const project = await createProject();
  const oldAsset = await createAsset();
  const proposed = await createAsset();
  await service.attachMediaAsset(oldAsset.id, { entityType: "portfolio_project", entityId: project, slot: "thumbnail" });
  await pool.query("UPDATE portfolio_projects SET revision=2 WHERE id=$1", [project]);
  await assert.rejects(portfolio.updatePortfolioProject(project, 1, { title: "Stale", slug: `stale-${project}`, clientName: "", year: 2026, categoryId: "", description: "", challenge: "", approach: "", result: "", thumbnailUrl: proposed.url!, thumbnailAssetId: proposed.id, videoUrl: "", videoAssetId: "", isFeatured: false, status: "draft", seoTitle: "", seoDescription: "", tools: [] }), { name: "StaleRevisionError" });
  assert.equal((await pool.query("SELECT asset_id FROM media_asset_references WHERE portfolio_project_id=$1 AND slot='thumbnail'", [project])).rows[0].asset_id, oldAsset.id);
  assert.equal((await service.readMediaAsset(oldAsset.id))?.state, "attached");
  assert.equal((await service.readMediaAsset(proposed.id))?.state, "pending");
});

test("Showreel service atomically replaces both canonical owned slots", async () => {
  const singleton = await import("./singleton-content-service");
  const thumbnail = await createAsset();
  const video = await createAsset({ kind: "video" });
  const revision = (await pool.query("SELECT revision FROM showreels WHERE id=$1", [showreelId])).rows[0].revision;
  const next = await singleton.upsertSingletonShowreel({ title: "Owned Showreel", thumbnailUrl: thumbnail.url, thumbnailAssetId: thumbnail.id, videoUrl: video.url!, videoAssetId: video.id, duration: "1:00", isFeatured: true, status: "draft" }, revision);
  assert.equal(next, revision + 1);
  const refs = await pool.query("SELECT slot,asset_id FROM media_asset_references WHERE showreel_id=$1 ORDER BY slot", [showreelId]);
  assert.deepEqual(refs.rows, [{ slot: "thumbnail", asset_id: thumbnail.id }, { slot: "video", asset_id: video.id }]);
});
test("replacement versus final detach serializes on old asset and ends orphaned", async () => {
  const firstOwner = await createProject();
  const secondOwner = await createProject();
  const oldAsset = await createAsset();
  const newAsset = await createAsset();
  const firstSubject = { entityType: "portfolio_project" as const, entityId: firstOwner, slot: "thumbnail" as const };
  const secondSubject = { entityType: "portfolio_project" as const, entityId: secondOwner, slot: "thumbnail" as const };
  await service.attachMediaAsset(oldAsset.id, firstSubject);
  await service.attachMediaAsset(oldAsset.id, secondSubject);
  const { withCmsTransaction } = await import("./index");
  let releaseFirst!: () => void;
  let announceFirst!: (pid: number) => void;
  let announceSecond!: (pid: number) => void;
  const firstLocked = new Promise<number>((resolve) => { announceFirst = resolve; });
  const secondAttempting = new Promise<number>((resolve) => { announceSecond = resolve; });
  const release = new Promise<void>((resolve) => { releaseFirst = resolve; });
  const replacement = withCmsTransaction(async (tx) => {
    const prepared = await service.prepareMediaSlot(tx, { assetId: newAsset.id, url: newAsset.url, kind: "image" });
    await service.synchronizeMediaSlot(tx, firstSubject, prepared, {
      afterAssetLocks: async (pid) => { announceFirst(pid); await secondAttempting; },
    });
  });
  const firstPid = await firstLocked;
  const detach = service.detachMediaAsset(oldAsset.id, secondSubject, {
    beforeAssetLocks: async (pid) => { announceSecond(pid); await release; },
  });
  const secondPid = await secondAttempting;
  assert.notEqual(firstPid, secondPid);
  releaseFirst();
  await Promise.all([replacement, detach]);
  assert.equal(await service.countMediaAssetReferences(oldAsset.id), 0);
  assert.equal((await service.readMediaAsset(oldAsset.id))?.state, "orphaned");
  assert.equal((await pool.query("SELECT asset_id FROM media_asset_references WHERE portfolio_project_id=$1 AND slot='thumbnail'", [firstOwner])).rows[0].asset_id, newAsset.id);
});

test("two final shared detaches use distinct backends and end zero-reference orphaned", async () => {
  const firstOwner = await createProject();
  const secondOwner = await createProject();
  const asset = await createAsset();
  const firstSubject = { entityType: "portfolio_project" as const, entityId: firstOwner, slot: "thumbnail" as const };
  const secondSubject = { entityType: "portfolio_project" as const, entityId: secondOwner, slot: "thumbnail" as const };
  await service.attachMediaAsset(asset.id, firstSubject);
  await service.attachMediaAsset(asset.id, secondSubject);
  let announceFirst!: (pid: number) => void;
  let announceSecond!: (pid: number) => void;
  let releaseFirst!: () => void;
  const firstLocked = new Promise<number>((resolve) => { announceFirst = resolve; });
  const secondAttempting = new Promise<number>((resolve) => { announceSecond = resolve; });
  const release = new Promise<void>((resolve) => { releaseFirst = resolve; });
  const first = service.detachMediaAsset(asset.id, firstSubject, { afterAssetLocks: async (pid) => { announceFirst(pid); await secondAttempting; } });
  const firstPid = await firstLocked;
  const second = service.detachMediaAsset(asset.id, secondSubject, { beforeAssetLocks: async (pid) => { announceSecond(pid); await release; } });
  const secondPid = await secondAttempting;
  assert.notEqual(firstPid, secondPid);
  releaseFirst();
  await Promise.all([first, second]);
  assert.equal(await service.countMediaAssetReferences(asset.id), 0);
  assert.equal((await service.readMediaAsset(asset.id))?.state, "orphaned");
});

test("concurrent shared detach preserves attached while a legitimate reference remains", async () => {
  const owners = await Promise.all([createProject(), createProject(), createProject()]);
  const asset = await createAsset();
  const subjects = owners.map((entityId) => ({ entityType: "portfolio_project" as const, entityId, slot: "thumbnail" as const }));
  for (const subject of subjects) await service.attachMediaAsset(asset.id, subject);
  let announceFirst!: (pid: number) => void;
  let announceSecond!: (pid: number) => void;
  let releaseFirst!: () => void;
  const firstLocked = new Promise<number>((resolve) => { announceFirst = resolve; });
  const secondAttempting = new Promise<number>((resolve) => { announceSecond = resolve; });
  const release = new Promise<void>((resolve) => { releaseFirst = resolve; });
  const first = service.detachMediaAsset(asset.id, subjects[0], { afterAssetLocks: async (pid) => { announceFirst(pid); await secondAttempting; } });
  const firstPid = await firstLocked;
  const second = service.detachMediaAsset(asset.id, subjects[1], { beforeAssetLocks: async (pid) => { announceSecond(pid); await release; } });
  const secondPid = await secondAttempting;
  assert.notEqual(firstPid, secondPid);
  releaseFirst();
  await Promise.all([first, second]);
  assert.equal(await service.countMediaAssetReferences(asset.id), 1);
  assert.equal((await service.readMediaAsset(asset.id))?.state, "attached");
});

const cleanupPolicy = { pendingAgeMs: 60_000, orphanAgeMs: 60_000, retryBaseDelayMs: 1_000, retryMaxDelayMs: 8_000, maxDeleteAttempts: 4, batchSize: 10 };
async function isolateCleanupCandidates() {
  await pool.query("UPDATE media_assets SET updated_at=now(),last_delete_attempt_at=now() WHERE state <> 'deleted'");
}
async function ageAsset(id: string, state?: string) {
  await pool.query("UPDATE media_assets SET state=COALESCE($2,state),updated_at=now()-interval '2 minutes' WHERE id=$1", [id, state ?? null]);
}
async function clearSettingsHeroFixture() {
  await pool.query("DELETE FROM media_asset_references WHERE site_settings_id=$1", [settingsId]);
}

function settingsInput(heroImageUrl = "", heroImageAssetId = ""): import("../validations/settings").SettingsInput {
  return {
    siteName: "Phase 3H Settings", logoText: "LS", contactEmail: "phase3h@example.test", contactPhone: "", whatsapp: "",
    location: "India", availability: "Available", paymentTerms: "", turnaroundTime: "", heroHeading: "Hero",
    heroSubheading: "Sub", heroDescription: "Description", heroImageUrl, heroImageAssetId, statYears: "1",
    statProjects: "1", statClients: "1", statViews: "1", footerDescription: "Footer", instagramUrl: "",
    twitterUrl: "", youtubeUrl: "", linkedinUrl: "", behanceUrl: "", vimeoUrl: "", seoTitle: "SEO", seoDescription: "",
  };
}

async function resetSettingsHero(heroImageUrl: string | null = null, revision = 1) {
  await pool.query(
    "INSERT INTO site_settings(id,hero_image_url,revision) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET hero_image_url=EXCLUDED.hero_image_url,revision=EXCLUDED.revision",
    [settingsId, heroImageUrl, revision]
  );
  await clearSettingsHeroFixture();
}

async function settingsHeroState() {
  const settings = (await pool.query("SELECT hero_image_url,revision FROM site_settings WHERE id=$1", [settingsId])).rows[0];
  const references = (await pool.query("SELECT asset_id FROM media_asset_references WHERE site_settings_id=$1 AND slot='hero_image'", [settingsId])).rows;
  return { settings, references };
}

async function waitForBackendBlockedBy(blockerPid: number): Promise<number> {
  for (let attempt = 0; attempt < 200; attempt++) {
    const result = await pool.query<{ pid: number }>(
      `SELECT pid FROM pg_stat_activity
       WHERE datname=current_database() AND pid<>pg_backend_pid() AND $1=ANY(pg_blocking_pids(pid))
       ORDER BY pid LIMIT 1`,
      [blockerPid]
    );
    if (result.rows[0]) return result.rows[0].pid;
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
  throw new Error("Timed out waiting for the expected PostgreSQL lock waiter.");
}

test("bounded cleanup deterministically discards stale null pending and deletes only the oldest provider-backed candidates", async () => {
  await isolateCleanupCandidates();
  const nullPending = await createPendingAsset();
  const oldest = await createAsset();
  const middle = await createAsset();
  const newest = await createAsset();
  await pool.query("UPDATE media_assets SET updated_at=now()-interval '6 minutes' WHERE id=$1", [nullPending.id]);
  for (const [asset, minutes] of [[oldest, 5], [middle, 4], [newest, 3]] as const) {
    await pool.query("UPDATE media_assets SET state='orphaned',updated_at=now()-($2::text || ' minutes')::interval WHERE id=$1", [asset.id, minutes]);
  }
  const keys: string[] = [];
  const result = await service.runMediaAssetCleanup({
    provider: { deleteOwnedKey: async (key) => { keys.push(key); return "success"; } },
    policy: { ...cleanupPolicy, batchSize: 3 },
  });
  assert.equal(result.claimed, 3);
  assert.equal(result.discarded, 1);
  assert.deepEqual(keys, [oldest.providerKey, middle.providerKey]);
  assert.equal(await service.readMediaAsset(nullPending.id), null);
  assert.equal((await service.readMediaAsset(newest.id))?.state, "orphaned");
});

test("fresh, attached, deleted, and live/shared assets are excluded without provider calls", async () => {
  await isolateCleanupCandidates();
  const fresh = await createAsset();
  const shared = await createAsset();
  const owners = await Promise.all([createProject(), createProject()]);
  await service.attachMediaAsset(shared.id, { entityType: "portfolio_project", entityId: owners[0], slot: "thumbnail" });
  await service.attachMediaAsset(shared.id, { entityType: "portfolio_project", entityId: owners[1], slot: "video" });
  await pool.query("UPDATE media_assets SET state='orphaned',updated_at=now()-interval '2 minutes' WHERE id=$1", [shared.id]);
  let calls = 0;
  const result = await service.runMediaAssetCleanup({ provider: { deleteOwnedKey: async () => { calls++; return "success"; } }, policy: cleanupPolicy });
  assert.equal(calls, 0);
  assert.equal(result.claimed, 0);
  assert.equal((await service.readMediaAsset(fresh.id))?.state, "pending");
  assert.equal((await service.readMediaAsset(shared.id))?.state, "attached");
  assert.equal(await service.countMediaAssetReferences(shared.id), 2);
});

test("retry backoff prevents hot loops and later retry normalizes provider outcomes", async () => {
  await isolateCleanupCandidates();
  const asset = await createAsset();
  await pool.query("UPDATE media_assets SET state='delete_failed',delete_attempts=1,last_delete_attempt_at=now(),last_delete_error_code='retryable_failure' WHERE id=$1", [asset.id]);
  let calls = 0;
  assert.equal((await service.runMediaAssetCleanup({ provider: { deleteOwnedKey: async () => { calls++; return "success"; } }, policy: cleanupPolicy })).claimed, 0);
  await pool.query("UPDATE media_assets SET last_delete_attempt_at=now()-interval '2 seconds' WHERE id=$1", [asset.id]);
  assert.equal((await service.runMediaAssetCleanup({ provider: { deleteOwnedKey: async () => { calls++; return "not_found"; } }, policy: cleanupPolicy })).deleted, 1);
  assert.equal(calls, 1);
  assert.equal((await service.readMediaAsset(asset.id))?.state, "deleted");
});

test("provider failure and exception become stable retryable database outcomes", async () => {
  for (const expected of ["permanent_failure", "unknown_outcome"] as const) {
    await isolateCleanupCandidates();
    const asset = await createAsset();
    await ageAsset(asset.id, "orphaned");
    const result = await service.runMediaAssetCleanup({
      provider: { deleteOwnedKey: async () => { if (expected === "unknown_outcome") throw new Error("private timeout"); return expected; } },
      policy: cleanupPolicy,
    });
    assert.deepEqual(result.items, [{ assetId: asset.id, status: "delete_failed", errorCode: expected }]);
    const row = (await pool.query("SELECT state,last_delete_error_code FROM media_assets WHERE id=$1", [asset.id])).rows[0];
    assert.deepEqual(row, { state: "delete_failed", last_delete_error_code: expected });
  }
});

test("concurrent cleanup workers partition claims and never invoke provider twice for one asset", async () => {
  await isolateCleanupCandidates();
  const asset = await createAsset();
  await ageAsset(asset.id, "orphaned");
  let locked!: (pid: number) => void;
  let release!: () => void;
  const lockedPromise = new Promise<number>((resolve) => { locked = resolve; });
  const releasePromise = new Promise<void>((resolve) => { release = resolve; });
  let calls = 0;
  const provider = { deleteOwnedKey: async () => { calls++; return "success" as const; } };
  const first = service.runMediaAssetCleanup({ provider, policy: cleanupPolicy, synchronization: { afterCandidateLocks: async (pid, ids) => { if (ids.includes(asset.id)) { locked(pid); await releasePromise; } } } });
  const firstPid = await lockedPromise;
  let secondPid = 0;
  const second = await service.runMediaAssetCleanup({ provider, policy: cleanupPolicy, synchronization: { afterCandidateLocks: async (pid) => { secondPid = pid; } } });
  assert.notEqual(firstPid, secondPid);
  assert.equal(second.claimed, 0);
  release();
  assert.equal((await first).deleted, 1);
  assert.equal(calls, 1);
});

test("cleanup claim and attachment serialize: cleanup-winning deleting state rejects attachment", async () => {
  await isolateCleanupCandidates();
  const asset = await createAsset();
  const project = await createProject();
  await ageAsset(asset.id, "orphaned");
  let locked!: (pid: number) => void;
  let release!: () => void;
  const lockedPromise = new Promise<number>((resolve) => { locked = resolve; });
  const releasePromise = new Promise<void>((resolve) => { release = resolve; });
  let providerCalls = 0;
  const cleanup = service.runMediaAssetCleanup({
    provider: { deleteOwnedKey: async () => { providerCalls++; return "success"; } },
    policy: cleanupPolicy,
    synchronization: { afterCandidateLocks: async (pid, ids) => { if (ids.includes(asset.id)) { locked(pid); await releasePromise; } } },
  });
  await lockedPromise;
  const attachment = service.attachMediaAsset(asset.id, { entityType: "portfolio_project", entityId: project, slot: "thumbnail" });
  release();
  await assert.rejects(attachment, { name: "MediaAssetNotAttachableError" });
  assert.equal((await cleanup).deleted, 1);
  assert.equal(providerCalls, 1);
  assert.equal(await service.countMediaAssetReferences(asset.id), 0);
});

test("delete_failed attachment remains denied while its cleanup retry stays possible", async () => {
  await isolateCleanupCandidates();
  const asset = await createAsset();
  const project = await createProject();
  await pool.query("UPDATE media_assets SET state='delete_failed',delete_attempts=1,last_delete_attempt_at=now()-interval '2 seconds',last_delete_error_code='unknown_outcome' WHERE id=$1", [asset.id]);
  await assert.rejects(service.attachMediaAsset(asset.id, { entityType: "portfolio_project", entityId: project, slot: "thumbnail" }), { name: "MediaAssetNotAttachableError" });
  assert.equal(await service.countMediaAssetReferences(asset.id), 0);
  assert.equal((await service.runMediaAssetCleanup({ provider: { deleteOwnedKey: async () => "success" }, policy: cleanupPolicy })).deleted, 1);
});

test("reconciliation narrowly repairs attached zero-ref and orphaned live-ref states", async () => {
  await isolateCleanupCandidates();
  const zeroRef = await createAsset();
  await pool.query("UPDATE media_assets SET state='attached' WHERE id=$1", [zeroRef.id]);
  const liveRef = await createAsset();
  const project = await createProject();
  await service.attachMediaAsset(liveRef.id, { entityType: "portfolio_project", entityId: project, slot: "thumbnail" });
  await pool.query("UPDATE media_assets SET state='orphaned' WHERE id=$1", [liveRef.id]);
  assert.deepEqual(await service.reconcileMediaAssetLifecycle(10), { attached: 1, orphaned: 1, recovered: 0 });
  assert.equal((await service.readMediaAsset(zeroRef.id))?.state, "orphaned");
  assert.equal((await service.readMediaAsset(liveRef.id))?.state, "attached");
});

test("stale deleting claims recover as unknown outcomes without provider access", async () => {
  await isolateCleanupCandidates();
  const asset = await createAsset();
  await pool.query("UPDATE media_assets SET state='deleting',delete_attempts=1,last_delete_attempt_at=now()-interval '20 minutes',updated_at=now()-interval '20 minutes' WHERE id=$1", [asset.id]);
  assert.deepEqual(await service.reconcileMediaAssetLifecycle(10, new Date(), 15 * 60_000), { attached: 0, orphaned: 0, recovered: 1 });
  const row = (await pool.query("SELECT state,last_delete_error_code FROM media_assets WHERE id=$1", [asset.id])).rows[0];
  assert.deepEqual(row, { state: "delete_failed", last_delete_error_code: "unknown_outcome" });
});

test("attachment-winning serialization makes cleanup skip the live asset without provider work", async () => {
  await isolateCleanupCandidates();
  const asset = await createAsset();
  const project = await createProject();
  await ageAsset(asset.id, "orphaned");
  const { withCmsTransaction } = await import("./index");
  let locked!: (pid: number) => void;
  let release!: () => void;
  const lockedPromise = new Promise<number>((resolve) => { locked = resolve; });
  const releasePromise = new Promise<void>((resolve) => { release = resolve; });
  const attachment = withCmsTransaction(async (tx) => {
    const pid = (await tx.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid;
    await tx.query("SELECT id FROM media_assets WHERE id=$1 FOR UPDATE", [asset.id]);
    locked(pid);
    await releasePromise;
    await tx.query("INSERT INTO media_asset_references(id,asset_id,owner_type,portfolio_project_id,slot) VALUES ($1,$2,'portfolio_project',$3,'thumbnail')", [crypto.randomUUID(), asset.id, project]);
    await tx.query("UPDATE media_assets SET state='attached',updated_at=now() WHERE id=$1", [asset.id]);
  });
  const attachmentPid = await lockedPromise;
  let cleanupPid = 0;
  let calls = 0;
  const cleanup = await service.runMediaAssetCleanup({
    provider: { deleteOwnedKey: async () => { calls++; return "success"; } },
    policy: cleanupPolicy,
    synchronization: { afterCandidateLocks: async (pid) => { cleanupPid = pid; } },
  });
  assert.notEqual(attachmentPid, cleanupPid);
  assert.equal(cleanup.claimed, 0);
  release();
  await attachment;
  assert.equal(calls, 0);
  assert.equal(await service.countMediaAssetReferences(asset.id), 1);
  assert.equal((await service.readMediaAsset(asset.id))?.state, "attached");
});

test("Settings Hero cleanup-winning race rejects attachment under the authoritative asset lock", async () => {
  await isolateCleanupCandidates();
  await resetSettingsHero();
  const asset = await createAsset();
  await ageAsset(asset.id, "orphaned");
  const subject = { entityType: "site_settings" as const, entityId: settingsId, slot: "hero_image" as const };
  let cleanupLocked!: (pid: number) => void;
  let releaseCleanup!: () => void;
  const cleanupLockedPromise = new Promise<number>((resolve) => { cleanupLocked = resolve; });
  const releaseCleanupPromise = new Promise<void>((resolve) => { releaseCleanup = resolve; });
  const providerKeys: string[] = [];
  const cleanup = service.runMediaAssetCleanup({
    provider: { deleteOwnedKey: async (key) => { providerKeys.push(key); return "success"; } },
    policy: cleanupPolicy,
    synchronization: { afterCandidateLocks: async (pid, ids) => { if (ids.includes(asset.id)) { cleanupLocked(pid); await releaseCleanupPromise; } } },
  });
  const cleanupPid = await cleanupLockedPromise;
  const attachment = service.attachMediaAsset(asset.id, subject);
  const attachmentPid = await waitForBackendBlockedBy(cleanupPid);
  assert.notEqual(cleanupPid, attachmentPid);
  releaseCleanup();

  await assert.rejects(attachment, { name: "MediaAssetNotAttachableError" });
  assert.equal((await cleanup).deleted, 1);
  assert.deepEqual(providerKeys, [asset.providerKey]);
  assert.equal(await service.countMediaAssetReferences(asset.id), 0);
  assert.equal((await service.readMediaAsset(asset.id))?.state, "deleted");
  assert.deepEqual(await settingsHeroState(), { settings: { hero_image_url: null, revision: 1 }, references: [] });
});

test("Settings Hero attachment-winning race makes cleanup skip without provider work", async () => {
  await isolateCleanupCandidates();
  await resetSettingsHero();
  const asset = await createAsset();
  await ageAsset(asset.id, "orphaned");
  const subject = { entityType: "site_settings" as const, entityId: settingsId, slot: "hero_image" as const };
  const blocker = await pool.connect();
  let blockerPid = 0;
  try {
    await blocker.query("BEGIN");
    blockerPid = (await blocker.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid;
    await blocker.query("SELECT id FROM media_assets WHERE id=$1 FOR UPDATE", [asset.id]);
    const attachment = service.attachMediaAsset(asset.id, subject);
    const attachmentPid = await waitForBackendBlockedBy(blockerPid);
    assert.notEqual(blockerPid, attachmentPid);
    let cleanupPid = 0;
    let providerCalls = 0;
    const cleanup = await service.runMediaAssetCleanup({
      provider: { deleteOwnedKey: async () => { providerCalls++; return "success"; } },
      policy: cleanupPolicy,
      synchronization: { afterCandidateLocks: async (pid) => { cleanupPid = pid; } },
    });
    assert.notEqual(cleanupPid, blockerPid);
    assert.notEqual(cleanupPid, attachmentPid);
    assert.equal(cleanup.claimed, 0);
    assert.equal(providerCalls, 0);
    await blocker.query("COMMIT");
    await attachment;
  } finally {
    if (blockerPid !== 0) await blocker.query("ROLLBACK").catch(() => undefined);
    blocker.release();
  }
  const reference = (await pool.query(
    "SELECT owner_type,site_settings_id,slot FROM media_asset_references WHERE asset_id=$1",
    [asset.id]
  )).rows;
  assert.deepEqual(reference, [{ owner_type: "site_settings", site_settings_id: settingsId, slot: "hero_image" }]);
  assert.equal(await service.countMediaAssetReferences(asset.id), 1);
  assert.equal((await service.readMediaAsset(asset.id))?.state, "attached");
  assert.equal(asset.kind, "image");
  assert.equal(asset.providerKey, `cms-media/${asset.id}/image`);
});

test("Settings Hero ownership attaches only an image to the singleton hero_image slot", async () => {
  await clearSettingsHeroFixture();
  const asset = await createAsset();
  const video = await createAsset({ kind: "video" });
  const subject = { entityType: "site_settings" as const, entityId: settingsId, slot: "hero_image" as const };
  await assert.rejects(service.attachMediaAsset(video.id, subject), { name: "MediaAssetBindingError" });
  assert.equal(await service.attachMediaAsset(asset.id, subject), 1);
  const reference = (await pool.query("SELECT owner_type,site_settings_id,slot FROM media_asset_references WHERE asset_id=$1", [asset.id])).rows[0];
  assert.deepEqual(reference, { owner_type: "site_settings", site_settings_id: settingsId, slot: "hero_image" });
  assert.equal((await service.readMediaAsset(asset.id))?.state, "attached");
});

test("Settings Hero constraints reject duplicate slots and malformed mixed owners", async () => {
  await clearSettingsHeroFixture();
  const first = await createAsset();
  const second = await createAsset();
  const project = await createProject();
  const subject = { entityType: "site_settings" as const, entityId: settingsId, slot: "hero_image" as const };
  await service.attachMediaAsset(first.id, subject);
  await assert.rejects(service.attachMediaAsset(second.id, subject), { name: "MediaSlotOccupiedError" });
  await assert.rejects(pool.query(
    "INSERT INTO media_asset_references(id,asset_id,owner_type,portfolio_project_id,site_settings_id,slot) VALUES ($1,$2,'site_settings',$3,$4,'hero_image')",
    [crypto.randomUUID(), second.id, project, settingsId]
  ));
  await assert.rejects(pool.query(
    "INSERT INTO media_asset_references(id,asset_id,owner_type,site_settings_id,slot) VALUES ($1,$2,'site_settings',$3,'video')",
    [crypto.randomUUID(), second.id, settingsId]
  ));
});

test("Settings Hero synchronization replaces canonically and preserves a shared old asset", async () => {
  await clearSettingsHeroFixture();
  const project = await createProject();
  const oldAsset = await createAsset();
  const newAsset = await createAsset();
  const settingsSubject = { entityType: "site_settings" as const, entityId: settingsId, slot: "hero_image" as const };
  await service.attachMediaAsset(oldAsset.id, settingsSubject);
  await service.attachMediaAsset(oldAsset.id, { entityType: "portfolio_project", entityId: project, slot: "thumbnail" });
  const { withCmsTransaction } = await import("./index");
  await withCmsTransaction(async (tx) => {
    const prepared = await service.prepareMediaSlot(tx, { assetId: newAsset.id, url: newAsset.url, kind: "image" });
    await service.synchronizeMediaSlot(tx, settingsSubject, prepared);
  });
  assert.equal((await service.readMediaAsset(oldAsset.id))?.state, "attached");
  assert.equal(await service.countMediaAssetReferences(oldAsset.id), 1);
  assert.equal((await service.readMediaAsset(newAsset.id))?.state, "attached");
  assert.equal((await pool.query("SELECT asset_id FROM media_asset_references WHERE site_settings_id=$1 AND slot='hero_image'", [settingsId])).rows[0].asset_id, newAsset.id);
});

test("final Settings Hero detach or singleton cascade preserves provider metadata as orphaned", async () => {
  await clearSettingsHeroFixture();
  const detached = await createAsset();
  const subject = { entityType: "site_settings" as const, entityId: settingsId, slot: "hero_image" as const };
  await service.attachMediaAsset(detached.id, subject);
  assert.deepEqual(await service.detachMediaAsset(detached.id, subject), { referenceCount: 0, state: "orphaned" });
  const cascaded = await createAsset();
  await service.attachMediaAsset(cascaded.id, subject);
  await pool.query("DELETE FROM site_settings WHERE id=$1", [settingsId]);
  assert.equal(await service.countMediaAssetReferences(cascaded.id), 0);
  assert.equal((await service.readMediaAsset(cascaded.id))?.state, "orphaned");
});

test("Settings update atomically replaces owned Hero media and orphans the final old reference", async () => {
  await resetSettingsHero();
  const oldAsset = await createAsset();
  const nextAsset = await createAsset();
  const subject = { entityType: "site_settings" as const, entityId: settingsId, slot: "hero_image" as const };
  await service.attachMediaAsset(oldAsset.id, subject);
  await pool.query("UPDATE site_settings SET hero_image_url=$2 WHERE id=$1", [settingsId, oldAsset.url]);

  assert.equal(await singleton.updateSingletonSettings(settingsInput(nextAsset.url!, nextAsset.id), 1), 2);
  assert.deepEqual(await settingsHeroState(), {
    settings: { hero_image_url: nextAsset.url, revision: 2 },
    references: [{ asset_id: nextAsset.id }],
  });
  assert.equal((await service.readMediaAsset(oldAsset.id))?.state, "orphaned");
  assert.equal((await service.readMediaAsset(nextAsset.id))?.state, "attached");
});

test("Settings update supports owned to external, external to owned, and owned to empty", async () => {
  const subject = { entityType: "site_settings" as const, entityId: settingsId, slot: "hero_image" as const };
  await resetSettingsHero();
  const first = await createAsset();
  await service.attachMediaAsset(first.id, subject);
  await pool.query("UPDATE site_settings SET hero_image_url=$2 WHERE id=$1", [settingsId, first.url]);
  assert.equal(await singleton.updateSingletonSettings(settingsInput("https://legacy.example.test/hero.webp"), 1), 2);
  assert.deepEqual((await settingsHeroState()).references, []);
  assert.equal((await service.readMediaAsset(first.id))?.state, "orphaned");

  const second = await createAsset();
  assert.equal(await singleton.updateSingletonSettings(settingsInput(second.url!, second.id), 2), 3);
  assert.equal((await settingsHeroState()).references[0].asset_id, second.id);
  assert.equal((await service.readMediaAsset(second.id))?.state, "attached");

  assert.equal(await singleton.updateSingletonSettings(settingsInput(), 3), 4);
  assert.deepEqual(await settingsHeroState(), { settings: { hero_image_url: null, revision: 4 }, references: [] });
  assert.equal((await service.readMediaAsset(second.id))?.state, "orphaned");
});

test("Settings same-asset save is idempotent and shared final detach remains attached", async () => {
  await resetSettingsHero();
  const asset = await createAsset();
  const project = await createProject();
  const subject = { entityType: "site_settings" as const, entityId: settingsId, slot: "hero_image" as const };
  await service.attachMediaAsset(asset.id, subject);
  await service.attachMediaAsset(asset.id, { entityType: "portfolio_project", entityId: project, slot: "thumbnail" });
  await pool.query("UPDATE site_settings SET hero_image_url=$2 WHERE id=$1", [settingsId, asset.url]);

  assert.equal(await singleton.updateSingletonSettings(settingsInput(asset.url!, asset.id), 1), 2);
  assert.equal(await service.countMediaAssetReferences(asset.id), 2);
  assert.equal((await settingsHeroState()).references.length, 1);
  assert.equal(await singleton.updateSingletonSettings(settingsInput(), 2), 3);
  assert.equal(await service.countMediaAssetReferences(asset.id), 1);
  assert.equal((await service.readMediaAsset(asset.id))?.state, "attached");
});

test("stale Settings revision fully rolls back URL, ownership, and lifecycle state", async () => {
  await resetSettingsHero(null, 2);
  const oldAsset = await createAsset();
  const proposed = await createAsset();
  const subject = { entityType: "site_settings" as const, entityId: settingsId, slot: "hero_image" as const };
  await service.attachMediaAsset(oldAsset.id, subject);
  await pool.query("UPDATE site_settings SET hero_image_url=$2 WHERE id=$1", [settingsId, oldAsset.url]);

  await assert.rejects(singleton.updateSingletonSettings(settingsInput(proposed.url!, proposed.id), 1), { name: "StaleRevisionError" });
  assert.deepEqual(await settingsHeroState(), {
    settings: { hero_image_url: oldAsset.url, revision: 2 }, references: [{ asset_id: oldAsset.id }],
  });
  assert.equal((await service.readMediaAsset(oldAsset.id))?.state, "attached");
  assert.equal((await service.readMediaAsset(proposed.id))?.state, "pending");
});

test("invalid URL, cross-asset URL, and video binding leave Settings unchanged", async () => {
  await resetSettingsHero("https://legacy.example.test/current.webp");
  const image = await createAsset();
  const other = await createAsset();
  const video = await createAsset({ kind: "video" });
  for (const [url, assetId] of [
    [other.url!, image.id],
    [video.url!, video.id],
  ] as const) {
    await assert.rejects(singleton.updateSingletonSettings(settingsInput(url, assetId), 1), { name: "MediaAssetBindingError" });
    assert.deepEqual(await settingsHeroState(), {
      settings: { hero_image_url: "https://legacy.example.test/current.webp", revision: 1 }, references: [],
    });
  }
});
