"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requirePermission } from "@/lib/auth/authorization";
import { testimonialSchema } from "@/lib/validations/testimonial";
import type { ActionState } from "./portfolio";
import { createTestimonialRecord, updateTestimonialRevision } from "@/lib/db/remaining-content-service";
import { ContentNotFoundError, StaleRevisionError } from "@/lib/db/mutation-errors";
import { revisionSchema } from "@/lib/validations/revision";
import { fieldErrorsFromIssues, InvalidActionInputError, SAFE_VALIDATION_MESSAGE } from "@/lib/validations/action-errors";
import { entityIdSchema } from "@/lib/validations/identifiers";

function parseForm(formData: FormData) {
  return testimonialSchema.safeParse({
    clientName: formData.get("clientName"),
    designation: formData.get("designation") ?? "",
    company: formData.get("company") ?? "",
    testimonialText: formData.get("testimonialText"),
    rating: formData.get("rating") || 5,
    isFeatured: formData.get("isFeatured"),
    status: formData.get("status"),
  });
}

export async function createTestimonial(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("testimonials.create");
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: fieldErrorsFromIssues(parsed.error.issues) };
  }
  await createTestimonialRecord(parsed.data);
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  revalidatePath("/services");
  return { status: "success", message: "Testimonial added." };
}

export async function updateTestimonial(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("testimonials.update");
  const parsedId = entityIdSchema.safeParse(id);
  const parsed = parseForm(formData);
  const revision = revisionSchema.safeParse(formData.get("revision"));
  if (!parsedId.success) return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: { id: "Invalid testimonial." } };
  if (!parsed.success) {
    return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: fieldErrorsFromIssues(parsed.error.issues) };
  }
  if (!revision.success) return { status: "error", message: "Invalid content revision. Reload before saving." };
  let nextRevision: number;
  try { nextRevision = await updateTestimonialRevision(parsedId.data, revision.data, parsed.data); }
  catch (error) {
    if (error instanceof StaleRevisionError || error instanceof ContentNotFoundError) return { status: "error", message: error.message };
    throw error;
  }
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  revalidatePath("/services");
  return { status: "success", message: "Testimonial updated.", revision: nextRevision };
}

export async function deleteTestimonial(id: string): Promise<void> {
  await requirePermission("testimonials.delete");
  const parsedId = entityIdSchema.safeParse(id);
  if (!parsedId.success) throw new InvalidActionInputError();
  await db.delete(schema.testimonials).where(eq(schema.testimonials.id, parsedId.data));
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  revalidatePath("/services");
}
