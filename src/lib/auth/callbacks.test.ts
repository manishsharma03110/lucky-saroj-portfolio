import assert from "node:assert/strict";
import test from "node:test";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { applyAdminJwt, projectAdminSession } from "./callbacks";

const id = "11111111-1111-4111-8111-111111111111";

test("JWT callback stores login administrator ID and numeric version", () => {
  const token = applyAdminJwt({}, { id, sessionVersion: 4 });
  assert.equal(token.adminId, id);
  assert.equal(token.sessionVersion, 4);
});

test("JWT callback preserves existing claims when no login user is present", () => {
  const token: JWT = { adminId: id, sessionVersion: 4 };
  assert.equal(applyAdminJwt(token), token);
  assert.deepEqual(token, { adminId: id, sessionVersion: 4 });
});

test("JWT callback does not fabricate a missing version", () => {
  const token = applyAdminJwt({}, { id });
  assert.equal(token.adminId, id);
  assert.equal(token.sessionVersion, undefined);
});

test("session callback projects only administrator identity/version hints", () => {
  const session = { user: { name: "Admin", email: "admin@example.invalid" }, expires: "later" } as Session;
  const result = projectAdminSession(session, { adminId: id, sessionVersion: 4 });
  assert.deepEqual(result.user, {
    id,
    sessionVersion: 4,
    name: "Admin",
    email: "admin@example.invalid",
  });
  assert.equal("passwordHash" in result.user, false);
  assert.equal("isActive" in result.user, false);
  assert.equal("session_version" in result.user, false);
});

for (const version of [undefined, "4", 0, -1, 1.5, Number.NaN]) {
  test(`session callback does not trust invalid version: ${String(version)}`, () => {
    const session = { user: { name: "Admin" }, expires: "later" } as Session;
    const result = projectAdminSession(session, { adminId: id, sessionVersion: version } as JWT);
    assert.equal(result.user.id, undefined);
    assert.equal(result.user.sessionVersion, undefined);
  });
}
