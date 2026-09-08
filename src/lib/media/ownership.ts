import { z } from "zod";
import { entityIdSchema } from "@/lib/validations/identifiers";
import { uploadKindSchema } from "@/lib/validations/upload";
import { externalWebUrlSchema, internalMediaPathSchema } from "@/lib/validations/urls";

export const ORIGINAL_FILENAME_MAX_LENGTH = 255;
export const STORAGE_KEY_MAX_LENGTH = 64;
export const STORAGE_KEY_PREFIX = "cms-media";

export const assetIdSchema = entityIdSchema.refine(
  (value) => value === value.toLowerCase(),
  "Asset ID must use canonical lowercase UUID form."
);

export type AssetId = z.infer<typeof assetIdSchema>;
type UploadKind = z.infer<typeof uploadKindSchema>;

export function generateAssetId(): AssetId {
  return assetIdSchema.parse(crypto.randomUUID());
}

const unsafeFilenameCharacters = /[\\/\u0000-\u001f\u007f]/;

export const originalFilenameSchema = z.string()
  .trim()
  .min(1, "Original filename is required.")
  .max(ORIGINAL_FILENAME_MAX_LENGTH, "Original filename is too long.")
  .refine((value) => value !== "." && value !== "..", "Original filename must name a file.")
  .refine((value) => !unsafeFilenameCharacters.test(value), "Original filename must not contain path separators or control characters.");

export type OriginalFilename = z.infer<typeof originalFilenameSchema>;

export function parseOriginalFilename(value: unknown): OriginalFilename {
  return originalFilenameSchema.parse(value);
}

const storageKeyPattern = /^cms-media\/([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\/(image|video)$/;

export const storageKeySchema = z.string()
  .max(STORAGE_KEY_MAX_LENGTH)
  .regex(storageKeyPattern, "Invalid canonical media storage key.");

export type CanonicalStorageKey = z.infer<typeof storageKeySchema>;

export function createStorageKey(assetId: unknown, kind: unknown): CanonicalStorageKey {
  const canonicalAssetId = assetIdSchema.parse(assetId);
  const canonicalKind = uploadKindSchema.parse(kind);
  return storageKeySchema.parse(`${STORAGE_KEY_PREFIX}/${canonicalAssetId}/${canonicalKind}`);
}

export function parseStorageKey(value: unknown): { assetId: AssetId; kind: UploadKind; key: CanonicalStorageKey } {
  const key = storageKeySchema.parse(value);
  const match = storageKeyPattern.exec(key);
  if (!match) throw new Error("Invalid canonical media storage key.");
  return { assetId: assetIdSchema.parse(match[1]), kind: uploadKindSchema.parse(match[2]), key };
}

const portfolioSubjectSchema = z.object({
  entityType: z.literal("portfolio_project"),
  entityId: entityIdSchema,
  slot: z.enum(["thumbnail", "video"]),
});

const showreelSubjectSchema = z.object({
  entityType: z.literal("showreel"),
  entityId: z.literal("singleton:showreel"),
  slot: z.enum(["thumbnail", "video"]),
});

const siteSettingsSubjectSchema = z.object({
  entityType: z.literal("site_settings"),
  entityId: z.literal("singleton:settings"),
  slot: z.literal("hero_image"),
});

export const mediaOwnershipSubjectSchema = z.discriminatedUnion("entityType", [
  portfolioSubjectSchema,
  showreelSubjectSchema,
  siteSettingsSubjectSchema,
]);

export type MediaOwnershipSubject = z.infer<typeof mediaOwnershipSubjectSchema>;

export const ASSET_LIFECYCLE_STATES = [
  "pending",
  "attached",
  "orphaned",
  "deleting",
  "delete_failed",
  "deleted",
] as const;

export const assetLifecycleStateSchema = z.enum(ASSET_LIFECYCLE_STATES);
export type AssetLifecycleState = z.infer<typeof assetLifecycleStateSchema>;
export const INITIAL_ASSET_LIFECYCLE_STATE: AssetLifecycleState = "pending";

export const ASSET_LIFECYCLE_EVENTS = [
  "attach",
  "detach",
  "abandon",
  "begin_delete",
  "delete_confirmed",
  "delete_failed",
  "delete_unknown",
  "retry_delete",
] as const;

export type AssetLifecycleEvent = (typeof ASSET_LIFECYCLE_EVENTS)[number];

const lifecycleTransitions: Readonly<Record<AssetLifecycleState, Partial<Record<AssetLifecycleEvent, AssetLifecycleState>>>> = {
  pending: { attach: "attached", abandon: "orphaned" },
  attached: { detach: "orphaned" },
  orphaned: { attach: "attached", begin_delete: "deleting" },
  deleting: { delete_confirmed: "deleted", delete_failed: "delete_failed", delete_unknown: "delete_failed" },
  delete_failed: { retry_delete: "deleting", delete_confirmed: "deleted" },
  deleted: {},
};

export type LifecycleTransitionDecision =
  | { allowed: true; from: AssetLifecycleState; event: AssetLifecycleEvent; to: AssetLifecycleState }
  | { allowed: false; from: AssetLifecycleState; event: AssetLifecycleEvent; reason: "illegal_transition" };

export function decideLifecycleTransition(from: AssetLifecycleState, event: AssetLifecycleEvent): LifecycleTransitionDecision {
  const to = lifecycleTransitions[from][event];
  return to
    ? { allowed: true, from, event, to }
    : { allowed: false, from, event, reason: "illegal_transition" };
}

export type MediaOwnershipClassification =
  | "owned_internal"
  | "external_https"
  | "legacy_internal"
  | "unmanaged";

export type OwnedAssetProof = { assetId: unknown; providerKey: unknown };

export function classifyMediaReference(reference: unknown, ownership?: OwnedAssetProof): MediaOwnershipClassification {
  if (ownership && assetIdSchema.safeParse(ownership.assetId).success && storageKeySchema.safeParse(ownership.providerKey).success) {
    const parsedKey = parseStorageKey(ownership.providerKey);
    if (parsedKey.assetId === ownership.assetId) return "owned_internal";
  }
  if (externalWebUrlSchema.safeParse(reference).success) return "external_https";
  if (internalMediaPathSchema.safeParse(reference).success) return "legacy_internal";
  return "unmanaged";
}

export const DELETE_DENIAL_REASONS = [
  "unauthorized",
  "invalid_asset_id",
  "missing_or_invalid_key",
  "key_asset_mismatch",
  "external_reference",
  "legacy_or_unmanaged_reference",
  "invalid_reference_count",
  "still_referenced",
  "state_not_deletable",
] as const;

export type DeleteEligibilityInput = {
  authorized: boolean;
  assetId: unknown;
  providerKey: unknown;
  classification: MediaOwnershipClassification;
  state: AssetLifecycleState;
  referenceCount: number;
};

export type DeleteEligibilityDecision =
  | { eligible: true; assetId: AssetId; providerKey: CanonicalStorageKey }
  | { eligible: false; reason: (typeof DELETE_DENIAL_REASONS)[number] };

export function decideDeleteEligibility(input: DeleteEligibilityInput): DeleteEligibilityDecision {
  if (!input.authorized) return { eligible: false, reason: "unauthorized" };
  const assetId = assetIdSchema.safeParse(input.assetId);
  if (!assetId.success) return { eligible: false, reason: "invalid_asset_id" };
  const providerKey = storageKeySchema.safeParse(input.providerKey);
  if (!providerKey.success) return { eligible: false, reason: "missing_or_invalid_key" };
  if (parseStorageKey(providerKey.data).assetId !== assetId.data) return { eligible: false, reason: "key_asset_mismatch" };
  if (input.classification === "external_https") return { eligible: false, reason: "external_reference" };
  if (input.classification !== "owned_internal") return { eligible: false, reason: "legacy_or_unmanaged_reference" };
  if (!Number.isSafeInteger(input.referenceCount) || input.referenceCount < 0) return { eligible: false, reason: "invalid_reference_count" };
  if (input.referenceCount > 0) return { eligible: false, reason: "still_referenced" };
  if (input.state !== "orphaned" && input.state !== "delete_failed") return { eligible: false, reason: "state_not_deletable" };
  return { eligible: true, assetId: assetId.data, providerKey: providerKey.data };
}

export type ReplacementOutcome = "committed" | "stale_revision" | "db_rejected";
export type CleanupOutcome = "not_attempted" | "success" | "not_found" | "retryable_failure" | "unknown_outcome" | "permanent_failure";

export type ReplacementDecision = {
  newAssetState: "attached" | "orphaned";
  oldAssetCleanupEligible: boolean;
  oldAssetState: "attached" | "orphaned" | "deleted" | "delete_failed";
};

export function decideReplacement(input: {
  outcome: ReplacementOutcome;
  oldClassification: MediaOwnershipClassification;
  oldReferenceCountAfterCommit: number;
  cleanupOutcome?: CleanupOutcome;
}): ReplacementDecision {
  if (input.outcome !== "committed") {
    return { newAssetState: "orphaned", oldAssetCleanupEligible: false, oldAssetState: "attached" };
  }
  const cleanupEligible = input.oldClassification === "owned_internal" && input.oldReferenceCountAfterCommit === 0;
  if (!cleanupEligible) return { newAssetState: "attached", oldAssetCleanupEligible: false, oldAssetState: "attached" };
  if (input.cleanupOutcome === "success" || input.cleanupOutcome === "not_found") {
    return { newAssetState: "attached", oldAssetCleanupEligible: true, oldAssetState: "deleted" };
  }
  if (input.cleanupOutcome && input.cleanupOutcome !== "not_attempted") {
    return { newAssetState: "attached", oldAssetCleanupEligible: true, oldAssetState: "delete_failed" };
  }
  return { newAssetState: "attached", oldAssetCleanupEligible: true, oldAssetState: "orphaned" };
}

export type ProviderDeleteResult =
  | { status: "confirmed_deleted" }
  | { status: "retryable_failure" }
  | { status: "unknown_outcome" }
  | { status: "permanent_failure" };

export type ProviderDeleteSignal = "success" | "not_found" | "retryable_failure" | "unknown_outcome" | "permanent_failure";

export function classifyProviderDeleteResult(signal: ProviderDeleteSignal): ProviderDeleteResult {
  if (signal === "success" || signal === "not_found") return { status: "confirmed_deleted" };
  return { status: signal };
}

export interface OwnedMediaProvider {
  deleteOwnedKey(key: CanonicalStorageKey): Promise<ProviderDeleteSignal>;
}

export type SafeProviderDeleteResponse = ProviderDeleteResult & { message: string };

export async function deleteEligibleAsset(
  provider: OwnedMediaProvider,
  decision: DeleteEligibilityDecision
): Promise<SafeProviderDeleteResponse> {
  if (!decision.eligible) return { status: "permanent_failure", message: "Media deletion is not permitted." };
  try {
    const result = classifyProviderDeleteResult(await provider.deleteOwnedKey(decision.providerKey));
    return { ...result, message: result.status === "confirmed_deleted" ? "Media deleted." : "Media deletion could not be confirmed." };
  } catch {
    return { status: "unknown_outcome", message: "Media deletion could not be confirmed." };
  }
}

export type OrphanEligibilityDecision =
  | { eligible: true }
  | { eligible: false; reason: "invalid_time" | "invalid_reference_count" | "too_young" | "still_referenced" | "not_owned" | "state_not_eligible" | "missing_or_invalid_key" };

export function decideOrphanCleanupEligibility(input: {
  nowMs: number;
  eligibleAfterMs: number;
  stateChangedAtMs: number;
  referenceCount: number;
  classification: MediaOwnershipClassification;
  providerKey: unknown;
  state: AssetLifecycleState;
}): OrphanEligibilityDecision {
  if (![input.nowMs, input.eligibleAfterMs, input.stateChangedAtMs].every(Number.isSafeInteger) || input.eligibleAfterMs < 0 || input.nowMs < input.stateChangedAtMs) {
    return { eligible: false, reason: "invalid_time" };
  }
  if (!Number.isSafeInteger(input.referenceCount) || input.referenceCount < 0) return { eligible: false, reason: "invalid_reference_count" };
  if (input.referenceCount > 0) return { eligible: false, reason: "still_referenced" };
  if (input.classification !== "owned_internal") return { eligible: false, reason: "not_owned" };
  if (input.state !== "pending" && input.state !== "orphaned" && input.state !== "delete_failed") {
    return { eligible: false, reason: "state_not_eligible" };
  }
  if (!storageKeySchema.safeParse(input.providerKey).success) return { eligible: false, reason: "missing_or_invalid_key" };
  if (input.nowMs - input.stateChangedAtMs < input.eligibleAfterMs) return { eligible: false, reason: "too_young" };
  return { eligible: true };
}
