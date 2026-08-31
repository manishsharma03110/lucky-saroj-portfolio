import assert from "node:assert/strict";
import test from "node:test";
import { authorizeAnyPermission, authorizePermission, AuthorizationError, hasPermission, type AuthorizationContext } from "./authorization-core";
import { PERMISSION_KEYS, type PermissionKey, type RoleKey } from "./permissions";
import { assertAdminStateChangeAllowed, assertHighestTrustAdminInvariant, assertRoleAssignmentAllowed, assertRolePermissionChangeAllowed, SESSION_VERSION_INVALIDATION } from "./admin-role-policy";

const current = PERMISSION_KEYS.slice(0, 30);
const editor = new Set<PermissionKey>(["dashboard.view","portfolio.read","portfolio.create","portfolio.update","categories.read","categories.create","experience.read","experience.create","experience.update","services.read","services.create","services.update","about.read","about.update","showreel.read","showreel.update","testimonials.read","testimonials.create","testimonials.update","messages.read","messages.update","media.upload"]);
const matrix: Record<RoleKey, ReadonlySet<PermissionKey>> = {
  SUPER_ADMIN: new Set(PERMISSION_KEYS), ADMIN: new Set(current), EDITOR: editor,
};
const context = (role: RoleKey, permissions = matrix[role]): AuthorizationContext => ({ admin: { id: "a", email: "a@example.invalid", name: "A" }, role, permissions });

test("SUPER_ADMIN is allowed all 32 permissions", () => { for (const key of PERMISSION_KEYS) assert.equal(authorizePermission(context("SUPER_ADMIN"), key).role, "SUPER_ADMIN"); });
test("ADMIN is allowed ordinary content", () => assert.ok(hasPermission(context("ADMIN"), "portfolio.delete")));
test("ADMIN is allowed settings", () => assert.ok(hasPermission(context("ADMIN"), "settings.update")));
test("ADMIN is denied admin user management", () => assert.throws(() => authorizePermission(context("ADMIN"), "admin_users.manage"), AuthorizationError));
test("ADMIN is denied role management", () => assert.throws(() => authorizePermission(context("ADMIN"), "roles.manage"), AuthorizationError));
test("EDITOR is allowed content creation", () => assert.ok(hasPermission(context("EDITOR"), "portfolio.create")));
for (const key of ["portfolio.delete","categories.delete","experience.delete","services.delete","testimonials.delete","messages.delete"] as const) test(`EDITOR is denied ${key}`, () => assert.throws(() => authorizePermission(context("EDITOR"), key), AuthorizationError));
test("EDITOR is denied settings read", () => assert.throws(() => authorizePermission(context("EDITOR"), "settings.read"), AuthorizationError));
test("EDITOR is denied settings update", () => assert.throws(() => authorizePermission(context("EDITOR"), "settings.update"), AuthorizationError));
test("missing permission mapping denies", () => assert.throws(() => authorizePermission(context("ADMIN", new Set()), "dashboard.view"), AuthorizationError));
test("malformed permission denies", () => assert.throws(() => authorizePermission(context("ADMIN"), "wildcard.*"), AuthorizationError));
test("malformed role denies", () => assert.throws(() => authorizePermission({ ...context("ADMIN"), role: "ROOT" as RoleKey }, "dashboard.view"), AuthorizationError));
test("any-permission permits one mapped key", () => assert.equal(authorizeAnyPermission(context("EDITOR"), ["settings.read","portfolio.read"]).role, "EDITOR"));
test("any-permission denies empty input", () => assert.throws(() => authorizeAnyPermission(context("EDITOR"), []), AuthorizationError));
test("session invalidation policy is exact", () => assert.deepEqual(SESSION_VERSION_INVALIDATION, { passwordChange:true,rolePromotion:true,roleDemotion:true,adminDisable:true,adminReEnable:true,rolePermissionChange:true,adminRoleAssignmentChange:true,adminDeletion:false }));

const superActor = { id:"actor", role:"SUPER_ADMIN" as const, isActive:true, permissions:new Set<PermissionKey>(["admin_users.manage","roles.manage"]) };
const target = { id:"target", role:"SUPER_ADMIN" as const, isActive:true };
test("SUPER_ADMIN may assign SUPER_ADMIN", () => assert.doesNotThrow(() => assertRoleAssignmentAllowed(superActor,"SUPER_ADMIN")));
test("ADMIN cannot assign SUPER_ADMIN", () => assert.throws(() => assertRoleAssignmentAllowed({ ...superActor, role:"ADMIN" },"SUPER_ADMIN")));
test("EDITOR cannot assign a role", () => assert.throws(() => assertRoleAssignmentAllowed({ ...superActor, role:"EDITOR" },"EDITOR")));
test("roles.manage is required for mapping changes", () => assert.throws(() => assertRolePermissionChangeAllowed({ ...superActor, permissions:new Set() })));
for (const change of ["delete","disable","demote"] as const) test(`last SUPER_ADMIN ${change} is rejected`, () => assert.throws(() => assertHighestTrustAdminInvariant(1,target,change)));
for (const change of ["delete","disable","demote"] as const) test(`self ${change} is rejected`, () => assert.throws(() => assertAdminStateChangeAllowed(superActor,{...target,id:"actor"},change)));
test("two SUPER_ADMINs permit non-self demotion", () => assert.doesNotThrow(() => assertHighestTrustAdminInvariant(2,target,"demote")));
test("invalid highest-trust count fails closed", () => assert.throws(() => assertHighestTrustAdminInvariant(0,target,"enable")));
