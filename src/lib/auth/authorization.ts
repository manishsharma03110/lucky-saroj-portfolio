import "server-only";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { requireAuthenticatedAdmin } from "./admin";
import { createAuthorizationService } from "./authorization-core";
import type { PermissionKey } from "./permissions";

const authorizationService = createAuthorizationService({
  authenticate: requireAuthenticatedAdmin,
  findAuthorizationRows: async (adminId) => db.select({ role: schema.roles.key, permission: schema.permissions.key })
    .from(schema.adminUsers)
    .innerJoin(schema.roles, eq(schema.adminUsers.roleId, schema.roles.id))
    .leftJoin(schema.rolePermissions, eq(schema.roles.id, schema.rolePermissions.roleId))
    .leftJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
    .where(eq(schema.adminUsers.id, adminId)),
});

export const getAuthorizationContext = authorizationService.getAuthorizationContext;

export async function requirePermission(permission: PermissionKey) {
  return authorizationService.requirePermission(permission);
}

export async function requireAnyPermission(permissions: readonly PermissionKey[]) {
  return authorizationService.requireAnyPermission(permissions);
}

export async function requirePermissionForApi(permission: PermissionKey) {
  try {
    return { ok: true as const, admin: (await requirePermission(permission)).admin };
  } catch {
    return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
}
