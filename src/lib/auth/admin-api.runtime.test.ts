import assert from "node:assert/strict";
import test from "node:test";
import { AdminAuthorizationError } from "./admin-core";
import { authorizeAdminForApi } from "./admin-api";

const id = "11111111-1111-4111-8111-111111111111";
const validAdmin = { id, email: "admin@example.invalid", name: "Admin" };

async function expectUnauthorized(error: Error) {
  const result = await authorizeAdminForApi(async () => { throw error; });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.response.status, 401);
  assert.deepEqual(await result.response.json(), { error: "Unauthorized" });
}

for (const [name, reason] of [
  ["missing session", "unauthenticated"],
  ["malformed ID", "unauthenticated"],
  ["missing version", "unauthenticated"],
  ["stale version", "stale"],
  ["deleted administrator", "deleted"],
  ["inactive administrator", "inactive"],
] as const) {
  test(`API helper returns generic 401 for ${name}`, async () => {
    await expectUnauthorized(new AdminAuthorizationError(reason));
  });
}

test("API helper returns generic 401 for authorization database failure", async () => {
  await expectUnauthorized(new AdminAuthorizationError("unavailable"));
});

test("API helper returns trusted administrator for valid authorization", async () => {
  const result = await authorizeAdminForApi(async () => validAdmin);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.admin, validAdmin);
});
