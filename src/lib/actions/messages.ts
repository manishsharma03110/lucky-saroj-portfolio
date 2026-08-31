"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requirePermission } from "@/lib/auth/authorization";

export async function updateMessageStatus(
  id: string,
  status: "new" | "read" | "replied" | "archived"
): Promise<void> {
  await requirePermission("messages.update");
  await db.update(schema.contactMessages).set({ status }).where(eq(schema.contactMessages.id, id));
  revalidatePath("/admin/messages");
}

export async function deleteMessage(id: string): Promise<void> {
  await requirePermission("messages.delete");
  await db.delete(schema.contactMessages).where(eq(schema.contactMessages.id, id));
  revalidatePath("/admin/messages");
}
