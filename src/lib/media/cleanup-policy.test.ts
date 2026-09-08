import assert from "node:assert/strict";
import test from "node:test";
import { decideMediaCleanupCandidate, MAX_MEDIA_CLEANUP_BATCH_SIZE, mediaDeleteRetryDelayMs, parseMediaCleanupPolicy } from "./cleanup-policy";

const hour = 60 * 60 * 1000;
const base = { state: "orphaned", url: "https://example.test/a", updatedAtMs: 0, lastDeleteAttemptAtMs: null, deleteAttempts: 0, referenceCount: 0, nowMs: 48 * hour, canonicalIdentity: true };

test("cleanup policy validates finite bounded configuration", () => {
  assert.equal(parseMediaCleanupPolicy({ batchSize: MAX_MEDIA_CLEANUP_BATCH_SIZE }).batchSize, 100);
  for (const batchSize of [0, -1, 101, 1.5]) assert.throws(() => parseMediaCleanupPolicy({ batchSize }));
});

test("fresh pending and orphaned assets are not disposable", () => {
  assert.deepEqual(decideMediaCleanupCandidate({ ...base, state: "pending", nowMs: hour }), { eligible: false, reason: "too_young" });
  assert.deepEqual(decideMediaCleanupCandidate({ ...base, nowMs: hour }), { eligible: false, reason: "too_young" });
});

test("stale pending distinguishes DB-only discard from provider deletion", () => {
  assert.deepEqual(decideMediaCleanupCandidate({ ...base, state: "pending", url: null }), { eligible: true, action: "discard_unfinalized" });
  assert.deepEqual(decideMediaCleanupCandidate({ ...base, state: "pending" }), { eligible: true, action: "delete_provider_object" });
});

test("attached deleting and deleted states never become candidates by age", () => {
  for (const state of ["attached", "deleting", "deleted"]) assert.deepEqual(decideMediaCleanupCandidate({ ...base, state }), { eligible: false, reason: "state" });
});

test("canonical identity and zero references are mandatory", () => {
  assert.deepEqual(decideMediaCleanupCandidate({ ...base, canonicalIdentity: false }), { eligible: false, reason: "invalid" });
  assert.deepEqual(decideMediaCleanupCandidate({ ...base, referenceCount: 1 }), { eligible: false, reason: "live_reference" });
});

test("retry backoff is exponential, capped, and attempt-bounded", () => {
  const policy = { retryBaseDelayMs: 1000, retryMaxDelayMs: 4000, maxDeleteAttempts: 3 };
  assert.equal(mediaDeleteRetryDelayMs(1, policy), 1000);
  assert.equal(mediaDeleteRetryDelayMs(4, policy), 4000);
  assert.deepEqual(decideMediaCleanupCandidate({ ...base, state: "delete_failed", deleteAttempts: 1, lastDeleteAttemptAtMs: 47 * hour, lastDeleteErrorCode: "unknown_outcome", nowMs: 47 * hour + 999 }, policy), { eligible: false, reason: "retry_delayed" });
  assert.deepEqual(decideMediaCleanupCandidate({ ...base, state: "delete_failed", deleteAttempts: 3, lastDeleteAttemptAtMs: 0, lastDeleteErrorCode: "retryable_failure" }, policy), { eligible: false, reason: "attempt_limit" });
  assert.deepEqual(decideMediaCleanupCandidate({ ...base, state: "delete_failed", deleteAttempts: 1, lastDeleteAttemptAtMs: 0, lastDeleteErrorCode: "permanent_failure" }, policy), { eligible: false, reason: "state" });
});

test("malformed candidate timestamps and counters are rejected", () => {
  assert.deepEqual(decideMediaCleanupCandidate({ ...base, nowMs: -1 }), { eligible: false, reason: "invalid" });
  assert.deepEqual(decideMediaCleanupCandidate({ ...base, deleteAttempts: -1 }), { eligible: false, reason: "invalid" });
});
