"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { auth } from "@/lib/auth";
import { showreelSchema } from "@/lib/validations/showreel";
import type { ActionState } from "./portfolio";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

export async function upsertShowreel(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = showreelSchema.safeParse({
    title: formData.get("title"),
    videoUrl: formData.get("videoUrl") ?? "",
    duration: formData.get("duration") ?? "",
    isFeatured: formData.get("isFeatured") === "on",
    status: formData.get("status"),
  });
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
        duration: data.duration || null,
        isFeatured: data.isFeatured ?? true,
        status: data.status,
      });
  }

  revalidatePath("/admin/showreel");
  revalidatePath("/");
  return { status: "success", message: "Showreel updated." };
}
