"use client";

import { useActionState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { submitFullContactForm, type ContactFormState } from "@/lib/actions/contact";
import { activeContactOptionLabels, parseContactOptionsConfig } from "@/lib/contact/contact-options-config";
import { ContactSelect } from "./ContactSelect";

const initialState: ContactFormState = { status: "idle" };
const fieldClasses = "min-h-[3.25rem] !rounded-md !border-white/10 !bg-[var(--surface-primary)] px-4 !text-[var(--text-primary)] placeholder:!text-[var(--text-muted)] transition-[border-color,box-shadow,background-color] duration-200 focus:!border-[var(--accent-primary)] focus:!bg-[var(--surface-primary)] focus:ring-2 focus:ring-[var(--accent-hover)] focus:ring-offset-2 focus:ring-offset-[var(--background-primary)] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";
const labelClasses = "mb-2 block text-sm font-medium text-[var(--text-primary)]";
const errorClasses = "mt-1.5 text-xs leading-5 text-red-300";

function RequiredMark() {
  return <span className="text-[var(--accent-primary)]" aria-hidden>*</span>;
}

export function ContactForm({ projectCategories = [], content = {} }: { projectCategories?: string[]; content?: Record<string, string> }) {
  const [state, formAction, pending] = useActionState(submitFullContactForm, initialState);
  const otherCategoryLabel = content.formOtherCategoryLabel || "Other";
  const categoryOptions = Array.from(new Set([...projectCategories, otherCategoryLabel]));
  const optionConfig = parseContactOptionsConfig(content.contactOptionsConfig);
  const budgetOptions = activeContactOptionLabels(optionConfig, "budgetRanges");
  const videoTypeOptions = activeContactOptionLabels(optionConfig, "videoTypes");
  const timelineOptions = activeContactOptionLabels(optionConfig, "projectTimelines");
  const copy = {
    ariaLabel: content.formAriaLabel || "Project inquiry form",
    required: content.formRequiredLabel || "Required fields",
    nameLabel: content.formNameLabel || "Your Name",
    namePlaceholder: content.formNamePlaceholder || "Your name",
    emailLabel: content.formEmailLabel || "Email Address",
    emailPlaceholder: content.formEmailPlaceholder || "you@example.com",
    phoneLabel: content.formPhoneLabel || "Phone Number",
    phonePlaceholder: content.formPhonePlaceholder || "Optional",
    budgetLabel: content.formBudgetLabel || "Budget Range",
    budgetPlaceholder: content.formBudgetPlaceholder || "Select budget",
    categoryLabel: content.formCategoryLabel || "Project Category",
    categoryPlaceholder: content.formCategoryPlaceholder || "Select category",
    videoTypeLabel: content.formVideoTypeLabel || "Video Type",
    videoTypePlaceholder: content.formVideoTypePlaceholder || "Select video type",
    timelineLabel: content.formTimelineLabel || "Project Timeline",
    timelinePlaceholder: content.formTimelinePlaceholder || "Select desired timeline",
    referenceLabel: content.formReferenceLabel || "Reference Link",
    optionalLabel: content.formOptionalLabel || "Optional",
    referencePlaceholder: content.formReferencePlaceholder || "https://",
    messageLabel: content.formMessageLabel || "Tell me more about your project",
    messagePlaceholder: content.formMessagePlaceholder || "Share the goals, audience, style, and any specific requirements.",
    messageHelper: content.formMessageHelper || "Include the project goals, target audience, preferred style, and key requirements.",
    submitLabel: content.formSubmitLabel || "Send Message",
    sendingLabel: content.formSendingLabel || "Sending message…",
    successHeading: content.formSuccessHeading || "Message sent!",
  };

  if (state.status === "success") {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-md border border-[var(--accent-primary)]/35 bg-[var(--surface-elevated)] p-8 text-center" role="status" aria-live="polite">
        <CheckCircle2 className="text-[var(--accent-primary)]" size={36} aria-hidden />
        <p className="font-display text-2xl font-semibold text-[var(--text-primary)]">{copy.successHeading}</p>
        <p className="max-w-md text-sm leading-6 text-[var(--text-secondary)]">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" aria-label={copy.ariaLabel} aria-busy={pending}>
      <div hidden aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
      <p className="text-xs leading-5 text-[var(--text-muted)]"><span className="text-[var(--accent-primary)]" aria-hidden>*</span> {copy.required}</p>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClasses}>{copy.nameLabel} <RequiredMark /></label>
          <Input id="name" name="name" autoComplete="name" placeholder={copy.namePlaceholder} required maxLength={120} disabled={pending} className={`${fieldClasses} ${state.fieldErrors?.name ? "!border-red-400/60" : ""}`} aria-invalid={Boolean(state.fieldErrors?.name)} aria-describedby={state.fieldErrors?.name ? "name-error" : undefined} />
          {state.fieldErrors?.name && <p id="name-error" className={errorClasses}>{state.fieldErrors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className={labelClasses}>{copy.emailLabel} <RequiredMark /></label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder={copy.emailPlaceholder} required disabled={pending} className={`${fieldClasses} ${state.fieldErrors?.email ? "!border-red-400/60" : ""}`} aria-invalid={Boolean(state.fieldErrors?.email)} aria-describedby={state.fieldErrors?.email ? "email-error" : undefined} />
          {state.fieldErrors?.email && <p id="email-error" className={errorClasses}>{state.fieldErrors.email}</p>}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="phone" className={labelClasses}>{copy.phoneLabel}</label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder={copy.phonePlaceholder} maxLength={20} disabled={pending} className={`${fieldClasses} ${state.fieldErrors?.phone ? "!border-red-400/60" : ""}`} aria-invalid={Boolean(state.fieldErrors?.phone)} aria-describedby={state.fieldErrors?.phone ? "phone-error" : undefined} />
          {state.fieldErrors?.phone && <p id="phone-error" className={errorClasses}>{state.fieldErrors.phone}</p>}
        </div>
        <div>
          <label htmlFor="budgetRange" className={labelClasses}>{copy.budgetLabel} <RequiredMark /></label>
          <ContactSelect id="budgetRange" name="budgetRange" placeholder={copy.budgetPlaceholder} options={budgetOptions} required disabled={pending} invalid={Boolean(state.fieldErrors?.budgetRange)} describedBy={state.fieldErrors?.budgetRange ? "budget-error" : undefined} />
          {state.fieldErrors?.budgetRange && <p id="budget-error" className={errorClasses}>{state.fieldErrors.budgetRange}</p>}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="projectType" className={labelClasses}>{copy.categoryLabel} <RequiredMark /></label>
          <ContactSelect id="projectType" name="projectType" placeholder={copy.categoryPlaceholder} options={categoryOptions} required disabled={pending} invalid={Boolean(state.fieldErrors?.projectType)} describedBy={state.fieldErrors?.projectType ? "category-error" : undefined} />
          {state.fieldErrors?.projectType && <p id="category-error" className={errorClasses}>{state.fieldErrors.projectType}</p>}
        </div>
        <div>
          <label htmlFor="videoType" className={labelClasses}>{copy.videoTypeLabel} <RequiredMark /></label>
          <ContactSelect id="videoType" name="videoType" placeholder={copy.videoTypePlaceholder} options={videoTypeOptions} required disabled={pending} invalid={Boolean(state.fieldErrors?.videoType)} describedBy={state.fieldErrors?.videoType ? "video-type-error" : undefined} />
          {state.fieldErrors?.videoType && <p id="video-type-error" className={errorClasses}>{state.fieldErrors.videoType}</p>}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="projectTimeline" className={labelClasses}>{copy.timelineLabel}</label>
          <ContactSelect id="projectTimeline" name="projectTimeline" placeholder={copy.timelinePlaceholder} options={timelineOptions} disabled={pending} invalid={Boolean(state.fieldErrors?.projectTimeline)} describedBy={state.fieldErrors?.projectTimeline ? "timeline-error" : undefined} />
          {state.fieldErrors?.projectTimeline && <p id="timeline-error" className={errorClasses}>{state.fieldErrors.projectTimeline}</p>}
        </div>
        <div>
          <label htmlFor="referenceUrl" className={labelClasses}>{copy.referenceLabel} <span className="text-[var(--text-muted)]">({copy.optionalLabel})</span></label>
          <Input id="referenceUrl" name="referenceUrl" type="url" inputMode="url" autoComplete="url" placeholder={copy.referencePlaceholder} maxLength={500} disabled={pending} className={`${fieldClasses} ${state.fieldErrors?.referenceUrl ? "!border-red-400/60" : ""}`} aria-invalid={Boolean(state.fieldErrors?.referenceUrl)} aria-describedby={state.fieldErrors?.referenceUrl ? "reference-error" : undefined} />
          {state.fieldErrors?.referenceUrl && <p id="reference-error" className={errorClasses}>{state.fieldErrors.referenceUrl}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClasses}>{copy.messageLabel} <RequiredMark /></label>
        <Textarea id="message" name="message" rows={6} placeholder={copy.messagePlaceholder} required maxLength={4000} disabled={pending} className={`${fieldClasses} min-h-40 resize-y py-4 ${state.fieldErrors?.message ? "!border-red-400/60" : ""}`} aria-invalid={Boolean(state.fieldErrors?.message)} aria-describedby={`message-helper${state.fieldErrors?.message ? " message-error" : ""}`} />
        <p id="message-helper" className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{copy.messageHelper}</p>
        {state.fieldErrors?.message && <p id="message-error" className={errorClasses}>{state.fieldErrors.message}</p>}
      </div>

      {state.status === "error" && state.message && !state.fieldErrors && <p className="rounded-md border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-200" role="alert">{state.message}</p>}

      <button type="submit" disabled={pending} className="group flex min-h-[3.25rem] w-full items-center justify-center gap-3 rounded-md bg-[var(--accent-primary)] px-6 py-3.5 text-sm font-semibold text-[var(--background-primary)] shadow-[0_0_0_rgba(59,130,246,0)] transition-[background-color,box-shadow,transform] duration-300 hover:bg-[var(--accent-hover)] hover:shadow-[0_0_28px_rgba(59,130,246,0.22)] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-hover)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background-primary)]">
        {pending ? copy.sendingLabel : copy.submitLabel}
        <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
      </button>
    </form>
  );
}
