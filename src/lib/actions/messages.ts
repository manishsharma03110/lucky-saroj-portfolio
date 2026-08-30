"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin";

export async function updateMessageStatus(
  id: string,
  status: "new" | "read" | "replied" | "archived"
): Promise<void> {
  await requireAuthenticatedAdmin();
  await db.update(schema.contactMessages).set({ status }).where(eq(schema.contactMessages.id, id));
  revalidatePath("/admin/messages");
}

export async function deleteMessage(id: string): Promise<void> {
  await requireAuthenticatedAdmin();
  await db.delete(schema.contactMessages).where(eq(schema.contactMessages.id, id));
  revalidatePath("/admin/messages");
}
