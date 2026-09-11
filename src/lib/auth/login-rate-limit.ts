const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_BLOCK_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

type LoginAttemptBucket = {
  failedAttempts: number;
  resetAt: number;
  blockedUntil: number | null;
};

const loginAttemptBuckets = new Map<string, LoginAttemptBucket>();

function normalizeLoginIdentifier(raw: unknown): string {
  if (!raw || typeof raw !== "object") return "unknown";
  const email = (raw as { email?: unknown }).email;
  if (typeof email !== "string") return "unknown";
  return email.trim().toLowerCase().slice(0, 254) || "unknown";
}

function getClientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwarded || realIp || "unknown";
}

export function getAdminLoginRateLimitKey(request: Request, raw: unknown): string {
  return `${getClientAddress(request)}:${normalizeLoginIdentifier(raw)}`;
}

export function isAdminLoginRateLimited(key: string, now = Date.now()): boolean {
  const bucket = loginAttemptBuckets.get(key);
  if (!bucket) return false;

  if (bucket.blockedUntil && bucket.blockedUntil > now) return true;

  if (bucket.resetAt <= now || (bucket.blockedUntil && bucket.blockedUntil <= now)) {
    loginAttemptBuckets.delete(key);
    return false;
  }

  return bucket.failedAttempts >= MAX_FAILED_ATTEMPTS;
}

export function recordAdminLoginFailure(key: string, now = Date.now()): void {
  const current = loginAttemptBuckets.get(key);
  const bucket = !current || current.resetAt <= now
    ? { failedAttempts: 0, resetAt: now + LOGIN_WINDOW_MS, blockedUntil: null }
    : current;

  bucket.failedAttempts += 1;
  if (bucket.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    bucket.blockedUntil = now + LOGIN_BLOCK_MS;
  }
  loginAttemptBuckets.set(key, bucket);
}

export function clearAdminLoginFailures(key: string): void {
  loginAttemptBuckets.delete(key);
}

export function resetAdminLoginRateLimitForTests(): void {
  loginAttemptBuckets.clear();
}

export const ADMIN_LOGIN_RATE_LIMIT = {
  maxFailedAttempts: MAX_FAILED_ATTEMPTS,
  windowMs: LOGIN_WINDOW_MS,
  blockMs: LOGIN_BLOCK_MS,
} as const;
