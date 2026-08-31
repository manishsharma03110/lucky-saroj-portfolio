import { isPermissionKey, isRoleKey, type PermissionKey, type RoleKey } from "./permissions";

export type AuthorizationFailure = "missing-role" | "invalid-role" | "invalid-permission" | "missing-permission" | "unavailable";

export class AuthorizationError extends Error {
  constructor(public readonly reason: AuthorizationFailure) {
    super("Administrator authorization failed.");
    this.name = "AuthorizationError";
  }
}

export type AuthorizationContext = {
  admin: { id: string; email: string; name: string };
  role: RoleKey;
  permissions: ReadonlySet<PermissionKey>;
};

export type AuthorizationIdentity = AuthorizationContext["admin"];
export type AuthorizationRow = { role: unknown; permission: unknown };

export function createAuthorizationService(dependencies: {
  authenticate: () => Promise<AuthorizationIdentity>;
  findAuthorizationRows: (adminId: string) => Promise<AuthorizationRow[]>;
}) {
  async function getAuthorizationContext(): Promise<AuthorizationContext> {
    const admin = await dependencies.authenticate();
    try {
      const rows = await dependencies.findAuthorizationRows(admin.id);
      if (rows.length === 0) throw new AuthorizationError("missing-role");
      if (!isRoleKey(rows[0].role)) throw new AuthorizationError("invalid-role");
      const permissions = new Set<PermissionKey>();
      for (const row of rows) {
        if (row.permission !== null && !isPermissionKey(row.permission)) throw new AuthorizationError("invalid-permission");
        if (row.permission !== null) permissions.add(row.permission);
      }
      return { admin, role: rows[0].role, permissions };
    } catch (error) {
      if (error instanceof AuthorizationError) throw error;
      throw new AuthorizationError("unavailable");
    }
  }
  return {
    getAuthorizationContext,
    async requirePermission(permission: PermissionKey) {
      return authorizePermission(await getAuthorizationContext(), permission);
    },
    async requireAnyPermission(permissions: readonly PermissionKey[]) {
      return authorizeAnyPermission(await getAuthorizationContext(), permissions);
    },
  };
}

export function hasPermission(context: AuthorizationContext, permission: PermissionKey): boolean {
  return context.permissions.has(permission);
}

export function authorizePermission(context: AuthorizationContext, permission: unknown): AuthorizationContext {
  if (!isRoleKey(context.role)) throw new AuthorizationError("invalid-role");
  if (!isPermissionKey(permission)) throw new AuthorizationError("invalid-permission");
  if (!hasPermission(context, permission)) throw new AuthorizationError("missing-permission");
  return context;
}

export function authorizeAnyPermission(context: AuthorizationContext, permissions: readonly unknown[]): AuthorizationContext {
  if (!isRoleKey(context.role)) throw new AuthorizationError("invalid-role");
  if (permissions.length === 0 || permissions.some((permission) => !isPermissionKey(permission))) {
    throw new AuthorizationError("invalid-permission");
  }
  if (!permissions.some((permission) => context.permissions.has(permission as PermissionKey))) {
    throw new AuthorizationError("missing-permission");
  }
  return context;
}
