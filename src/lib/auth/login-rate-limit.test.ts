import assert from "node:assert/strict";
import test from "node:test";
import {
  ADMIN_LOGIN_RATE_LIMIT,
  clearAdminLoginFailures,
  getAdminLoginRateLimitKey,
  isAdminLoginRateLimited,
  recordAdminLoginFailure,
  resetAdminLoginRateLimitForTests,
} from "./login-rate-limit";

test("builds a normalized per-client login key", () => {
  resetAdminLoginRateLimitForTests();
  const request = new Request("https://example.invalid/admin/login", {
    headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
  });
  assert.equal(
    getAdminLoginRateLimitKey(request, { email: "  ADMIN@EXAMPLE.INVALID " }),
    "203.0.113.10:admin@example.invalid"
  );
});

test("blocks after the configured number of failed attempts", () => {
  resetAdminLoginRateLimitForTests();
  const key = "203.0.113.10:admin@example.invalid";
  const now = 1_000_000;

  for (let i = 0; i < ADMIN_LOGIN_RATE_LIMIT.maxFailedAttempts - 1; i += 1) {
    recordAdminLoginFailure(key, now);
    assert.equal(isAdminLoginRateLimited(key, now), false);
  }

  recordAdminLoginFailure(key, now);
  assert.equal(isAdminLoginRateLimited(key, now), true);
  assert.equal(isAdminLoginRateLimited(key, now + ADMIN_LOGIN_RATE_LIMIT.blockMs + 1), false);
});

test("successful authentication clears previous failures", () => {
  resetAdminLoginRateLimitForTests();
  const key = "203.0.113.10:admin@example.invalid";
  recordAdminLoginFailure(key, 2_000_000);
  clearAdminLoginFailures(key);
  assert.equal(isAdminLoginRateLimited(key, 2_000_000), false);
});
