"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requirePermission } from "@/lib/auth/authorization";
import { recordActivitySafely } from "@/lib/audit/activity-log";
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
  const operation = "messages.updateStatus";
  console.info({ operation, result: "started" });
  let authorization;
  try { authorization = await requirePermission("messages.update"); }
  catch (error) {
    console.info({ operation, result: "authorization_check_failed" });
    throw error;
  }
  const parsedId = entityIdSchema.safeParse(id);
  const parsedRevision = revisionSchema.safeParse(expectedRevision);
  const parsedStatus = messageStatusSchema.safeParse(status);
  // Only validated scalar fields enter diagnostics; never include raw inputs or errors.
  const diagnostic = {
    operation,
    ...(parsedId.success ? { messageId: parsedId.data } : {}),
    ...(parsedRevision.success ? { expectedRevision: parsedRevision.data } : {}),
    ...(parsedStatus.success ? { requestedStatus: parsedStatus.data } : {}),
  };
  if (!parsedId.success || !parsedRevision.success || !parsedStatus.success) {
    console.info({ ...diagnostic, result: "validation_failed" });
    return { status: "error", message: "Invalid message update." };
  }
  console.info({ ...diagnostic, result: "validated" });
  let revision: number;
  try { revision = await updateMessageStatusRevision(parsedId.data, parsedRevision.data, parsedStatus.data); }
  catch (error) {
    console.info({ ...diagnostic, result: error instanceof StaleRevisionError ? "stale" : error instanceof ContentNotFoundError ? "not_found" : "mutation_failed" });
    if (error instanceof StaleRevisionError || error instanceof ContentNotFoundError) return { status: "error", message: error.message };
    throw error;
  }
  await recordActivitySafely({
    actor: authorization.admin,
    action: parsedStatus.data === "archived" ? "archive" : "status_update",
    resource: "contact_message",
    resourceId: parsedId.data,
    summary: `Changed enquiry status to ${parsedStatus.data}`,
    metadata: { status: parsedStatus.data, revision },
  });
  console.info({ ...diagnostic, result: "committed", returnedRevision: revision });
  try {
    revalidatePath("/admin/messages");
    revalidatePath("/admin/activity");
  }
  catch (error) {
    console.info({ ...diagnostic, result: "revalidation_failed", returnedRevision: revision });
    throw error;
  }
  console.info({ ...diagnostic, result: "success", returnedRevision: revision });
  return { status: "success", revision };
}

export async function deleteMessage(id: string): Promise<void> {
  const authorization = await requirePermission("messages.delete");
  const parsedId = entityIdSchema.safeParse(id);
  if (!parsedId.success) throw new InvalidActionInputError();
  await db.delete(schema.contactMessages).where(eq(schema.contactMessages.id, parsedId.data));
  await recordActivitySafely({
    actor: authorization.admin,
    action: "delete",
    resource: "contact_message",
    resourceId: parsedId.data,
    summary: "Deleted contact enquiry",
  });
  revalidatePath("/admin/messages");
  revalidatePath("/admin/activity");
}
