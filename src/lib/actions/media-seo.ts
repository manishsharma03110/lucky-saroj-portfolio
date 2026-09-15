"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import { recordActivitySafely } from "@/lib/audit/activity-log";

const itemSchema = z.object({ id: z.string().uuid(), altText: z.string().trim().max(300), title: z.string().trim().max(200), description: z.string().trim().max(600) });
export type MediaSeoState = { status: "idle" | "success" | "error"; message?: string };

export async function updateProjectMediaSeo(projectId: string, projectSlug: string, _prev: MediaSeoState, formData: FormData): Promise<MediaSeoState> {
  const auth = await requirePermission("portfolio.update");
  const ids = formData.getAll("mediaId").map(String);
  const alt = formData.getAll("altText").map(String);
  const titles = formData.getAll("mediaTitle").map(String);
  const descriptions = formData.getAll("mediaDescription").map(String);
  const items = ids.map((id, index) => ({ id, altText: alt[index] ?? "", title: titles[index] ?? "", description: descriptions[index] ?? "" }));
  const parsed = z.array(itemSchema).max(100).safeParse(items);
  if (!parsed.success) return { status: "error", message: "Please check the media SEO fields and try again." };
  for (const item of parsed.data) {
    await db.execute(sql`UPDATE project_media SET alt_text=${item.altText || null}, title=${item.title || null}, description=${item.description || null} WHERE id=${item.id} AND project_id=${projectId}`);
  }
  await recordActivitySafely({ actor: auth.admin, action: "update", resource: "portfolio", resourceId: projectId, summary: `Updated SEO metadata for ${parsed.data.length} project media item(s).` });
  revalidatePath(`/portfolio/${projectSlug}`);
  revalidatePath(`/admin/portfolio/${projectId}/edit`);
  return { status: "success", message: "Media SEO metadata saved." };
}
