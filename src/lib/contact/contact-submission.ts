import { contactSchema } from "@/lib/validations/contact";
import { fieldErrorsFromIssues, SAFE_VALIDATION_MESSAGE } from "@/lib/validations/action-errors";
import { activeContactOptionLabels, DEFAULT_CONTACT_OPTIONS_CONFIG, type ContactOptionsConfig } from "@/lib/contact/contact-options-config";

export type ContactField = "name" | "email" | "phone" | "projectType" | "budgetRange" | "videoType" | "projectTimeline" | "referenceUrl" | "message";
export type ContactFormState = { status: "idle" | "success" | "error"; message?: string; fieldErrors?: Partial<Record<ContactField, string>> };
export type ContactMessageInput = { name: string; email: string; phone: string | null; projectType: string; budgetRange: string; videoType: string; projectTimeline: string | null; referenceUrl: string | null; message: string };
export type ContactSubmissionDependencies = { readActiveServiceNames: () => Promise<readonly string[]>; readContactOptions?: () => Promise<ContactOptionsConfig>; createMessage: (input: ContactMessageInput) => Promise<void> };
export type RawContactSubmission = { name: string; email: string; phone: string; projectType: string; budgetRange: string; videoType: string; projectTimeline: string; referenceUrl: string; message: string; honeypot: string };
export type ContactFormContext = "popup" | "full";

const SAFE_FAILURE_MESSAGE = "Something went wrong sending your message. Please try again.";
const SAFE_SPAM_MESSAGE = "Unable to send your message. Please try again later.";
function publicFieldErrors(issues: Parameters<typeof fieldErrorsFromIssues>[0]): ContactFormState["fieldErrors"] { const allowed = new Set<ContactField>(["name","email","phone","projectType","budgetRange","videoType","projectTimeline","referenceUrl","message"]); const mapped = fieldErrorsFromIssues(issues); return Object.fromEntries(Object.entries(mapped).filter(([field]) => allowed.has(field as ContactField))); }
function includesOption(options: readonly string[], value: string) { return options.includes(value); }

export function createContactSubmissionHandler(context: ContactFormContext, dependencies: ContactSubmissionDependencies) {
  return async function handleContactSubmission(raw: RawContactSubmission): Promise<ContactFormState> {
    const parsed = contactSchema.safeParse({ ...raw, formContext: context });
    if (!parsed.success) { const fieldErrors = publicFieldErrors(parsed.error.issues); return { status: "error", message: SAFE_VALIDATION_MESSAGE, ...(Object.keys(fieldErrors ?? {}).length ? { fieldErrors } : {}) }; }
    if (parsed.data.honeypot !== "") return { status: "error", message: SAFE_SPAM_MESSAGE };
    if (parsed.data.formContext === "popup") {
      let optionConfig = DEFAULT_CONTACT_OPTIONS_CONFIG;
      if (dependencies.readContactOptions) { try { optionConfig = await dependencies.readContactOptions(); } catch { return { status: "error", message: SAFE_FAILURE_MESSAGE }; } }
      const projectTypes = activeContactOptionLabels(optionConfig, "popupProjectTypes");
      const budgets = activeContactOptionLabels(optionConfig, "budgetRanges");
      if (!includesOption(projectTypes, parsed.data.projectType)) return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: { projectType: "Please select a supported project type." } };
      if (parsed.data.budgetRange && !includesOption(budgets, parsed.data.budgetRange)) return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: { budgetRange: "Please select a supported budget range." } };
    }
    const isPopup = parsed.data.formContext === "popup";
    const message: ContactMessageInput = { name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone || null, projectType: isPopup ? parsed.data.projectType : "General inquiry", budgetRange: isPopup ? (parsed.data.budgetRange || "Not specified") : "Not specified", videoType: isPopup ? parsed.data.projectType : "Not specified", projectTimeline: null, referenceUrl: parsed.data.referenceUrl || null, message: parsed.data.message };
    try { await dependencies.createMessage(message); } catch { return { status: "error", message: SAFE_FAILURE_MESSAGE }; }
    return { status: "success", message: "Thanks — your message has been sent. I'll be in touch soon." };
  };
}
