import { createHash } from "node:crypto";
import { withDatabaseTransaction } from "@/lib/db/core";

// Reuse the existing expiring counter table with separate namespaces; no raw IP is stored.
export async function consumePublicRequest(headers: Pick<Headers, "get">, scope: "contact" | "attachment") {
  const ip = (process.env.VERCEL ? headers.get("x-vercel-forwarded-for") : headers.get("x-forwarded-for") || headers.get("x-real-ip"))?.split(",")[0]?.trim() || "unknown";
  const key = createHash("sha256").update(`public:${scope}:${ip}`).digest("hex");
  const limit = scope === "contact" ? 10 : 5;
  return withDatabaseTransaction(async tx => {
    await tx.query("DELETE FROM admin_login_attempts WHERE key_hash IN (SELECT key_hash FROM admin_login_attempts WHERE expires_at < now() ORDER BY expires_at LIMIT 100)");
    const result = await tx.query<{ allowed: boolean }>(`
      INSERT INTO admin_login_attempts (key_hash, attempts, expires_at) VALUES ($1,1,now()+interval '15 minutes')
      ON CONFLICT (key_hash) DO UPDATE SET
        attempts=CASE WHEN admin_login_attempts.expires_at<=now() THEN 1 ELSE LEAST(admin_login_attempts.attempts+1,$2+1) END,
        expires_at=CASE WHEN admin_login_attempts.expires_at<=now() THEN now()+interval '15 minutes' ELSE admin_login_attempts.expires_at END
      RETURNING attempts<=$2 AS allowed`, [key,limit]);
    return Boolean(result.rows[0]?.allowed);
  });
}
