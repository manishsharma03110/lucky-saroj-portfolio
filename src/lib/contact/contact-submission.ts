import { createProjectTypeSchema } from "@/lib/validations/contact-options";
import { contactSchema } from "@/lib/validations/contact";
import { fieldErrorsFromIssues, SAFE_VALIDATION_MESSAGE } from "@/lib/validations/action-errors";

export type ContactField = "name" | "email" | "phone" | "projectType" | "budgetRange" | "videoType" | "projectTimeline" | "referenceUrl" | "message";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<ContactField, string>>;
};

export type ContactMessageInput = {
  name: string;
  email: string;
  phone: string | null;
  projectType: string;
  budgetRange: string;
  videoType: string;
  projectTimeline: string | null;
  referenceUrl: string | null;
  message: string;
};

export type ContactSubmissionDependencies = {
  readActiveServiceNames: () => Promise<readonly string[]>;
  createMessage: (input: ContactMessageInput) => Promise<void>;
};

export type RawContactSubmission = {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budgetRange: string;
  videoType: string;
  projectTimeline: string;
  referenceUrl: string;
  message: string;
  honeypot: string;
};

export type ContactFormContext = "popup" | "full";

const SAFE_FAILURE_MESSAGE = "Something went wrong sending your message. Please try again.";
const SAFE_SPAM_MESSAGE = "Unable to send your message. Please try again later.";

function publicFieldErrors(issues: Parameters<typeof fieldErrorsFromIssues>[0]): ContactFormState["fieldErrors"] {
  const allowed = new Set<ContactField>(["name", "email", "phone", "projectType", "budgetRange", "videoType", "projectTimeline", "referenceUrl", "message"]);
  const mapped = fieldErrorsFromIssues(issues);
  return Object.fromEntries(Object.entries(mapped).filter(([field]) => allowed.has(field as ContactField)));
}

export function createContactSubmissionHandler(context: ContactFormContext, dependencies: ContactSubmissionDependencies) {
  return async function handleContactSubmission(raw: RawContactSubmission): Promise<ContactFormState> {
    const parsed = contactSchema.safeParse({ ...raw, formContext: context });
    if (!parsed.success) {
      const fieldErrors = publicFieldErrors(parsed.error.issues);
      return { status: "error", message: SAFE_VALIDATION_MESSAGE, ...(Object.keys(fieldErrors ?? {}).length ? { fieldErrors } : {}) };
    }

    if (parsed.data.honeypot !== "") {
      return { status: "error", message: SAFE_SPAM_MESSAGE };
    }

    let projectType = parsed.data.projectType;
    if (parsed.data.formContext === "full") {
      let serviceNames: readonly string[];
      try {
        serviceNames = await dependencies.readActiveServiceNames();
      } catch {
        return { status: "error", message: SAFE_FAILURE_MESSAGE };
      }
      const authoritativeProjectType = createProjectTypeSchema(serviceNames).safeParse(projectType);
      if (!authoritativeProjectType.success) {
        return { status: "error", message: SAFE_VALIDATION_MESSAGE, fieldErrors: { projectType: "Please select a supported project category." } };
      }
      projectType = authoritativeProjectType.data;
    }

    const message: ContactMessageInput = {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      projectType,
      budgetRange: parsed.data.budgetRange,
      videoType: parsed.data.formContext === "popup" ? projectType : parsed.data.videoType,
      projectTimeline: parsed.data.projectTimeline || null,
      referenceUrl: parsed.data.referenceUrl || null,
      message: parsed.data.message,
    };

    try {
      await dependencies.createMessage(message);
    } catch {
      return { status: "error", message: SAFE_FAILURE_MESSAGE };
    }

    return { status: "success", message: "Thanks — your message has been sent. I'll be in touch soon." };
  };
}
