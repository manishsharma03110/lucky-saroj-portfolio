"use server";

import { db, schema } from "@/lib/db";
import { getServices } from "@/lib/db/queries";
import { getPageContent } from "@/lib/db/page-content-service";
import { parseContactOptionsConfig } from "@/lib/contact/contact-options-config";
import { createContactSubmissionHandler, type ContactFormState, type ContactSubmissionDependencies, type RawContactSubmission } from "@/lib/contact/contact-submission";

export type { ContactFormState } from "@/lib/contact/contact-submission";

const dependencies: ContactSubmissionDependencies = {
  readActiveServiceNames: async () => (await getServices()).map((service) => service.name),
  readContactOptions: async () => {
    const contactPage = await getPageContent("contact");
    return parseContactOptionsConfig(contactPage.content.contactOptionsConfig);
  },
  createMessage: async (message) => {
    await db.insert(schema.contactMessages).values({ ...message, status: "new" });
  },
};

const handlePopupContactSubmission = createContactSubmissionHandler("popup", dependencies);
const handleFullContactSubmission = createContactSubmissionHandler("full", dependencies);

function contactSubmissionFromFormData(formData: FormData): RawContactSubmission {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    projectType: String(formData.get("projectType") ?? ""),
    budgetRange: String(formData.get("budgetRange") ?? ""),
    videoType: String(formData.get("videoType") ?? ""),
    projectTimeline: String(formData.get("projectTimeline") ?? ""),
    referenceUrl: String(formData.get("referenceUrl") ?? ""),
    message: String(formData.get("message") ?? ""),
    honeypot: String(formData.get("website") ?? ""),
  };
}

export async function submitPopupContactForm(_prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  return handlePopupContactSubmission(contactSubmissionFromFormData(formData));
}

export async function submitFullContactForm(_prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  return handleFullContactSubmission(contactSubmissionFromFormData(formData));
}
