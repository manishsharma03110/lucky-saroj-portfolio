"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { auth } from "@/lib/auth";
import { serviceSchema } from "@/lib/validations/service";
import type { ActionState } from "./portfolio";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

function parseForm(formData: FormData) {
  return serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    icon: formData.get("icon"),
    isFeatured: formData.get("isFeatured") === "on",
    isActive: formData.get("isActive") === "on",
  });
}

export async function createService(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: { name: parsed.error.issues[0]?.message ?? "Invalid input" } };
  }
  const all = await db.select().from(schema.services);
  await db.insert(schema.services)
    .values({
      name: parsed.data.name,
      description: parsed.data.description || null,
      icon: parsed.data.icon,
      isFeatured: !!parsed.data.isFeatured,
      isActive: parsed.data.isActive ?? true,
      displayOrder: all.length,
    });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
  return { status: "success", message: "Service added." };
}

export async function updateService(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: { name: parsed.error.issues[0]?.message ?? "Invalid input" } };
  }
  await db.update(schema.services)
    .set({
      name: parsed.data.name,
      description: parsed.data.description || null,
      icon: parsed.data.icon,
      isFeatured: !!parsed.data.isFeatured,
      isActive: parsed.data.isActive ?? true,
    })
    .where(eq(schema.services.id, id));
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
  return { status: "success", message: "Service updated." };
}

export async function deleteService(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(schema.services).where(eq(schema.services.id, id));
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
}
