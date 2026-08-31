"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requirePermission } from "@/lib/auth/authorization";
import { testimonialSchema } from "@/lib/validations/testimonial";
import type { ActionState } from "./portfolio";

function parseForm(formData: FormData) {
  return testimonialSchema.safeParse({
    clientName: formData.get("clientName"),
    designation: formData.get("designation") ?? "",
    company: formData.get("company") ?? "",
    testimonialText: formData.get("testimonialText"),
    rating: formData.get("rating") || 5,
    isFeatured: formData.get("isFeatured") === "on",
    status: formData.get("status"),
  });
}

export async function createTestimonial(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("testimonials.create");
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: { clientName: parsed.error.issues[0]?.message ?? "Invalid input" } };
  }
  await db.insert(schema.testimonials)
    .values({
      clientName: parsed.data.clientName,
      designation: parsed.data.designation || null,
      company: parsed.data.company || null,
      testimonialText: parsed.data.testimonialText,
      rating: parsed.data.rating,
      isFeatured: !!parsed.data.isFeatured,
      status: parsed.data.status,
    });
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  revalidatePath("/services");
  return { status: "success", message: "Testimonial added." };
}

export async function updateTestimonial(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("testimonials.update");
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors: { clientName: parsed.error.issues[0]?.message ?? "Invalid input" } };
  }
  await db.update(schema.testimonials)
    .set({
      clientName: parsed.data.clientName,
      designation: parsed.data.designation || null,
      company: parsed.data.company || null,
      testimonialText: parsed.data.testimonialText,
      rating: parsed.data.rating,
      isFeatured: !!parsed.data.isFeatured,
      status: parsed.data.status,
    })
    .where(eq(schema.testimonials.id, id));
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  revalidatePath("/services");
  return { status: "success", message: "Testimonial updated." };
}

export async function deleteTestimonial(id: string): Promise<void> {
  await requirePermission("testimonials.delete");
  await db.delete(schema.testimonials).where(eq(schema.testimonials.id, id));
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  revalidatePath("/services");
}
