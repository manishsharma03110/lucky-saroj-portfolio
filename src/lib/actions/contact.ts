"use server";

import { db, schema } from "@/lib/db";
import { contactSchema } from "@/lib/validations/contact";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "projectType" | "budgetRange" | "message", string>>;
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    projectType: String(formData.get("projectType") ?? ""),
    budgetRange: String(formData.get("budgetRange") ?? ""),
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

  const { name, email, projectType, budgetRange, message } = parsed.data;

  try {
    await db.insert(schema.contactMessages)
      .values({
        name,
        email,
        projectType: projectType || null,
        budgetRange: budgetRange || null,
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
