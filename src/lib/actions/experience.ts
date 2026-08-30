"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin";
import { experienceSchema } from "@/lib/validations/experience";
import type { ActionState } from "./portfolio";

function parseForm(formData: FormData) {
  return experienceSchema.safeParse({
    role: formData.get("role"),
    company: formData.get("company"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") ?? "",
    isCurrent: formData.get("isCurrent") === "on",
    location: formData.get("location") ?? "",
    description: formData.get("description") ?? "",
  });
}

export async function createExperience(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAuthenticatedAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: { role: parsed.error.issues[0]?.message ?? "Invalid input" } };
  }
  const all = await db.select().from(schema.experiences);
  await db.insert(schema.experiences)
    .values({
      role: parsed.data.role,
      company: parsed.data.company,
      startDate: parsed.data.startDate,
      endDate: parsed.data.isCurrent ? null : parsed.data.endDate || null,
      isCurrent: !!parsed.data.isCurrent,
      location: parsed.data.location || null,
      description: parsed.data.description || null,
      displayOrder: all.length,
    });
  revalidatePath("/admin/experience");
  revalidatePath("/experience");
  revalidatePath("/about");
  return { status: "success", message: "Experience added." };
}

export async function updateExperience(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAuthenticatedAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: { role: parsed.error.issues[0]?.message ?? "Invalid input" } };
  }
  await db.update(schema.experiences)
    .set({
      role: parsed.data.role,
      company: parsed.data.company,
      startDate: parsed.data.startDate,
      endDate: parsed.data.isCurrent ? null : parsed.data.endDate || null,
      isCurrent: !!parsed.data.isCurrent,
      location: parsed.data.location || null,
      description: parsed.data.description || null,
    })
    .where(eq(schema.experiences.id, id));
  revalidatePath("/admin/experience");
  revalidatePath("/experience");
  revalidatePath("/about");
  return { status: "success", message: "Experience updated." };
}

export async function deleteExperience(id: string): Promise<void> {
  await requireAuthenticatedAdmin();
  await db.delete(schema.experiences).where(eq(schema.experiences.id, id));
  revalidatePath("/admin/experience");
  revalidatePath("/experience");
  revalidatePath("/about");
}
