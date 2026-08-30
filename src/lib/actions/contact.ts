"use server";

import { db, schema } from "@/lib/db";
import { contactSchema } from "@/lib/validations/contact";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "phone" | "projectType" | "budgetRange" | "videoType" | "projectTimeline" | "referenceUrl" | "message", string>>;
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    projectType: String(formData.get("projectType") ?? ""),
    budgetRange: String(formData.get("budgetRange") ?? ""),
    videoType: String(formData.get("videoType") ?? ""),
    projectTimeline: String(formData.get("projectTimeline") ?? ""),
    referenceUrl: String(formData.get("referenceUrl") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: ContactFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof NonNullable<ContactFormState["fieldErrors"]>;
      if (field) fieldErrors[field] = issue.message;
    }
    return { status: "error", message: "Please fix the errors below.", fieldErrors };
  }

  const { name, email, phone, projectType, budgetRange, videoType, projectTimeline, referenceUrl, message } = parsed.data;

  try {
    await db.insert(schema.contactMessages).values({
      name,
      email,
      phone: phone || null,
      projectType,
      budgetRange,
      videoType,
      projectTimeline: projectTimeline || null,
      referenceUrl: referenceUrl || null,
      message,
      status: "new",
    });
  } catch {
    return {
      status: "error",
      message: "Something went wrong sending your message. Please try again.",
    };
  }

  return { status: "success", message: "Thanks — your message has been sent. I'll be in touch soon." };
}
