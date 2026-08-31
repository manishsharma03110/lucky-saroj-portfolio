import "server-only";

import { withDatabaseTransaction, type DatabaseTransaction } from "@/lib/db";
import { isPermissionKey, isRoleKey, type PermissionKey, type RoleKey } from "./permissions";
import {
  assertAdminStateChangeAllowed,
  assertHighestTrustAdminInvariant,
  assertRoleAssignmentAllowed,
  assertRolePermissionChangeAllowed,
  type AdminPolicyActor,
  type AdminPolicyTarget,
} from "./admin-role-policy";

type TransactionRunner = <T>(work: (transaction: DatabaseTransaction) => Promise<T>) => Promise<T>;
type ActorSession = { actorId: string; actorSessionVersion: number };
type AdminRow = { id: string; role: string; is_active: boolean; session_version: number };

const SECURITY_LOCK_ID = 3_003_001;
const POLICY_DENIED = "Administrator policy denied.";

async function lockSecurityDomain(tx: DatabaseTransaction) {
  await tx.query("SELECT pg_advisory_xact_lock($1)", [SECURITY_LOCK_ID]);
}

async function loadActor(tx: DatabaseTransaction, input: ActorSession, permission: PermissionKey): Promise<AdminPolicyActor> {
  const result = await tx.query<AdminRow>(
    `SELECT a.id, r.key AS role, a.is_active, a.session_version
       FROM admin_users a JOIN roles r ON r.id = a.role_id
      WHERE a.id = $1 FOR UPDATE OF a`,
    [input.actorId]
  );
  const row = result.rows[0];
  if (!row || !row.is_active || row.session_version !== input.actorSessionVersion || !isRoleKey(row.role)) throw new Error(POLICY_DENIED);
  const grant = await tx.query(
    `SELECT 1 FROM role_permissions rp JOIN permissions p ON p.id = rp.permission_id
      WHERE rp.role_id = (SELECT role_id FROM admin_users WHERE id = $1) AND p.key = $2 LIMIT 1`,
    [row.id, permission]
  );
  const actor = { id: row.id, role: row.role, isActive: row.is_active, permissions: new Set<PermissionKey>(grant.rowCount === 1 ? [permission] : []) };
  if (permission === "admin_users.manage") assertRoleAssignmentAllowed(actor, "EDITOR");
  else assertRolePermissionChangeAllowed(actor);
  return actor;
}

async function loadTarget(tx: DatabaseTransaction, id: string): Promise<AdminRow> {
  const result = await tx.query<AdminRow>(
    `SELECT a.id, r.key AS role, a.is_active, a.session_version
       FROM admin_users a JOIN roles r ON r.id = a.role_id
      WHERE a.id = $1 FOR UPDATE OF a`, [id]
  );
  if (!result.rows[0] || !isRoleKey(result.rows[0].role)) throw new Error(POLICY_DENIED);
  return result.rows[0];
}

async function lockAndCountActiveSuperAdmins(tx: DatabaseTransaction): Promise<number> {
  const locked = await tx.query(
    `SELECT a.id FROM admin_users a JOIN roles r ON r.id = a.role_id
      WHERE a.is_active = true AND r.key = 'SUPER_ADMIN' ORDER BY a.id FOR UPDATE OF a`
  );
  return locked.rowCount ?? locked.rows.length;
}

async function assertPostInvariant(tx: DatabaseTransaction) {
  const result = await tx.query(
    `SELECT count(*)::int AS count FROM admin_users a JOIN roles r ON r.id = a.role_id
      WHERE a.is_active = true AND r.key = 'SUPER_ADMIN'`
  );
  if (Number(result.rows[0]?.count ?? 0) < 1) throw new Error(POLICY_DENIED);
}

export function createAdminRoleService(runTransaction: TransactionRunner = withDatabaseTransaction) {
  return {
    assignRole(input: ActorSession & { targetAdminId: string; role: RoleKey }) {
      return runTransaction(async (tx) => {
        await lockSecurityDomain(tx);
        const actor = await loadActor(tx, input, "admin_users.manage");
        assertRoleAssignmentAllowed(actor, input.role);
        const activeCount = await lockAndCountActiveSuperAdmins(tx);
        const target = await loadTarget(tx, input.targetAdminId);
        const targetPolicy: AdminPolicyTarget = { id: target.id, role: target.role as RoleKey, isActive: target.is_active };
        if (target.role === "SUPER_ADMIN" && input.role !== "SUPER_ADMIN") {
          assertAdminStateChangeAllowed(actor, targetPolicy, "demote");
          assertHighestTrustAdminInvariant(activeCount, targetPolicy, "demote");
        }
        const role = await tx.query<{ id: string; key: string }>("SELECT id, key FROM roles WHERE key = $1 FOR UPDATE", [input.role]);
        if (!role.rows[0] || !isRoleKey(role.rows[0].key)) throw new Error(POLICY_DENIED);
        const updated = await tx.query(
          "UPDATE admin_users SET role_id = $1, session_version = session_version + 1 WHERE id = $2",
          [role.rows[0].id, target.id]
        );
        if (updated.rowCount !== 1) throw new Error(POLICY_DENIED);
        await assertPostInvariant(tx);
      });
    },

    setActive(input: ActorSession & { targetAdminId: string; active: boolean }) {
      return runTransaction(async (tx) => {
        await lockSecurityDomain(tx);
        const actor = await loadActor(tx, input, "admin_users.manage");
        const activeCount = await lockAndCountActiveSuperAdmins(tx);
        const target = await loadTarget(tx, input.targetAdminId);
        const targetPolicy = { id: target.id, role: target.role as RoleKey, isActive: target.is_active };
        assertAdminStateChangeAllowed(actor, targetPolicy, input.active ? "enable" : "disable");
        if (!input.active) assertHighestTrustAdminInvariant(activeCount, targetPolicy, "disable");
        const updated = await tx.query(
          "UPDATE admin_users SET is_active = $1, session_version = session_version + 1 WHERE id = $2",
          [input.active, target.id]
        );
        if (updated.rowCount !== 1) throw new Error(POLICY_DENIED);
        await assertPostInvariant(tx);
      });
    },

    deleteAdmin(input: ActorSession & { targetAdminId: string }) {
      return runTransaction(async (tx) => {
        await lockSecurityDomain(tx);
        const actor = await loadActor(tx, input, "admin_users.manage");
        const activeCount = await lockAndCountActiveSuperAdmins(tx);
        const target = await loadTarget(tx, input.targetAdminId);
        const targetPolicy = { id: target.id, role: target.role as RoleKey, isActive: target.is_active };
        assertAdminStateChangeAllowed(actor, targetPolicy, "delete");
        assertHighestTrustAdminInvariant(activeCount, targetPolicy, "delete");
        const deleted = await tx.query("DELETE FROM admin_users WHERE id = $1", [target.id]);
        if (deleted.rowCount !== 1) throw new Error(POLICY_DENIED);
        await assertPostInvariant(tx);
      });
    },

    replaceRolePermissions(input: ActorSession & { role: RoleKey; permissions: readonly PermissionKey[] }) {
      return runTransaction(async (tx) => {
        await lockSecurityDomain(tx);
        await loadActor(tx, input, "roles.manage");
        if (!isRoleKey(input.role) || input.permissions.some((key) => !isPermissionKey(key)) || new Set(input.permissions).size !== input.permissions.length) throw new Error(POLICY_DENIED);
        const role = await tx.query<{ id: string }>("SELECT id FROM roles WHERE key = $1 FOR UPDATE", [input.role]);
        if (!role.rows[0]) throw new Error(POLICY_DENIED);
        const permissions = await tx.query<{ id: string; key: string }>("SELECT id, key FROM permissions WHERE key = ANY($1::text[]) ORDER BY key FOR UPDATE", [input.permissions]);
        if (permissions.rows.length !== input.permissions.length) throw new Error(POLICY_DENIED);
        await tx.query("DELETE FROM role_permissions WHERE role_id = $1", [role.rows[0].id]);
        if (permissions.rows.length > 0) {
          await tx.query(
            "INSERT INTO role_permissions(role_id, permission_id) SELECT $1, unnest($2::text[])",
            [role.rows[0].id, permissions.rows.map((row) => row.id)]
          );
        }
        const invalidated = await tx.query(
          "UPDATE admin_users SET session_version = session_version + 1 WHERE role_id = $1",
          [role.rows[0].id]
        );
        if (invalidated.rowCount === null) throw new Error(POLICY_DENIED);
        await assertPostInvariant(tx);
      });
    },
  };
}

export const adminRoleService = createAdminRoleService();
