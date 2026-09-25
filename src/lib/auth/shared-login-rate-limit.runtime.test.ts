import assert from "node:assert/strict";
import { test, after } from "node:test";
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { db, closeDatabasePool } from "../db/core";
import { consumeAdminLoginAttempt, clearSharedLoginAttempts, loginThrottleKeys } from "./shared-login-rate-limit";

const url = new URL(process.env.DATABASE_URL || "");
if (!["localhost", "127.0.0.1"].includes(url.hostname) || url.pathname !== "/ci") throw new Error("Throttle tests require the disposable local CI database.");
after(closeDatabasePool);

test("atomic shared throttle admits only five concurrent attempts and recovers after expiry", async () => {
  const request = new Request("http://localhost/admin/login", { headers: { "x-forwarded-for": randomUUID() } });
  const raw = { email: "rate-limit-test@example.test" };
  const keys = loginThrottleKeys(request, raw);
  const results = await Promise.all(Array.from({ length: 12 }, () => consumeAdminLoginAttempt(request, raw)));
  assert.equal(results.filter(result => result.allowed).length, 5);
  await db.execute(sql`UPDATE admin_login_attempts SET expires_at = now() - interval '1 second' WHERE key_hash = ${keys.accountKey}`);
  assert.equal((await consumeAdminLoginAttempt(request, raw)).allowed, true);
  await clearSharedLoginAttempts(keys.accountKey);
  assert.equal((await consumeAdminLoginAttempt(request, raw)).allowed, true);
});

test("normalizes login identity without persisting raw email or IP", () => {
  const request = new Request("http://localhost", { headers: { "x-forwarded-for": "192.0.2.1" } });
  const a = loginThrottleKeys(request, { email: " TEST@Example.test " });
  const b = loginThrottleKeys(request, { email: "test@example.test" });
  assert.deepEqual(a, b);
  assert.match(a.accountKey, /^[a-f0-9]{64}$/);
});

test("rotating usernames cannot bypass the address budget", async () => {
  const request = new Request("http://localhost", { headers: { "x-forwarded-for": randomUUID() } });
  let admitted = 0;
  for (let index = 0; index < 51; index++) {
    const attempt = await consumeAdminLoginAttempt(request, { email: `user${index}@example.test` });
    if (attempt.allowed) admitted++;
  }
  assert.equal(admitted, 50);
});
