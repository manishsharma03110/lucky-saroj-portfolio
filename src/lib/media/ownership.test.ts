import assert from "node:assert/strict";
import test from "node:test";
import {
  assetIdSchema,
  classifyMediaReference,
  classifyProviderDeleteResult,
  createStorageKey,
  decideDeleteEligibility,
  decideLifecycleTransition,
  decideOrphanCleanupEligibility,
  decideReplacement,
  deleteEligibleAsset,
  generateAssetId,
  INITIAL_ASSET_LIFECYCLE_STATE,
  mediaOwnershipSubjectSchema,
  ORIGINAL_FILENAME_MAX_LENGTH,
  originalFilenameSchema,
  parseStorageKey,
  STORAGE_KEY_MAX_LENGTH,
  storageKeySchema,
  type OwnedMediaProvider,
} from "./ownership";

const assetId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const otherAssetId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const key = createStorageKey(assetId, "image");

test("asset IDs are generated as canonical application-owned UUIDs", () => {
  const generated = generateAssetId();
  assert.equal(assetIdSchema.parse(generated), generated);
  assert.equal(generated, generated.toLowerCase());
  assert.equal(assetIdSchema.parse(assetId), assetId);
});

test("asset IDs reject non-canonical, empty, malformed, oversized, singleton, URL, and path input", () => {
  for (const value of [
    assetId.toUpperCase(), "", " ", "not-a-uuid", "x".repeat(37), "singleton:showreel",
    "https://example.com/asset", "/uploads/asset.webp", "../asset",
  ]) assert.equal(assetIdSchema.safeParse(value).success, false, String(value));
});

test("storage keys are constructed only from trusted asset ID and finite kind", () => {
  assert.equal(key, `cms-media/${assetId}/image`);
  assert.deepEqual(parseStorageKey(key), { assetId, kind: "image", key });
  assert.equal(createStorageKey(assetId, "video"), `cms-media/${assetId}/video`);
  assert.ok(key.length <= STORAGE_KEY_MAX_LENGTH);
  assert.throws(() => createStorageKey(assetId, "document"));
});

test("storage key validation rejects caller directories and ambiguous or hostile syntax", () => {
  for (const value of [
    `other/${assetId}/image`, `cms-media/folder/${assetId}/image`, `cms-media/${assetId}/../image`,
    `cms-media/${assetId}//image`, `cms-media\\${assetId}\\image`, `cms-media/${assetId}/%2fimage`,
    `cms-media/${assetId}/image?x=1`, `cms-media/${assetId}/image#x`, `https://example.com/${assetId}/image`,
    `//cms-media/${assetId}/image`, `cms-media/${assetId}/ima\u0000ge`, "x".repeat(STORAGE_KEY_MAX_LENGTH + 1),
  ]) assert.equal(storageKeySchema.safeParse(value).success, false, JSON.stringify(value));
});

test("original filename metadata preserves benign unicode and spaces after trimming", () => {
  assert.equal(originalFilenameSchema.parse(" photo final.webp "), "photo final.webp");
  assert.equal(originalFilenameSchema.parse("å½±ç‰‡-çµ‚ç‰ˆ.mp4"), "å½±ç‰‡-çµ‚ç‰ˆ.mp4");
  assert.equal(originalFilenameSchema.parse("x".repeat(ORIGINAL_FILENAME_MAX_LENGTH)).length, ORIGINAL_FILENAME_MAX_LENGTH);
});

test("original filename metadata rejects path semantics, controls, empty names, and bounds", () => {
  for (const value of [
    "", " ", ".", "..", "../x.jpg", "..\\x.jpg", "folder/x.jpg", "folder\\x.jpg",
    "bad\u0000.jpg", "bad\u001f.jpg", "bad\u007f.jpg", "x".repeat(ORIGINAL_FILENAME_MAX_LENGTH + 1),
  ]) assert.equal(originalFilenameSchema.safeParse(value).success, false, JSON.stringify(value));
});

test("ownership subjects accept every supported mutable slot", () => {
  for (const subject of [
    { entityType: "portfolio_project", entityId: assetId, slot: "thumbnail" },
    { entityType: "portfolio_project", entityId: assetId, slot: "video" },
    { entityType: "showreel", entityId: "singleton:showreel", slot: "thumbnail" },
    { entityType: "showreel", entityId: "singleton:showreel", slot: "video" },
    { entityType: "site_settings", entityId: "singleton:settings", slot: "hero_image" },
  ]) assert.equal(mediaOwnershipSubjectSchema.safeParse(subject).success, true);
});

test("ownership subjects reject unknown entities, slots, and malformed IDs", () => {
  for (const subject of [
    { entityType: "portfolio_project", entityId: "bad", slot: "thumbnail" },
    { entityType: "portfolio_project", entityId: assetId, slot: "poster" },
    { entityType: "showreel", entityId: assetId, slot: "video" },
    { entityType: "settings", entityId: "singleton:settings", slot: "hero" },
    { entityType: "site_settings", entityId: assetId, slot: "hero_image" },
    { entityType: "site_settings", entityId: "singleton:settings", slot: "video" },
  ]) assert.equal(mediaOwnershipSubjectSchema.safeParse(subject).success, false);
});

test("lifecycle state machine permits intended server-authoritative transitions", () => {
  assert.equal(INITIAL_ASSET_LIFECYCLE_STATE, "pending");
  for (const [from, event, to] of [
    ["pending", "attach", "attached"], ["pending", "abandon", "orphaned"],
    ["attached", "detach", "orphaned"], ["orphaned", "attach", "attached"],
    ["orphaned", "begin_delete", "deleting"], ["deleting", "delete_confirmed", "deleted"],
    ["deleting", "delete_failed", "delete_failed"], ["deleting", "delete_unknown", "delete_failed"],
    ["delete_failed", "retry_delete", "deleting"], ["delete_failed", "delete_confirmed", "deleted"],
  ] as const) assert.deepEqual(decideLifecycleTransition(from, event), { allowed: true, from, event, to });
});

test("lifecycle rejects illegal transitions, keeps deleted terminal, and never maps timeout to deleted", () => {
  assert.equal(decideLifecycleTransition("pending", "begin_delete").allowed, false);
  assert.equal(decideLifecycleTransition("attached", "delete_confirmed").allowed, false);
  assert.equal(decideLifecycleTransition("deleted", "attach").allowed, false);
  assert.deepEqual(decideLifecycleTransition("deleting", "delete_unknown"), {
    allowed: true, from: "deleting", event: "delete_unknown", to: "delete_failed",
  });
});

test("reference classification requires structured proof for owned assets", () => {
  assert.equal(classifyMediaReference("https://blob.example.com/a", { assetId, providerKey: key }), "owned_internal");
  assert.equal(classifyMediaReference("https://example.com/a"), "external_https");
  assert.equal(classifyMediaReference("/uploads/legacy/a.webp"), "legacy_internal");
  assert.equal(classifyMediaReference("not a media reference"), "unmanaged");
  assert.equal(classifyMediaReference("https://blob.example.com/a", { assetId, providerKey: createStorageKey(otherAssetId, "image") }), "external_https");
});

function deletion(overrides: Partial<Parameters<typeof decideDeleteEligibility>[0]> = {}) {
  return decideDeleteEligibility({
    authorized: true, assetId, providerKey: key, classification: "owned_internal", state: "orphaned", referenceCount: 0,
    ...overrides,
  });
}

test("delete eligibility returns only a proven canonical owned zero-reference key", () => {
  assert.deepEqual(deletion(), { eligible: true, assetId, providerKey: key });
});

test("delete eligibility reports every material denial reason", () => {
  assert.deepEqual(deletion({ authorized: false }), { eligible: false, reason: "unauthorized" });
  assert.deepEqual(deletion({ assetId: "bad" }), { eligible: false, reason: "invalid_asset_id" });
  assert.deepEqual(deletion({ providerKey: "" }), { eligible: false, reason: "missing_or_invalid_key" });
  assert.deepEqual(deletion({ providerKey: createStorageKey(otherAssetId, "image") }), { eligible: false, reason: "key_asset_mismatch" });
  assert.deepEqual(deletion({ classification: "external_https" }), { eligible: false, reason: "external_reference" });
  assert.deepEqual(deletion({ classification: "legacy_internal" }), { eligible: false, reason: "legacy_or_unmanaged_reference" });
  assert.deepEqual(deletion({ referenceCount: -1 }), { eligible: false, reason: "invalid_reference_count" });
  for (const referenceCount of [1, 2, 99]) assert.deepEqual(deletion({ referenceCount }), { eligible: false, reason: "still_referenced" });
  for (const state of ["pending", "attached", "deleting", "deleted"] as const) {
    assert.deepEqual(deletion({ state }), { eligible: false, reason: "state_not_deletable" });
  }
  assert.equal(deletion({ state: "delete_failed" }).eligible, true);
});

test("replacement decisions preserve the winner and make stale/rejected uploads reclaimable", () => {
  assert.deepEqual(decideReplacement({ outcome: "stale_revision", oldClassification: "owned_internal", oldReferenceCountAfterCommit: 0 }), {
    newAssetState: "orphaned", oldAssetCleanupEligible: false, oldAssetState: "attached",
  });
  assert.deepEqual(decideReplacement({ outcome: "db_rejected", oldClassification: "owned_internal", oldReferenceCountAfterCommit: 0 }), {
    newAssetState: "orphaned", oldAssetCleanupEligible: false, oldAssetState: "attached",
  });
  assert.deepEqual(decideReplacement({ outcome: "committed", oldClassification: "owned_internal", oldReferenceCountAfterCommit: 1 }), {
    newAssetState: "attached", oldAssetCleanupEligible: false, oldAssetState: "attached",
  });
  assert.deepEqual(decideReplacement({ outcome: "committed", oldClassification: "owned_internal", oldReferenceCountAfterCommit: 0 }), {
    newAssetState: "attached", oldAssetCleanupEligible: true, oldAssetState: "orphaned",
  });
});

test("replacement cleanup failure never rolls back the successfully attached winner", () => {
  const decision = decideReplacement({
    outcome: "committed", oldClassification: "owned_internal", oldReferenceCountAfterCommit: 0, cleanupOutcome: "unknown_outcome",
  });
  assert.deepEqual(decision, { newAssetState: "attached", oldAssetCleanupEligible: true, oldAssetState: "delete_failed" });
});

test("provider result classification treats not-found idempotently and uncertainty safely", () => {
  assert.deepEqual(classifyProviderDeleteResult("success"), { status: "confirmed_deleted" });
  assert.deepEqual(classifyProviderDeleteResult("not_found"), { status: "confirmed_deleted" });
  assert.deepEqual(classifyProviderDeleteResult("retryable_failure"), { status: "retryable_failure" });
  assert.deepEqual(classifyProviderDeleteResult("unknown_outcome"), { status: "unknown_outcome" });
  assert.deepEqual(classifyProviderDeleteResult("permanent_failure"), { status: "permanent_failure" });
});

test("provider adapter receives canonical key only and normalizes raw errors", async () => {
  const keys: string[] = [];
  const provider: OwnedMediaProvider = { deleteOwnedKey: async (providerKey) => { keys.push(providerKey); return "not_found"; } };
  assert.deepEqual(await deleteEligibleAsset(provider, deletion()), { status: "confirmed_deleted", message: "Media deleted." });
  assert.deepEqual(keys, [key]);

  const deniedProvider: OwnedMediaProvider = { deleteOwnedKey: async () => { throw new Error("must not be called"); } };
  assert.deepEqual(await deleteEligibleAsset(deniedProvider, deletion({ referenceCount: 2 })), {
    status: "permanent_failure", message: "Media deletion is not permitted.",
  });
  assert.deepEqual(await deleteEligibleAsset(deniedProvider, deletion({ classification: "external_https" })), {
    status: "permanent_failure", message: "Media deletion is not permitted.",
  });

  for (const signal of ["retryable_failure", "unknown_outcome"] as const) {
    const uncertainProvider: OwnedMediaProvider = { deleteOwnedKey: async () => signal };
    assert.deepEqual(await deleteEligibleAsset(uncertainProvider, deletion()), {
      status: signal, message: "Media deletion could not be confirmed.",
    });
  }

  const rawFailure = "provider-token-and-internal-request-id";
  const failingProvider: OwnedMediaProvider = { deleteOwnedKey: async () => { throw new Error(rawFailure); } };
  const response = await deleteEligibleAsset(failingProvider, deletion());
  assert.deepEqual(response, { status: "unknown_outcome", message: "Media deletion could not be confirmed." });
  assert.equal(JSON.stringify(response).includes(rawFailure), false);
});

function orphan(overrides: Partial<Parameters<typeof decideOrphanCleanupEligibility>[0]> = {}) {
  return decideOrphanCleanupEligibility({
    nowMs: 2_000, eligibleAfterMs: 1_000, stateChangedAtMs: 1_000, referenceCount: 0,
    classification: "owned_internal", providerKey: key, state: "orphaned", ...overrides,
  });
}

test("orphan eligibility is deterministic at age threshold and supports retry state", () => {
  assert.deepEqual(orphan({ nowMs: 1_999 }), { eligible: false, reason: "too_young" });
  assert.deepEqual(orphan({ nowMs: 2_000 }), { eligible: true });
  assert.deepEqual(orphan({ nowMs: 2_001 }), { eligible: true });
  assert.deepEqual(orphan({ state: "pending" }), { eligible: true });
  assert.deepEqual(orphan({ state: "delete_failed" }), { eligible: true });
});

test("orphan eligibility rejects referenced, unowned, invalid-state, missing-key, and invalid-time inputs", () => {
  assert.deepEqual(orphan({ referenceCount: 1 }), { eligible: false, reason: "still_referenced" });
  assert.deepEqual(orphan({ referenceCount: 2 }), { eligible: false, reason: "still_referenced" });
  assert.deepEqual(orphan({ referenceCount: -1 }), { eligible: false, reason: "invalid_reference_count" });
  assert.deepEqual(orphan({ classification: "external_https" }), { eligible: false, reason: "not_owned" });
  assert.deepEqual(orphan({ classification: "legacy_internal" }), { eligible: false, reason: "not_owned" });
  assert.deepEqual(orphan({ state: "attached" }), { eligible: false, reason: "state_not_eligible" });
  assert.deepEqual(orphan({ providerKey: "" }), { eligible: false, reason: "missing_or_invalid_key" });
  assert.deepEqual(orphan({ nowMs: 999 }), { eligible: false, reason: "invalid_time" });
});
