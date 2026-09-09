"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/authorization";
import { showreelSchema } from "@/lib/validations/showreel";
import { revisionSchema } from "@/lib/validations/revision";
import { upsertSingletonShowreel } from "@/lib/db/singleton-content-service";
import { ContentNotFoundError, InvalidSingletonStateError, StaleRevisionError } from "@/lib/db/mutation-errors";
import type { ActionState } from "./portfolio";
import { fieldErrorsFromIssues, SAFE_VALIDATION_MESSAGE } from "@/lib/validations/action-errors";
import { MediaAssetBindingError, MediaAssetNotAttachableError, MediaAssetNotFoundError } from "@/lib/db/media-asset-service";

export async function upsertShowreel(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("showreel.update");
  const parsed = showreelSchema.safeParse({
    title: formData.get("title"),
    videoUrl: formData.get("videoUrl"),
    videoAssetId: formData.get("videoAssetId"),
    thumbnailUrl: formData.get("thumbnailUrl"),
    thumbnailAssetId: formData.get("thumbnailAssetId"),
    duration: formData.get("duration") ?? "",
    isFeatured: formData.get("isFeatured"),
    status: formData.get("status"),
  });
  const rawRevision = formData.get("revision");
  const revision = rawRevision === "" ? null : revisionSchema.safeParse(rawRevision);
  if (!parsed.success) {
    return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: fieldErrorsFromIssues(parsed.error.issues) };
  }
  if (revision !== null && !revision.success) return { status: "error", message: "Invalid content revision. Reload before saving." };
  const data = parsed.data;
  try { await upsertSingletonShowreel({ ...data, thumbnailUrl: data.thumbnailUrl || null }, revision === null ? null : revision.data); }
  catch (error) {
    if (error instanceof StaleRevisionError || error instanceof ContentNotFoundError || error instanceof InvalidSingletonStateError) return { status: "error", message: error.message };
    if (error instanceof MediaAssetBindingError || error instanceof MediaAssetNotAttachableError || error instanceof MediaAssetNotFoundError) return { status: "error", message: "Uploaded media is invalid or no longer available." };
    throw error;
  }

  revalidatePath("/admin/showreel");
  revalidatePath("/");
  return { status: "success", message: "Showreel updated." };
}
