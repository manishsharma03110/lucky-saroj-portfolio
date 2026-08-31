"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requirePermission } from "@/lib/auth/authorization";
import { showreelSchema } from "@/lib/validations/showreel";
import type { ActionState } from "./portfolio";

export async function upsertShowreel(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("showreel.update");
  const parsed = showreelSchema.safeParse({
    title: formData.get("title"),
    videoUrl: (formData.get("videoUrl") as string) || (formData.get("externalVideoUrl") as string) || "",
    duration: formData.get("duration") ?? "",
    isFeatured: formData.get("isFeatured") === "on",
    status: formData.get("status"),
  });
  const thumbnailUrl = (formData.get("thumbnailUrl") as string) || "";
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: { title: parsed.error.issues[0]?.message ?? "Invalid input" } };
  }

  const existingRows = await db.select().from(schema.showreels);
  const existing = existingRows[0];
  const data = parsed.data;

  if (existing) {
    await db.update(schema.showreels)
      .set({
        title: data.title,
        videoUrl: data.videoUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        duration: data.duration || null,
        isFeatured: data.isFeatured ?? true,
        status: data.status,
      })
      .where(eq(schema.showreels.id, existing.id));
  } else {
    await db.insert(schema.showreels)
      .values({
        title: data.title,
        videoUrl: data.videoUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        duration: data.duration || null,
        isFeatured: data.isFeatured ?? true,
        status: data.status,
      });
  }

  revalidatePath("/admin/showreel");
  revalidatePath("/");
  return { status: "success", message: "Showreel updated." };
}
