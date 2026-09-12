"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/authorization";
import { recordActivitySafely } from "@/lib/audit/activity-log";
import { PAGE_CONTENT_CONFIG, PAGE_CONTENT_KEYS, type PageContentKey } from "@/lib/page-content";
import { pageContentFields } from "@/lib/page-content-extra";
import { revisionSchema } from "@/lib/validations/revision";
import { mediaReferenceSchema } from "@/lib/validations/urls";
import { assetIdSchema } from "@/lib/media/ownership";
import { updatePageContent } from "@/lib/db/page-content-service";
import { StaleRevisionError } from "@/lib/db/mutation-errors";
import { MediaAssetBindingError, MediaAssetNotAttachableError, MediaAssetNotFoundError } from "@/lib/db/media-asset-service";
import type { ActionState } from "./portfolio";

function parsePageKey(value: FormDataEntryValue | null): PageContentKey | null {
  return typeof value === "string" && (PAGE_CONTENT_KEYS as readonly string[]).includes(value) ? value as PageContentKey : null;
}
function validUrl(value: string): boolean { return value.startsWith("/") || /^https:\/\//i.test(value); }

export async function updatePageContentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requirePermission("settings.update");
  const pageKey = parsePageKey(formData.get("pageKey"));
  const revision = revisionSchema.safeParse(formData.get("revision"));
  if (!pageKey || !revision.success) return { status: "error", message: "Invalid page content request. Reload before saving." };
  const content: Record<string, string> = {};
  let hasImageField = false;
  for (const field of pageContentFields(pageKey, PAGE_CONTENT_CONFIG[pageKey].fields)) {
    const raw = formData.get(field.key); const value = typeof raw === "string" ? raw.trim() : "";
    const maxLength = field.maxLength ?? (field.kind === "textarea" ? 1000 : field.kind === "image" ? 2048 : 300);
    if (value.length > maxLength) return { status: "error", message: `${field.label} is too long.` };
    if (field.kind === "url" && value && !validUrl(value)) return { status: "error", message: `${field.label} must be an internal path or HTTPS URL.` };
    if (field.kind === "image") { hasImageField = true; if (value && !mediaReferenceSchema.safeParse(value).success) return { status: "error", message: `${field.label} is invalid.` }; }
    content[field.key] = value;
  }
  const rawAssetId = hasImageField ? formData.get("heroImageAssetId") : null;
  const heroImageAssetId = typeof rawAssetId === "string" ? rawAssetId.trim() : "";
  if (heroImageAssetId && !assetIdSchema.safeParse(heroImageAssetId).success) return { status: "error", message: "The uploaded page image is invalid. Please upload it again." };
  try { await updatePageContent(pageKey, content, revision.data, heroImageAssetId || null); }
  catch (error) {
    if (error instanceof MediaAssetBindingError || error instanceof MediaAssetNotAttachableError || error instanceof MediaAssetNotFoundError) return { status: "error", message: "The uploaded page image is invalid or no longer available." };
    if (error instanceof StaleRevisionError) return { status: "error", message: error.message };
    throw error;
  }
  await recordActivitySafely({ actor: auth.admin, action: "update", resource: "page_content", resourceId: pageKey, summary: `Updated ${PAGE_CONTENT_CONFIG[pageKey].label} content.`, metadata: { pageKey, previousRevision: revision.data, fieldCount: Object.keys(content).length, heroImageChanged: Boolean(heroImageAssetId) } });
  revalidatePath("/admin/pages"); if (pageKey === "global") revalidatePath("/", "layout"); else revalidatePath(`/${pageKey}`);
  return { status: "success", message: `${PAGE_CONTENT_CONFIG[pageKey].label} content updated.` };
}
