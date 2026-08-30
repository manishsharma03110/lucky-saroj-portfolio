import assert from "node:assert/strict";
import test from "node:test";
import {
  AdminAuthorizationError,
  revalidateAdminSession,
  type AdminAuthorizationFailure,
  type RevalidationAdmin,
} from "./admin-core";

const id = "11111111-1111-4111-8111-111111111111";
const activeAdmin: RevalidationAdmin = {
  id,
  email: "admin@example.invalid",
  name: "Admin",
  sessionVersion: 2,
  isActive: true,
};
const session = { user: { id, sessionVersion: 2 } };

async function expectFailure(
  expected: AdminAuthorizationFailure,
  run: () => Promise<unknown>
) {
  await assert.rejects(
    run,
    (error) => error instanceof AdminAuthorizationError && error.reason === expected
  );
}

test("accepts a valid active administrator with a matching version", async () => {
  const result = await revalidateAdminSession(session, async () => activeAdmin);
  assert.deepEqual(result, { id, email: activeAdmin.email, name: activeAdmin.name });
});

test("rejects a missing session", async () => {
  await expectFailure("unauthenticated", () => revalidateAdminSession(null, async () => activeAdmin));
});

test("rejects a malformed administrator ID before lookup", async () => {
  let lookedUp = false;
  await expectFailure("unauthenticated", () =>
    revalidateAdminSession(
      { user: { id: "not-an-id", sessionVersion: 2 } },
      async () => {
        lookedUp = true;
        return activeAdmin;
      }
    )
  );
  assert.equal(lookedUp, false);
});

test("rejects a legacy session without sessionVersion", async () => {
  await expectFailure("unauthenticated", () =>
    revalidateAdminSession({ user: { id } }, async () => activeAdmin)
  );
});

test("rejects a stale session version", async () => {
  await expectFailure("stale", () =>
    revalidateAdminSession({ user: { id, sessionVersion: 1 } }, async () => activeAdmin)
  );
});

test("rejects a deleted administrator", async () => {
  await expectFailure("deleted", () => revalidateAdminSession(session, async () => null));
});

test("rejects an administrator disabled after token issuance", async () => {
  await expectFailure("inactive", () =>
    revalidateAdminSession(session, async () => ({ ...activeAdmin, isActive: false }))
  );
});

test("fails closed when the database lookup fails", async () => {
  await expectFailure("unavailable", () =>
    revalidateAdminSession(session, async () => {
      throw new Error("database unavailable");
    })
  );
});

test("rejects invalid session version values", async () => {
  for (const sessionVersion of [0, -1, 1.5, Number.NaN, "2", undefined]) {
    await expectFailure("unauthenticated", () =>
      revalidateAdminSession({ user: { id, sessionVersion } }, async () => activeAdmin)
    );
  }
});
