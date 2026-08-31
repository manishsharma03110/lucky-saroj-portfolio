import type { PermissionKey, RoleKey } from "./permissions";

export type AdminPolicyActor = { id: string; role: RoleKey; isActive: boolean; permissions: ReadonlySet<PermissionKey> };
export type AdminPolicyTarget = { id: string; role: RoleKey; isActive: boolean };
export type AdminStateChange = "delete" | "disable" | "enable" | "promote" | "demote";

function requireSuperAdmin(actor: AdminPolicyActor, permission: PermissionKey) {
  if (!actor.isActive || actor.role !== "SUPER_ADMIN" || !actor.permissions.has(permission)) {
    throw new Error("Administrator policy denied.");
  }
}

export function assertRoleAssignmentAllowed(actor: AdminPolicyActor, targetRole: RoleKey) {
  requireSuperAdmin(actor, "admin_users.manage");
  if (!(["SUPER_ADMIN", "ADMIN", "EDITOR"] as const).includes(targetRole)) throw new Error("Administrator policy denied.");
}

export function assertAdminStateChangeAllowed(actor: AdminPolicyActor, target: AdminPolicyTarget, change: AdminStateChange) {
  requireSuperAdmin(actor, "admin_users.manage");
  if (actor.id === target.id && ["delete", "disable", "demote"].includes(change)) throw new Error("Administrator policy denied.");
}

export function assertRolePermissionChangeAllowed(actor: AdminPolicyActor) {
  requireSuperAdmin(actor, "roles.manage");
}

export function assertHighestTrustAdminInvariant(activeSuperAdminCount: number, target: AdminPolicyTarget, change: AdminStateChange) {
  if (!Number.isSafeInteger(activeSuperAdminCount) || activeSuperAdminCount < 1) throw new Error("Administrator policy denied.");
  const removesActiveSuper = target.role === "SUPER_ADMIN" && target.isActive && ["delete", "disable", "demote"].includes(change);
  if (removesActiveSuper && activeSuperAdminCount <= 1) throw new Error("Administrator policy denied.");
}

export const SESSION_VERSION_INVALIDATION = {
  passwordChange: true, rolePromotion: true, roleDemotion: true,
  adminDisable: true, adminReEnable: true, rolePermissionChange: true,
  adminRoleAssignmentChange: true, adminDeletion: false,
} as const;
