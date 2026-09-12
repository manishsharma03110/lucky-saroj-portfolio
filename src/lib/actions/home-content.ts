"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/authorization";
import { recordActivitySafely } from "@/lib/audit/activity-log";
import { homePageContentSchema } from "@/lib/validations/home-content";
import { revisionSchema } from "@/lib/validations/revision";
import { updateHomePageContent } from "@/lib/db/home-content-service";
import { ContentNotFoundError, StaleRevisionError } from "@/lib/db/mutation-errors";
import type { ActionState } from "./portfolio";
import { fieldErrorsFromIssues, SAFE_VALIDATION_MESSAGE } from "@/lib/validations/action-errors";

export async function saveHomePageContent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requirePermission("settings.update");
  const parsed = homePageContentSchema.safeParse(Object.fromEntries(formData.entries()));
  const revision = revisionSchema.safeParse(formData.get("revision"));
  if (!parsed.success || !revision.success) {
    const fieldErrors = parsed.success ? {} : fieldErrorsFromIssues(parsed.error.issues);
    return { status: "error", message: revision.success ? SAFE_VALIDATION_MESSAGE : "Invalid content revision. Reload before saving.", fieldErrors };
  }
  try {
    await updateHomePageContent(parsed.data, revision.data);
  } catch (error) {
    if (error instanceof StaleRevisionError || error instanceof ContentNotFoundError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
  await recordActivitySafely({ actor: auth.admin, action: "update", resource: "home", resourceId: "singleton:home", summary: "Updated homepage content.", metadata: { previousRevision: revision.data } });
  revalidatePath("/");
  revalidatePath("/admin/home");
  return { status: "success", message: "Homepage content updated." };
}
