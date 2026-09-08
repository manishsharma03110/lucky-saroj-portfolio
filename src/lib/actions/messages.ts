"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requirePermission } from "@/lib/auth/authorization";
import { updateMessageStatusRevision } from "@/lib/db/remaining-content-service";
import { ContentNotFoundError, StaleRevisionError } from "@/lib/db/mutation-errors";
import { revisionSchema } from "@/lib/validations/revision";
import { messageStatusSchema } from "@/lib/validations/message";
import { InvalidActionInputError } from "@/lib/validations/action-errors";
import { entityIdSchema } from "@/lib/validations/identifiers";

export async function updateMessageStatus(
  id: string,
  expectedRevision: unknown,
  status: unknown
): Promise<{ status: "success"; revision: number } | { status: "error"; message: string }> {
  await requirePermission("messages.update");
  const parsedId = entityIdSchema.safeParse(id);
  const parsedRevision = revisionSchema.safeParse(expectedRevision);
  const parsedStatus = messageStatusSchema.safeParse(status);
  if (!parsedId.success || !parsedRevision.success || !parsedStatus.success) return { status: "error", message: "Invalid message update." };
  let revision: number;
  try { revision = await updateMessageStatusRevision(parsedId.data, parsedRevision.data, parsedStatus.data); }
  catch (error) {
    if (error instanceof StaleRevisionError || error instanceof ContentNotFoundError) return { status: "error", message: error.message };
    throw error;
  }
  revalidatePath("/admin/messages");
  return { status: "success", revision };
}

export async function deleteMessage(id: string): Promise<void> {
  await requirePermission("messages.delete");
  const parsedId = entityIdSchema.safeParse(id);
  if (!parsedId.success) throw new InvalidActionInputError();
  await db.delete(schema.contactMessages).where(eq(schema.contactMessages.id, parsedId.data));
  revalidatePath("/admin/messages");
}
