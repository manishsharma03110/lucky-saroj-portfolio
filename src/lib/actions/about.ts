"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/authorization";
import { aboutProfileSchema } from "@/lib/validations/about";
import { revisionSchema } from "@/lib/validations/revision";
import { replaceAbout } from "@/lib/db/about-service";
import { DuplicateContentError, StaleRevisionError } from "@/lib/db/mutation-errors";
import type { ActionState } from "./portfolio";
import { fieldErrorsFromIssues, SAFE_VALIDATION_MESSAGE } from "@/lib/validations/action-errors";

export async function updateAboutProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("about.update");
  const parsed = aboutProfileSchema.safeParse({
    name: formData.get("name"),
    headline: formData.get("headline") ?? "",
    biography: formData.get("biography") ?? "",
    yearsExperience: formData.get("yearsExperience"),
    projectsCompleted: formData.get("projectsCompleted"),
    clientCount: formData.get("clientCount"),
    viewsGenerated: formData.get("viewsGenerated"),
    skills: formData.get("skills") ?? "",
    tools: formData.get("tools") ?? "",
  });
  const revision = revisionSchema.safeParse(formData.get("revision"));

  if (!parsed.success || !revision.success) {
    const fieldErrors = parsed.success ? {} : fieldErrorsFromIssues(parsed.error.issues);
    return { status: "error", message: revision.success ? SAFE_VALIDATION_MESSAGE : "Invalid content revision. Reload before saving.", fieldErrors };
  }
  const data = parsed.data;
  const skills = (data.skills ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const tools = (data.tools ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  try {
    await replaceAbout({ expectedRevision: revision.data, name: data.name, headline: data.headline || null, biography: data.biography || null, yearsExperience: data.yearsExperience, projectsCompleted: data.projectsCompleted, clientCount: data.clientCount, viewsGenerated: data.viewsGenerated, skills: skills.map((name, displayOrder) => ({ name, displayOrder })), tools: tools.map((name, displayOrder) => ({ name, displayOrder })) });
  } catch (error) {
    if (error instanceof StaleRevisionError || error instanceof DuplicateContentError) return { status: "error", message: error.message };
    throw error;
  }

  revalidatePath("/admin/about");
  revalidatePath("/about");
  revalidatePath("/");
  return { status: "success", message: "About page updated." };
}
