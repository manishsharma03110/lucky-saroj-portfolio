"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

export async function updateMessageStatus(
  id: string,
  status: "new" | "read" | "replied" | "archived"
): Promise<void> {
  await requireAdmin();
  await db.update(schema.contactMessages).set({ status }).where(eq(schema.contactMessages.id, id));
  revalidatePath("/admin/messages");
}

export async function deleteMessage(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(schema.contactMessages).where(eq(schema.contactMessages.id, id));
  revalidatePath("/admin/messages");
}
