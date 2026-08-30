"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin";
import { categorySchema } from "@/lib/validations/category";
import type { ActionState } from "./portfolio";

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAuthenticatedAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: { name: parsed.error.issues[0]?.message ?? "Invalid input" } };
  }

  const existingRows = await db.select().from(schema.portfolioCategories).where(eq(schema.portfolioCategories.slug, parsed.data.slug));
  if (existingRows[0]) {
    return { status: "error", message: "A category with this slug already exists." };
  }

  const all = await db.select().from(schema.portfolioCategories);
  await db.insert(schema.portfolioCategories).values({ ...parsed.data, displayOrder: all.length });

  revalidatePath("/admin/categories");
  revalidatePath("/portfolio");
  return { status: "success", message: "Category added." };
}

export async function deleteCategory(id: string): Promise<void> {
  await requireAuthenticatedAdmin();
  await db.delete(schema.portfolioCategories).where(eq(schema.portfolioCategories.id, id));
  revalidatePath("/admin/categories");
  revalidatePath("/portfolio");
}
