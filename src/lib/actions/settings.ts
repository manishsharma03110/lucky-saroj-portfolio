"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/authorization";
import { settingsSchema } from "@/lib/validations/settings";
import { revisionSchema } from "@/lib/validations/revision";
import { updateSingletonSettings } from "@/lib/db/singleton-content-service";
import { ContentNotFoundError, StaleRevisionError } from "@/lib/db/mutation-errors";
import type { ActionState } from "./portfolio";
import { fieldErrorsFromIssues, SAFE_VALIDATION_MESSAGE } from "@/lib/validations/action-errors";
import { MediaAssetBindingError, MediaAssetNotAttachableError, MediaAssetNotFoundError } from "@/lib/db/media-asset-service";

export async function updateSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("settings.update");
  const raw = Object.fromEntries(formData.entries());
  const parsed = settingsSchema.safeParse(raw);
  const revision = revisionSchema.safeParse(formData.get("revision"));
  if (!parsed.success || !revision.success) {
    const fieldErrors = parsed.success ? {} : fieldErrorsFromIssues(parsed.error.issues);
    return { status: "error", message: revision.success ? SAFE_VALIDATION_MESSAGE : "Invalid content revision. Reload before saving.", fieldErrors };
  }

  const data = parsed.data;
  try { await updateSingletonSettings(data, revision.data); }
  catch (error) {
    if (error instanceof MediaAssetBindingError || error instanceof MediaAssetNotAttachableError || error instanceof MediaAssetNotFoundError) {
      return { status: "error", message: "Uploaded Hero image is invalid or no longer available." };
    }
    if (error instanceof StaleRevisionError || error instanceof ContentNotFoundError) return { status: "error", message: error.message };
    throw error;
  }

  revalidatePath("/", "layout");
  revalidatePath("/contact");
  revalidatePath("/admin/settings");
  return { status: "success", message: "Settings updated." };
}
