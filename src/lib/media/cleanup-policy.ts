import { assetLifecycleStateSchema, type AssetLifecycleState } from "./ownership";

export type MediaCleanupPolicy = Readonly<{
  pendingAgeMs: number;
  orphanAgeMs: number;
  retryBaseDelayMs: number;
  retryMaxDelayMs: number;
  claimTimeoutMs: number;
  maxDeleteAttempts: number;
  batchSize: number;
}>;

export const DEFAULT_MEDIA_CLEANUP_POLICY: MediaCleanupPolicy = Object.freeze({
  pendingAgeMs: 24 * 60 * 60 * 1000,
  orphanAgeMs: 24 * 60 * 60 * 1000,
  retryBaseDelayMs: 5 * 60 * 1000,
  retryMaxDelayMs: 24 * 60 * 60 * 1000,
  claimTimeoutMs: 15 * 60 * 1000,
  maxDeleteAttempts: 8,
  batchSize: 25,
});

export const MAX_MEDIA_CLEANUP_BATCH_SIZE = 100;

function safePositiveInteger(value: unknown, name: string, maximum = Number.MAX_SAFE_INTEGER): number {
  if (!Number.isSafeInteger(value) || (value as number) <= 0 || (value as number) > maximum) {
    throw new Error(`Invalid media cleanup ${name}.`);
  }
  return value as number;
}

export function parseMediaCleanupPolicy(input: Partial<MediaCleanupPolicy> = {}): MediaCleanupPolicy {
  const policy = { ...DEFAULT_MEDIA_CLEANUP_POLICY, ...input };
  return Object.freeze({
    pendingAgeMs: safePositiveInteger(policy.pendingAgeMs, "pending age"),
    orphanAgeMs: safePositiveInteger(policy.orphanAgeMs, "orphan age"),
    retryBaseDelayMs: safePositiveInteger(policy.retryBaseDelayMs, "retry base delay"),
    retryMaxDelayMs: safePositiveInteger(policy.retryMaxDelayMs, "retry maximum delay"),
    claimTimeoutMs: safePositiveInteger(policy.claimTimeoutMs, "claim timeout"),
    maxDeleteAttempts: safePositiveInteger(policy.maxDeleteAttempts, "attempt limit", 100),
    batchSize: safePositiveInteger(policy.batchSize, "batch size", MAX_MEDIA_CLEANUP_BATCH_SIZE),
  });
}

export function mediaDeleteRetryDelayMs(attempts: number, policyInput: Partial<MediaCleanupPolicy> = {}): number {
  const policy = parseMediaCleanupPolicy(policyInput);
  if (!Number.isSafeInteger(attempts) || attempts < 1) throw new Error("Invalid media delete attempt count.");
  return Math.min(policy.retryMaxDelayMs, policy.retryBaseDelayMs * (2 ** Math.min(attempts - 1, 30)));
}

export type CleanupCandidateDecision =
  | { eligible: true; action: "discard_unfinalized" | "delete_provider_object" }
  | { eligible: false; reason: "state" | "too_young" | "retry_delayed" | "attempt_limit" | "live_reference" | "invalid" };

export function decideMediaCleanupCandidate(input: {
  state: unknown;
  url: string | null;
  updatedAtMs: number;
  lastDeleteAttemptAtMs: number | null;
  lastDeleteErrorCode?: string | null;
  deleteAttempts: number;
  referenceCount: number;
  nowMs: number;
  canonicalIdentity: boolean;
}, policyInput: Partial<MediaCleanupPolicy> = {}): CleanupCandidateDecision {
  const policy = parseMediaCleanupPolicy(policyInput);
  const state = assetLifecycleStateSchema.safeParse(input.state);
  if (!state.success || !input.canonicalIdentity || !Number.isSafeInteger(input.nowMs)
    || !Number.isSafeInteger(input.updatedAtMs) || input.nowMs < input.updatedAtMs
    || !Number.isSafeInteger(input.deleteAttempts) || input.deleteAttempts < 0
    || !Number.isSafeInteger(input.referenceCount) || input.referenceCount < 0) {
    return { eligible: false, reason: "invalid" };
  }
  if (input.referenceCount > 0) return { eligible: false, reason: "live_reference" };
  if (state.data === "pending") {
    if (input.nowMs - input.updatedAtMs < policy.pendingAgeMs) return { eligible: false, reason: "too_young" };
    return { eligible: true, action: input.url === null ? "discard_unfinalized" : "delete_provider_object" };
  }
  if (state.data === "orphaned") {
    return input.nowMs - input.updatedAtMs >= policy.orphanAgeMs
      ? { eligible: true, action: "delete_provider_object" }
      : { eligible: false, reason: "too_young" };
  }
  if (state.data === "delete_failed") {
    if (input.lastDeleteErrorCode !== "retryable_failure" && input.lastDeleteErrorCode !== "unknown_outcome") {
      return { eligible: false, reason: "state" };
    }
    if (input.deleteAttempts >= policy.maxDeleteAttempts) return { eligible: false, reason: "attempt_limit" };
    if (input.lastDeleteAttemptAtMs === null || !Number.isSafeInteger(input.lastDeleteAttemptAtMs)) return { eligible: false, reason: "invalid" };
    return input.nowMs - input.lastDeleteAttemptAtMs >= mediaDeleteRetryDelayMs(input.deleteAttempts, policy)
      ? { eligible: true, action: "delete_provider_object" }
      : { eligible: false, reason: "retry_delayed" };
  }
  return { eligible: false, reason: "state" };
}

export function isCleanupLifecycleState(value: unknown): value is AssetLifecycleState {
  const parsed = assetLifecycleStateSchema.safeParse(value);
  return parsed.success && ["pending", "orphaned", "delete_failed"].includes(parsed.data);
}
