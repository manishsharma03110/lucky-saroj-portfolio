"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requirePermission } from "@/lib/auth/authorization";
import { recordActivitySafely } from "@/lib/audit/activity-log";
import { categorySchema } from "@/lib/validations/category";
import type { ActionState } from "./portfolio";
import { createOrderedCategory } from "@/lib/db/remaining-content-service";
import { DuplicateSlugError } from "@/lib/db/mutation-errors";
import { fieldErrorsFromIssues, InvalidActionInputError, SAFE_VALIDATION_MESSAGE } from "@/lib/validations/action-errors";
import { entityIdSchema } from "@/lib/validations/identifiers";

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { admin } = await requirePermission("categories.create");
  const parsed = categorySchema.safeParse({ name: formData.get("name"), slug: formData.get("slug") });
  if (!parsed.success) return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: fieldErrorsFromIssues(parsed.error.issues) };
  try { await createOrderedCategory(parsed.data); }
  catch (error) { if (error instanceof DuplicateSlugError) return { status: "error", message: "A category with this slug already exists.", fieldErrors: { slug: "Slug already in use" } }; throw error; }
  await recordActivitySafely({ actor: admin, action: "create", resource: "category", summary: `Created category ${parsed.data.name}`, metadata: { name: parsed.data.name, slug: parsed.data.slug } });
  revalidatePath("/admin/categories"); revalidatePath("/portfolio");
  return { status: "success", message: "Category added." };
}

export async function deleteCategory(id: string): Promise<void> {
  const { admin } = await requirePermission("categories.delete");
  const parsedId = entityIdSchema.safeParse(id); if (!parsedId.success) throw new InvalidActionInputError();
  await db.delete(schema.portfolioCategories).where(eq(schema.portfolioCategories.id, parsedId.data));
  await recordActivitySafely({ actor: admin, action: "delete", resource: "category", resourceId: parsedId.data, summary: "Deleted category" });
  revalidatePath("/admin/categories"); revalidatePath("/portfolio");
}
