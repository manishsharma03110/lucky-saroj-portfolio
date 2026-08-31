import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AuthorizationError, createAuthorizationService } from "./authorization-core";

describe("fresh database authorization", () => {
  it("fails closed on role and permission lookup failures", async () => {
    for (const failure of [new Error("role query"), new Error("mapping query")]) {
      const service = createAuthorizationService({
        authenticate: async () => ({ id: "admin", email: "a@example.test", name: "A" }),
        findAuthorizationRows: async () => { throw failure; },
      });
      await assert.rejects(service.requirePermission("dashboard.view"), AuthorizationError);
    }
  });

  it("ignores injected JWT/session authority and uses fresh EDITOR grants", async () => {
    const tamperedIdentity = {
      id: "editor", email: "e@example.test", name: "E",
      role: "SUPER_ADMIN", permissions: ["admin_users.manage", "roles.manage"],
      user: { role: "SUPER_ADMIN", permissions: ["admin_users.manage"] },
    };
    const service = createAuthorizationService({
      authenticate: async () => tamperedIdentity,
      findAuthorizationRows: async () => [{ role: "EDITOR", permission: "dashboard.view" }],
    });
    assert.equal((await service.requirePermission("dashboard.view")).role, "EDITOR");
    await assert.rejects(service.requirePermission("admin_users.manage"), AuthorizationError);
    await assert.rejects(service.requirePermission("roles.manage"), AuthorizationError);
  });
});
