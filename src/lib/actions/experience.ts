"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requirePermission } from "@/lib/auth/authorization";
import { recordActivitySafely } from "@/lib/audit/activity-log";
import { experienceSchema } from "@/lib/validations/experience";
import type { ActionState } from "./portfolio";
import { createOrderedExperience, updateExperienceRevision } from "@/lib/db/remaining-content-service";
import { ContentNotFoundError, StaleRevisionError } from "@/lib/db/mutation-errors";
import { revisionSchema } from "@/lib/validations/revision";
import { fieldErrorsFromIssues, InvalidActionInputError, SAFE_VALIDATION_MESSAGE } from "@/lib/validations/action-errors";
import { entityIdSchema } from "@/lib/validations/identifiers";

function parseForm(formData: FormData) {
  return experienceSchema.safeParse({ role: formData.get("role"), company: formData.get("company"), startDate: formData.get("startDate"), endDate: formData.get("endDate") ?? "", isCurrent: formData.get("isCurrent"), location: formData.get("location") ?? "", description: formData.get("description") ?? "" });
}

export async function createExperience(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { admin } = await requirePermission("experience.create");
  const parsed = parseForm(formData);
  if (!parsed.success) return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: fieldErrorsFromIssues(parsed.error.issues) };
  await createOrderedExperience(parsed.data);
  await recordActivitySafely({ actor: admin, action: "create", resource: "experience", summary: `Created experience ${parsed.data.role} at ${parsed.data.company}`, metadata: { role: parsed.data.role, company: parsed.data.company, isCurrent: parsed.data.isCurrent } });
  revalidatePath("/admin/experience"); revalidatePath("/experience"); revalidatePath("/about");
  return { status: "success", message: "Experience added." };
}

export async function updateExperience(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { admin } = await requirePermission("experience.update");
  const parsedId = entityIdSchema.safeParse(id); const parsed = parseForm(formData); const revision = revisionSchema.safeParse(formData.get("revision"));
  if (!parsedId.success) return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: { id: "Invalid experience." } };
  if (!parsed.success) return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: fieldErrorsFromIssues(parsed.error.issues) };
  if (!revision.success) return { status: "error", message: "Invalid content revision. Reload before saving." };
  let nextRevision: number;
  try { nextRevision = await updateExperienceRevision(parsedId.data, revision.data, parsed.data); }
  catch (error) { if (error instanceof StaleRevisionError || error instanceof ContentNotFoundError) return { status: "error", message: error.message }; throw error; }
  await recordActivitySafely({ actor: admin, action: "update", resource: "experience", resourceId: parsedId.data, summary: `Updated experience ${parsed.data.role} at ${parsed.data.company}`, metadata: { previousRevision: revision.data, revision: nextRevision, isCurrent: parsed.data.isCurrent } });
  revalidatePath("/admin/experience"); revalidatePath("/experience"); revalidatePath("/about");
  return { status: "success", message: "Experience updated.", revision: nextRevision };
}

export async function deleteExperience(id: string): Promise<void> {
  const { admin } = await requirePermission("experience.delete");
  const parsedId = entityIdSchema.safeParse(id); if (!parsedId.success) throw new InvalidActionInputError();
  await db.delete(schema.experiences).where(eq(schema.experiences.id, parsedId.data));
  await recordActivitySafely({ actor: admin, action: "delete", resource: "experience", resourceId: parsedId.data, summary: "Deleted experience" });
  revalidatePath("/admin/experience"); revalidatePath("/experience"); revalidatePath("/about");
}
