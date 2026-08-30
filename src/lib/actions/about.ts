"use server";

import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin";
import { aboutProfileSchema } from "@/lib/validations/about";
import type { ActionState } from "./portfolio";

export async function updateAboutProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAuthenticatedAdmin();
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

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { status: "error", message: "Please fix the errors below.", fieldErrors };
  }

  const existingRows = await db.select().from(schema.aboutProfile);
  const existing = existingRows[0];
  const data = parsed.data;

  if (existing) {
    await db.update(schema.aboutProfile)
      .set({
        name: data.name,
        headline: data.headline || null,
        biography: data.biography || null,
        yearsExperience: data.yearsExperience,
        projectsCompleted: data.projectsCompleted,
        clientCount: data.clientCount,
        viewsGenerated: data.viewsGenerated,
      });
  } else {
    await db.insert(schema.aboutProfile)
      .values({
        name: data.name,
        headline: data.headline || null,
        biography: data.biography || null,
        yearsExperience: data.yearsExperience,
        projectsCompleted: data.projectsCompleted,
        clientCount: data.clientCount,
        viewsGenerated: data.viewsGenerated,
      });
  }

  await db.delete(schema.aboutSkills);
  const skills = (data.skills ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  for (let i = 0; i < skills.length; i++) {
    await db.insert(schema.aboutSkills).values({ name: skills[i], displayOrder: i });
  }

  await db.delete(schema.aboutTools);
  const tools = (data.tools ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  for (let i = 0; i < tools.length; i++) {
    await db.insert(schema.aboutTools).values({ name: tools[i], displayOrder: i });
  }

  revalidatePath("/admin/about");
  revalidatePath("/about");
  revalidatePath("/");
  return { status: "success", message: "About page updated." };
}
