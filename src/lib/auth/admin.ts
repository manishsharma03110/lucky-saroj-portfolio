import "server-only";

import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  revalidateAdminSession,
  type TrustedAdmin,
} from "./admin-core";
import { authorizeAdminForApi } from "./admin-api";

async function findAdminById(id: string) {
  const rows = await db
    .select({
      id: schema.adminUsers.id,
      email: schema.adminUsers.email,
      name: schema.adminUsers.name,
      sessionVersion: schema.adminUsers.sessionVersion,
      isActive: schema.adminUsers.isActive,
    })
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function getCurrentAdmin(): Promise<TrustedAdmin | null> {
  try {
    return await revalidateAdminSession(await auth(), findAdminById);
  } catch {
    return null;
  }
}

export async function requireAuthenticatedAdmin(): Promise<TrustedAdmin> {
  return revalidateAdminSession(await auth(), findAdminById);
}

export async function requireAdminForApi() {
  return authorizeAdminForApi(requireAuthenticatedAdmin);
}
