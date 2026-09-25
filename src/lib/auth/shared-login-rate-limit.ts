import { createHash } from "node:crypto";
import { withDatabaseTransaction } from "@/lib/db/core";

// Count attempts before password verification so parallel workers cannot bypass the cap.
// Fixed 15-minute windows expire in Postgres time, independent of server clock skew.
const consumeSql = `
INSERT INTO admin_login_attempts (key_hash, attempts, expires_at)
VALUES ($1, 1, now() + interval '15 minutes')
ON CONFLICT (key_hash) DO UPDATE SET
  attempts = CASE WHEN admin_login_attempts.expires_at <= now() THEN 1 ELSE LEAST(admin_login_attempts.attempts + 1, $2 + 1) END,
  expires_at = CASE WHEN admin_login_attempts.expires_at <= now() THEN now() + interval '15 minutes' ELSE admin_login_attempts.expires_at END
RETURNING attempts <= $2 AS allowed`;

export function loginThrottleKeys(request: Request, raw: unknown) {
  // Vercel supplies this header; avoid a caller-controlled forwarded chain there.
  const ip = (process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for")
    : request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"))?.split(",")[0]?.trim() || "unknown";
  const email = raw && typeof raw === "object" && "email" in raw && typeof raw.email === "string"
    ? raw.email.trim().toLowerCase().slice(0, 254) : "unknown";
  const hash = (value: string) => createHash("sha256").update(value).digest("hex");
  return { accountKey: hash(`account:${ip}:${email}`), addressKey: hash(`address:${ip}`) };
}

export async function consumeAdminLoginAttempt(request: Request, raw: unknown) {
  const keys = loginThrottleKeys(request, raw);
  const allowed = await withDatabaseTransaction(async (tx) => {
    // Bounded indexed cleanup prevents permanent retention of hashed identifiers.
    await tx.query("DELETE FROM admin_login_attempts WHERE key_hash IN (SELECT key_hash FROM admin_login_attempts WHERE expires_at < now() ORDER BY expires_at LIMIT 100)");
    const address = await tx.query<{ allowed: boolean }>(consumeSql, [keys.addressKey, 50]);
    if (!address.rows[0]?.allowed) return false;
    const account = await tx.query<{ allowed: boolean }>(consumeSql, [keys.accountKey, 5]);
    return Boolean(account.rows[0]?.allowed);
  });
  return { allowed, accountKey: keys.accountKey };
}

export async function clearSharedLoginAttempts(accountKey: string) {
  await withDatabaseTransaction(async tx => {
    await tx.query("DELETE FROM admin_login_attempts WHERE key_hash = $1", [accountKey]);
  });
}
