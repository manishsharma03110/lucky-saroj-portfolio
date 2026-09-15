"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/authorization";
import { recordActivitySafely } from "@/lib/audit/activity-log";

export type MaintenanceState = { status: "idle" | "success" | "error"; message?: string };

export async function refreshPublicCache(): Promise<MaintenanceState> {
  const auth = await requirePermission("settings.update");
  const paths = ["/", "/about", "/portfolio", "/services", "/experience", "/contact", "/testimonials", "/sitemap.xml", "/robots.txt"];
  for (const path of paths) revalidatePath(path);
  revalidatePath("/portfolio/[slug]", "page");
  await recordActivitySafely({ actor: auth.admin, action: "update", resource: "settings", resourceId: "system:cache", summary: "Refreshed public site cache and metadata routes." });
  return { status: "success", message: "Public pages, project pages, sitemap and robots cache refreshed." };
}
