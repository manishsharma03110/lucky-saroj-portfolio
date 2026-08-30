import assert from "node:assert/strict";
import test from "node:test";
import { authorizeAdminCredentials, type CredentialAdmin } from "./credentials";

const admin: CredentialAdmin = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "admin@example.invalid",
  name: "Admin",
  passwordHash: "test-hash-not-a-secret",
  sessionVersion: 3,
  isActive: true,
};

test("authorizes a valid active administrator and returns versioned identity", async () => {
  let normalizedEmail = "";
  const result = await authorizeAdminCredentials(
    { email: "  ADMIN@EXAMPLE.INVALID ", password: "valid-password" },
    {
      findByEmail: async (email) => {
        normalizedEmail = email;
        return admin;
      },
      verifyPassword: async () => true,
    }
  );

  assert.equal(normalizedEmail, "admin@example.invalid");
  assert.deepEqual(result, {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    sessionVersion: 3,
  });
});

test("rejects a wrong password", async () => {
  const result = await authorizeAdminCredentials(
    { email: admin.email, password: "wrong-password" },
    { findByEmail: async () => admin, verifyPassword: async () => false }
  );
  assert.equal(result, null);
});

test("rejects a nonexistent administrator without verifying a password", async () => {
  let compared = false;
  const result = await authorizeAdminCredentials(
    { email: "missing@example.invalid", password: "irrelevant" },
    {
      findByEmail: async () => null,
      verifyPassword: async () => {
        compared = true;
        return false;
      },
    }
  );
  assert.equal(result, null);
  assert.equal(compared, false);
});

test("rejects an inactive administrator after password verification", async () => {
  let compared = false;
  const result = await authorizeAdminCredentials(
    { email: admin.email, password: "valid-password" },
    {
      findByEmail: async () => ({ ...admin, isActive: false }),
      verifyPassword: async () => {
        compared = true;
        return true;
      },
    }
  );
  assert.equal(compared, true);
  assert.equal(result, null);
});

test("rejects malformed credential input", async () => {
  const result = await authorizeAdminCredentials({}, {
    findByEmail: async () => admin,
    verifyPassword: async () => true,
  });
  assert.equal(result, null);
});
