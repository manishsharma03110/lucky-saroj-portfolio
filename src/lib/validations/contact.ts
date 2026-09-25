import { z } from "zod";
import { boundedContactEmailSchema } from "./email";

export const CONTACT_NAME_MAX_LENGTH = 120;
export const CONTACT_PHONE_MAX_LENGTH = 20;
export const CONTACT_PROJECT_TYPE_MAX_LENGTH = 120;
export const CONTACT_MESSAGE_MAX_LENGTH = 4000;
export const CONTACT_REFERENCE_URL_MAX_LENGTH = 500;
export const CONTACT_HONEYPOT_MAX_LENGTH = 200;

const singleLineText = (maximum: number) => z.string().trim().max(maximum).refine((value) => !/[\u0000-\u001f\u007f]/.test(value), "Please remove unsupported control characters.");
const requiredOption = (message: string) => singleLineText(CONTACT_PROJECT_TYPE_MAX_LENGTH).min(1, message);
const optionalOption = z.union([z.literal(""), singleLineText(CONTACT_PROJECT_TYPE_MAX_LENGTH).min(1)]);
const phoneSchema = singleLineText(CONTACT_PHONE_MAX_LENGTH).refine((value) => !value || value.replace(/\D/g, "").length >= 10, "Please enter a valid phone number");
const messageSchema = z.string().trim().min(10, "Tell me a bit more about your project").max(CONTACT_MESSAGE_MAX_LENGTH).refine((value) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value), "Please remove unsupported control characters.");
const honeypotSchema = z.string().max(CONTACT_HONEYPOT_MAX_LENGTH);
export function isContactAttachmentUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.port
      && /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/.test(url.hostname)
      && url.pathname.startsWith("/contact-attachments/");
  } catch { return false; }
}
const attachmentUrlSchema = z.union([z.literal(""), z.string().url().max(CONTACT_REFERENCE_URL_MAX_LENGTH).refine((value) => isContactAttachmentUrl(value), "Invalid attachment URL")]);
const commonContactFields = { name: singleLineText(CONTACT_NAME_MAX_LENGTH).min(2, "Please enter your name"), email: boundedContactEmailSchema, message: messageSchema, honeypot: honeypotSchema };

export const popupContactSchema = z.object({ ...commonContactFields, formContext: z.literal("popup"), phone: phoneSchema.min(1, "Please enter your phone number"), projectType: requiredOption("Please select a project type"), budgetRange: optionalOption, videoType: singleLineText(CONTACT_PROJECT_TYPE_MAX_LENGTH), projectTimeline: z.literal(""), referenceUrl: attachmentUrlSchema });
export const fullContactStructuralSchema = z.object({ ...commonContactFields, formContext: z.literal("full"), phone: phoneSchema, projectType: z.literal(""), budgetRange: z.literal(""), videoType: z.literal(""), projectTimeline: z.literal(""), referenceUrl: attachmentUrlSchema });
export const contactSchema = z.discriminatedUnion("formContext", [popupContactSchema, fullContactStructuralSchema]);
export type ContactInput = z.infer<typeof contactSchema>;

