"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requirePermission } from "@/lib/auth/authorization";
import { recordActivitySafely } from "@/lib/audit/activity-log";
import { serviceSchema } from "@/lib/validations/service";
import type { ActionState } from "./portfolio";
import { createOrderedService, updateServiceRevision } from "@/lib/db/remaining-content-service";
import { ContentNotFoundError, StaleRevisionError } from "@/lib/db/mutation-errors";
import { revisionSchema } from "@/lib/validations/revision";
import { fieldErrorsFromIssues, InvalidActionInputError, SAFE_VALIDATION_MESSAGE } from "@/lib/validations/action-errors";
import { entityIdSchema } from "@/lib/validations/identifiers";

function parseForm(formData: FormData) {
  return serviceSchema.safeParse({
    name: formData.get("name"), description: formData.get("description") ?? "", icon: formData.get("icon"),
    isFeatured: formData.get("isFeatured"), isActive: formData.get("isActive"),
  });
}

export async function createService(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { admin } = await requirePermission("services.create");
  const parsed = parseForm(formData);
  if (!parsed.success) return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: fieldErrorsFromIssues(parsed.error.issues) };
  await createOrderedService(parsed.data);
  await recordActivitySafely({ actor: admin, action: "create", resource: "service", summary: `Created service ${parsed.data.name}`, metadata: { name: parsed.data.name, isFeatured: parsed.data.isFeatured, isActive: parsed.data.isActive } });
  revalidatePath("/admin/services"); revalidatePath("/services"); revalidatePath("/");
  return { status: "success", message: "Service added." };
}

export async function updateService(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { admin } = await requirePermission("services.update");
  const parsedId = entityIdSchema.safeParse(id); const parsed = parseForm(formData); const revision = revisionSchema.safeParse(formData.get("revision"));
  if (!parsedId.success) return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: { id: "Invalid service." } };
  if (!parsed.success) return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: fieldErrorsFromIssues(parsed.error.issues) };
  if (!revision.success) return { status: "error", message: "Invalid content revision. Reload before saving." };
  let nextRevision: number;
  try { nextRevision = await updateServiceRevision(parsedId.data, revision.data, parsed.data); }
  catch (error) { if (error instanceof StaleRevisionError || error instanceof ContentNotFoundError) return { status: "error", message: error.message }; throw error; }
  await recordActivitySafely({ actor: admin, action: "update", resource: "service", resourceId: parsedId.data, summary: `Updated service ${parsed.data.name}`, metadata: { previousRevision: revision.data, revision: nextRevision, isFeatured: parsed.data.isFeatured, isActive: parsed.data.isActive } });
  revalidatePath("/admin/services"); revalidatePath("/services"); revalidatePath("/");
  return { status: "success", message: "Service updated.", revision: nextRevision };
}

export async function deleteService(id: string): Promise<void> {
  const { admin } = await requirePermission("services.delete");
  const parsedId = entityIdSchema.safeParse(id); if (!parsedId.success) throw new InvalidActionInputError();
  await db.delete(schema.services).where(eq(schema.services.id, parsedId.data));
  await recordActivitySafely({ actor: admin, action: "delete", resource: "service", resourceId: parsedId.data, summary: "Deleted service" });
  revalidatePath("/admin/services"); revalidatePath("/services"); revalidatePath("/");
}
