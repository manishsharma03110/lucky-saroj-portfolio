"use server";

import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { auth } from "@/lib/auth";
import { settingsSchema } from "@/lib/validations/settings";
import type { ActionState } from "./portfolio";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

export async function updateSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { status: "error", message: "Please fix the errors below.", fieldErrors };
  }

  const existingRows = await db.select().from(schema.siteSettings);
  const existing = existingRows[0];
  const data = parsed.data;
  const values = {
    ...data,
    whatsapp: data.whatsapp || null,
    paymentTerms: data.paymentTerms || null,
    turnaroundTime: data.turnaroundTime || null,
    instagramUrl: data.instagramUrl || null,
    twitterUrl: data.twitterUrl || null,
    youtubeUrl: data.youtubeUrl || null,
    linkedinUrl: data.linkedinUrl || null,
    behanceUrl: data.behanceUrl || null,
    vimeoUrl: data.vimeoUrl || null,
    seoDescription: data.seoDescription || null,
  };

  if (existing) {
    await db.update(schema.siteSettings).set(values);
  } else {
    await db.insert(schema.siteSettings).values(values);
  }

  revalidatePath("/", "layout");
  revalidatePath("/contact");
  revalidatePath("/admin/settings");
  return { status: "success", message: "Settings updated." };
}
