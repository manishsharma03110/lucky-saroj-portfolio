"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth/authorization";
import { projectSchema } from "@/lib/validations/project";
import { revisionSchema } from "@/lib/validations/revision";
import { createPortfolioProject, deletePortfolioProject, togglePortfolioFeatured, updatePortfolioProject } from "@/lib/db/portfolio-service";
import { ContentNotFoundError, DuplicateContentError, DuplicateSlugError, StaleRevisionError } from "@/lib/db/mutation-errors";
import { fieldErrorsFromIssues, InvalidActionInputError, SAFE_VALIDATION_MESSAGE } from "@/lib/validations/action-errors";
import { entityIdSchema } from "@/lib/validations/identifiers";
import { strictBooleanSchema } from "@/lib/validations/booleans";
import { MediaAssetBindingError, MediaAssetNotAttachableError, MediaAssetNotFoundError } from "@/lib/db/media-asset-service";

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  revision?: number;
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
    thumbnailAssetId: formData.get("thumbnailAssetId") ?? "",
    videoUrl: (formData.get("videoUrl") as string) || (formData.get("externalVideoUrl") as string) || "",
    videoAssetId: formData.get("videoAssetId") ?? "",
    isFeatured: formData.get("isFeatured"),
    status: formData.get("status"),
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    tools: formData.get("tools") ?? "",
  });
}

export async function createProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("portfolio.create");
  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: fieldErrorsFromIssues(parsed.error.issues) };
  }
  const data = parsed.data;

  const tools = (data.tools ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  try { await createPortfolioProject({ ...data, tools }); }
  catch (error) {
    if (error instanceof DuplicateSlugError) return { status: "error", message: error.message, fieldErrors: { slug: "Slug already in use" } };
    if (error instanceof DuplicateContentError) return { status: "error", message: error.message, fieldErrors: { tools: error.message } };
    if (error instanceof MediaAssetBindingError || error instanceof MediaAssetNotAttachableError || error instanceof MediaAssetNotFoundError) return { status: "error", message: "Uploaded media is invalid or no longer available." };
    throw error;
  }

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath("/");
  redirect("/admin/portfolio");
}

export async function updateProject(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("portfolio.update");
  const parsedId = entityIdSchema.safeParse(id);
  const parsed = parseProjectForm(formData);
  const revision = revisionSchema.safeParse(formData.get("revision"));
  if (!parsedId.success) return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: { id: "Invalid project." } };
  if (!parsed.success) {
    return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: fieldErrorsFromIssues(parsed.error.issues) };
  }
  const data = parsed.data;
  if (!revision.success) return { status: "error", message: "Invalid content revision. Reload before saving." };
  const tools = (data.tools ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  try { await updatePortfolioProject(parsedId.data, revision.data, { ...data, tools }); }
  catch (error) {
    if (error instanceof DuplicateSlugError) return { status: "error", message: error.message, fieldErrors: { slug: "Slug already in use" } };
    if (error instanceof DuplicateContentError) return { status: "error", message: error.message, fieldErrors: { tools: error.message } };
    if (error instanceof MediaAssetBindingError || error instanceof MediaAssetNotAttachableError || error instanceof MediaAssetNotFoundError) return { status: "error", message: "Uploaded media is invalid or no longer available." };
    if (error instanceof StaleRevisionError || error instanceof ContentNotFoundError) return { status: "error", message: error.message };
    throw error;
  }

  revalidatePath("/admin/portfolio");
  revalidatePath(`/portfolio/${data.slug}`);
  revalidatePath("/portfolio");
  revalidatePath("/");
  redirect("/admin/portfolio");
}

export async function deleteProject(id: string): Promise<void> {
  await requirePermission("portfolio.delete");
  const parsedId = entityIdSchema.safeParse(id);
  if (!parsedId.success) throw new InvalidActionInputError();
  await deletePortfolioProject(parsedId.data);
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath("/");
}

export async function toggleProjectFeatured(id: string, expectedRevision: number, isFeatured: boolean): Promise<{ revision: number }> {
  await requirePermission("portfolio.update");
  const parsedId = entityIdSchema.safeParse(id);
  const parsedRevision = revisionSchema.safeParse(expectedRevision);
  const parsedFeatured = strictBooleanSchema.safeParse(isFeatured);
  if (!parsedId.success || !parsedFeatured.success) throw new InvalidActionInputError();
  if (!parsedRevision.success) throw new StaleRevisionError();
  const revision = await togglePortfolioFeatured(parsedId.data, parsedRevision.data, parsedFeatured.data);
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath("/");
  return { revision };
}
