"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin";
import { projectSchema } from "@/lib/validations/project";

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

function parseProjectForm(formData: FormData) {
  return projectSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    clientName: formData.get("clientName") ?? "",
    year: formData.get("year") || undefined,
    categoryId: formData.get("categoryId") ?? "",
    description: formData.get("description") ?? "",
    challenge: formData.get("challenge") ?? "",
    approach: formData.get("approach") ?? "",
    result: formData.get("result") ?? "",
    thumbnailUrl: formData.get("thumbnailUrl") ?? "",
        videoUrl: (formData.get("videoUrl") as string) || (formData.get("externalVideoUrl") as string) || "",
    isFeatured: formData.get("isFeatured") === "on",
    status: formData.get("status"),
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    tools: formData.get("tools") ?? "",
  });
}

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function createProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAuthenticatedAdmin();
  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }
  const data = parsed.data;

  const existingRows = await db.select().from(schema.portfolioProjects).where(eq(schema.portfolioProjects.slug, data.slug));
  if (existingRows[0]) {
    return { status: "error", message: "A project with this slug already exists.", fieldErrors: { slug: "Slug already in use" } };
  }

  const inserted = await db
    .insert(schema.portfolioProjects)
    .values({
      title: data.title,
      slug: data.slug,
      clientName: data.clientName || null,
      year: data.year ?? null,
      categoryId: data.categoryId || null,
      description: data.description || null,
      challenge: data.challenge || null,
      approach: data.approach || null,
      result: data.result || null,
      thumbnailUrl: data.thumbnailUrl || null,
      videoUrl: data.videoUrl || null,
      isFeatured: !!data.isFeatured,
      status: data.status,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
    })
    .returning();
  const row = inserted[0];

  const tools = (data.tools ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  for (const tool of tools) {
    await db.insert(schema.projectTools).values({ projectId: row.id, name: tool });
  }

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath("/");
  redirect("/admin/portfolio");
}

export async function updateProject(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAuthenticatedAdmin();
  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }
  const data = parsed.data;

  const existingRows = await db.select().from(schema.portfolioProjects).where(eq(schema.portfolioProjects.slug, data.slug));
  const existing = existingRows[0];
  if (existing && existing.id !== id) {
    return { status: "error", message: "A project with this slug already exists.", fieldErrors: { slug: "Slug already in use" } };
  }

  await db.update(schema.portfolioProjects)
    .set({
      title: data.title,
      slug: data.slug,
      clientName: data.clientName || null,
      year: data.year ?? null,
      categoryId: data.categoryId || null,
      description: data.description || null,
      challenge: data.challenge || null,
      approach: data.approach || null,
      result: data.result || null,
      thumbnailUrl: data.thumbnailUrl || null,
      videoUrl: data.videoUrl || null,
      isFeatured: !!data.isFeatured,
      status: data.status,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      updatedAt: new Date(),
    })
    .where(eq(schema.portfolioProjects.id, id));

  await db.delete(schema.projectTools).where(eq(schema.projectTools.projectId, id));
  const tools = (data.tools ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  for (const tool of tools) {
    await db.insert(schema.projectTools).values({ projectId: id, name: tool });
  }

  revalidatePath("/admin/portfolio");
  revalidatePath(`/portfolio/${data.slug}`);
  revalidatePath("/portfolio");
  revalidatePath("/");
  redirect("/admin/portfolio");
}

export async function deleteProject(id: string): Promise<void> {
  await requireAuthenticatedAdmin();
  await db.delete(schema.portfolioProjects).where(eq(schema.portfolioProjects.id, id));
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath("/");
}

export async function toggleProjectFeatured(id: string, isFeatured: boolean): Promise<void> {
  await requireAuthenticatedAdmin();
  await db.update(schema.portfolioProjects).set({ isFeatured }).where(eq(schema.portfolioProjects.id, id));
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath("/");
}
