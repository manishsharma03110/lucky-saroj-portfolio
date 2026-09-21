import assert from "node:assert/strict";
import { test } from "node:test";
import { createAdminSchema, changePasswordSchema, newPasswordSchema } from "./account-validation";
import { assertAdminStateChangeAllowed, assertHighestTrustAdminInvariant, assertRoleAssignmentAllowed } from "./admin-role-policy";
import type { PermissionKey } from "./permissions";

test("password policy refuses bcrypt byte truncation and mismatched confirmation", () => {
  assert.equal(newPasswordSchema.safeParse("a".repeat(72)).success, true);
  assert.equal(newPasswordSchema.safeParse("a".repeat(73)).success, false);
  assert.equal(newPasswordSchema.safeParse("界".repeat(25)).success, false);
  assert.equal(newPasswordSchema.safeParse("short").success, false);
  assert.equal(changePasswordSchema.safeParse({currentPassword:"old",newPassword:"a".repeat(12),confirmPassword:"b".repeat(12)}).success,false);
});
test("new admin input normalizes email and rejects unknown roles", () => {
  const valid={name:"Editor",email:" TEST@EXAMPLE.COM ",password:"a".repeat(12),role:"EDITOR"};
  assert.equal(createAdminSchema.parse(valid).email,"test@example.com");
  assert.equal(createAdminSchema.safeParse({...valid,role:"OWNER"}).success,false);
});
test("account mutations cannot elevate editors or delete self or last super admin", () => {
  const grants=new Set<PermissionKey>(["admin_users.manage"]);
  const superAdmin={id:"super",role:"SUPER_ADMIN" as const,isActive:true,permissions:grants};
  assert.throws(()=>assertRoleAssignmentAllowed({...superAdmin,role:"EDITOR"},"SUPER_ADMIN"));
  assert.throws(()=>assertAdminStateChangeAllowed(superAdmin,superAdmin,"delete"));
  assert.throws(()=>assertAdminStateChangeAllowed(superAdmin,superAdmin,"disable"));
  assert.throws(()=>assertHighestTrustAdminInvariant(1,superAdmin,"demote"));
  assert.doesNotThrow(()=>assertRoleAssignmentAllowed(superAdmin,"EDITOR"));
});
