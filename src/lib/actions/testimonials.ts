"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/authorization";
import { recordActivitySafely } from "@/lib/audit/activity-log";
import { testimonialSchema } from "@/lib/validations/testimonial";
import type { ActionState } from "./portfolio";
import { createTestimonialRecord, updateTestimonialRevision } from "@/lib/db/remaining-content-service";
import { ContentNotFoundError, StaleRevisionError } from "@/lib/db/mutation-errors";
import { revisionSchema } from "@/lib/validations/revision";
import { fieldErrorsFromIssues, InvalidActionInputError, SAFE_VALIDATION_MESSAGE } from "@/lib/validations/action-errors";
import { entityIdSchema } from "@/lib/validations/identifiers";
import { MediaAssetBindingError, MediaAssetNotAttachableError, MediaAssetNotFoundError } from "@/lib/db/media-asset-service";
import { deleteTestimonialWithMedia } from "@/lib/db/testimonial-media-service";

function parseForm(formData: FormData) {
  return testimonialSchema.safeParse({ clientName: formData.get("clientName"), designation: formData.get("designation") ?? "", company: formData.get("company") ?? "", profileImageUrl: formData.get("profileImageUrl") ?? "", profileImageAssetId: formData.get("profileImageAssetId") ?? "", testimonialText: formData.get("testimonialText"), rating: formData.get("rating") || 5, isFeatured: formData.get("isFeatured"), status: formData.get("status") });
}

function mediaErrorState(error: unknown): ActionState | null {
  if (error instanceof MediaAssetBindingError || error instanceof MediaAssetNotAttachableError || error instanceof MediaAssetNotFoundError) return { status: "error", message: "Uploaded profile image is invalid or no longer available." };
  return null;
}

export async function createTestimonial(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { admin } = await requirePermission("testimonials.create");
  const parsed = parseForm(formData);
  if (!parsed.success) return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: fieldErrorsFromIssues(parsed.error.issues) };
  try { await createTestimonialRecord(parsed.data); }
  catch (error) { const mediaState = mediaErrorState(error); if (mediaState) return mediaState; throw error; }
  await recordActivitySafely({ actor: admin, action: "create", resource: "testimonial", summary: `Created testimonial for ${parsed.data.clientName}`, metadata: { clientName: parsed.data.clientName, company: parsed.data.company, rating: parsed.data.rating, isFeatured: parsed.data.isFeatured, status: parsed.data.status } });
  revalidatePath("/admin/testimonials"); revalidatePath("/"); revalidatePath("/services");
  return { status: "success", message: "Testimonial added." };
}

export async function updateTestimonial(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { admin } = await requirePermission("testimonials.update");
  const parsedId = entityIdSchema.safeParse(id); const parsed = parseForm(formData); const revision = revisionSchema.safeParse(formData.get("revision"));
  if (!parsedId.success) return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: { id: "Invalid testimonial." } };
  if (!parsed.success) return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: fieldErrorsFromIssues(parsed.error.issues) };
  if (!revision.success) return { status: "error", message: "Invalid content revision. Reload before saving." };
  let nextRevision: number;
  try { nextRevision = await updateTestimonialRevision(parsedId.data, revision.data, parsed.data); }
  catch (error) { const mediaState = mediaErrorState(error); if (mediaState) return mediaState; if (error instanceof StaleRevisionError || error instanceof ContentNotFoundError) return { status: "error", message: error.message }; throw error; }
  await recordActivitySafely({ actor: admin, action: "update", resource: "testimonial", resourceId: parsedId.data, summary: `Updated testimonial for ${parsed.data.clientName}`, metadata: { previousRevision: revision.data, revision: nextRevision, status: parsed.data.status, isFeatured: parsed.data.isFeatured } });
  revalidatePath("/admin/testimonials"); revalidatePath("/"); revalidatePath("/services");
  return { status: "success", message: "Testimonial updated.", revision: nextRevision };
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { admin } = await requirePermission("testimonials.delete");
  const parsedId = entityIdSchema.safeParse(id); if (!parsedId.success) throw new InvalidActionInputError();
  await deleteTestimonialWithMedia(parsedId.data);
  await recordActivitySafely({ actor: admin, action: "delete", resource: "testimonial", resourceId: parsedId.data, summary: "Deleted testimonial" });
  revalidatePath("/admin/testimonials"); revalidatePath("/"); revalidatePath("/services");
}
