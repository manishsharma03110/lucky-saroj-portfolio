"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/authorization";
import { SEO_PAGE_DEFAULTS, SEO_PAGE_KEYS, type SeoPageKey } from "@/lib/page-seo";
import { updatePageSeo } from "@/lib/db/page-seo-service";
import { revisionSchema } from "@/lib/validations/revision";
import { StaleRevisionError } from "@/lib/db/mutation-errors";
import type { ActionState } from "./portfolio";

function pageKey(value: FormDataEntryValue | null): SeoPageKey | null {
  return typeof value === "string" && (SEO_PAGE_KEYS as readonly string[]).includes(value) ? value as SeoPageKey : null;
}

function text(formData: FormData, key: string, max: number): string | null {
  const raw = formData.get(key);
  const value = typeof raw === "string" ? raw.trim() : "";
  return value.length <= max ? value : null;
}

function validCanonical(value: string): boolean {
  return value.startsWith("/") || /^https:\/\//i.test(value);
}

function validImage(value: string): boolean {
  if (!value) return true;
  return value.startsWith("/") || /^https:\/\//i.test(value);
}

export async function updatePageSeoAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("settings.update");
  const key = pageKey(formData.get("pageKey"));
  const revision = revisionSchema.safeParse(formData.get("revision"));
  if (!key || !revision.success) return { status: "error", message: "Invalid SEO request. Reload before saving." };

  const metaTitle = text(formData, "metaTitle", 200);
  const metaDescription = text(formData, "metaDescription", 320);
  const canonicalPath = text(formData, "canonicalPath", 500);
  const ogTitle = text(formData, "ogTitle", 200);
  const ogDescription = text(formData, "ogDescription", 320);
  const ogImageUrl = text(formData, "ogImageUrl", 2048);
  const keywords = text(formData, "keywords", 500);
  if ([metaTitle, metaDescription, canonicalPath, ogTitle, ogDescription, ogImageUrl, keywords].some((value) => value === null)) {
    return { status: "error", message: "One or more SEO fields are too long." };
  }
  if (canonicalPath && !validCanonical(canonicalPath)) return { status: "error", message: "Canonical must be an internal path or HTTPS URL." };
  if (ogImageUrl && !validImage(ogImageUrl)) return { status: "error", message: "OG image must be an internal path or HTTPS URL." };

  const fallback = SEO_PAGE_DEFAULTS[key];
  try {
    await updatePageSeo({
      pageKey: key,
      metaTitle: metaTitle || fallback.title,
      metaDescription: metaDescription || fallback.description,
      canonicalPath: canonicalPath || fallback.path,
      ogTitle: ogTitle || metaTitle || fallback.title,
      ogDescription: ogDescription || metaDescription || fallback.description,
      ogImageUrl: ogImageUrl || "",
      robotsIndex: formData.get("robotsIndex") === "on",
      keywords: keywords || "",
      revision: revision.data,
    }, revision.data);
  } catch (error) {
    if (error instanceof StaleRevisionError) return { status: "error", message: error.message };
    throw error;
  }

  revalidatePath("/admin/seo");
  revalidatePath(key === "home" ? "/" : `/${key}`);
  return { status: "success", message: `${fallback.label} SEO updated.` };
}
