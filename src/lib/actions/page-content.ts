"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/authorization";
import { PAGE_CONTENT_CONFIG, PAGE_CONTENT_KEYS, type PageContentKey } from "@/lib/page-content";
import { revisionSchema } from "@/lib/validations/revision";
import { updatePageContent } from "@/lib/db/page-content-service";
import { StaleRevisionError } from "@/lib/db/mutation-errors";
import type { ActionState } from "./portfolio";

function parsePageKey(value: FormDataEntryValue | null): PageContentKey | null {
  return typeof value === "string" && (PAGE_CONTENT_KEYS as readonly string[]).includes(value) ? value as PageContentKey : null;
}

function validUrl(value: string): boolean {
  return value.startsWith("/") || /^https:\/\//i.test(value);
}

export async function updatePageContentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("settings.update");
  const pageKey = parsePageKey(formData.get("pageKey"));
  const revision = revisionSchema.safeParse(formData.get("revision"));
  if (!pageKey || !revision.success) return { status: "error", message: "Invalid page content request. Reload before saving." };

  const content: Record<string, string> = {};
  for (const field of PAGE_CONTENT_CONFIG[pageKey].fields) {
    const raw = formData.get(field.key);
    const value = typeof raw === "string" ? raw.trim() : "";
    const maxLength = field.maxLength ?? (field.kind === "textarea" ? 1000 : 300);
    if (value.length > maxLength) return { status: "error", message: `${field.label} is too long.` };
    if (field.kind === "url" && value && !validUrl(value)) return { status: "error", message: `${field.label} must be an internal path or HTTPS URL.` };
    content[field.key] = value;
  }

  try {
    await updatePageContent(pageKey, content, revision.data);
  } catch (error) {
    if (error instanceof StaleRevisionError) return { status: "error", message: error.message };
    throw error;
  }

  revalidatePath("/admin/pages");
  revalidatePath(`/${pageKey}`);
  return { status: "success", message: `${PAGE_CONTENT_CONFIG[pageKey].label} content updated.` };
}
