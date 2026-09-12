import type { PageContentField, PageContentKey } from "./page-content";
import { DEFAULT_CONTACT_OPTIONS_SERIALIZED } from "@/lib/contact/contact-options-config";

export const PAGE_CONTENT_EXTRA_FIELDS: Partial<Record<PageContentKey, readonly PageContentField[]>> = {
  global: [
    { key: "popupCloseLabel", label: "Contact Popup — Close Accessibility Label", defaultValue: "Close contact form" },
    { key: "popupEyebrow", label: "Contact Popup — Eyebrow", defaultValue: "Get in touch" },
    { key: "popupHeading", label: "Contact Popup — Heading", defaultValue: "Let's talk" },
    { key: "popupHeadingAccent", label: "Contact Popup — Accent Heading", defaultValue: "About Your Project" },
    { key: "popupDescription", label: "Contact Popup — Description", kind: "textarea", maxLength: 500, defaultValue: "Have a project in mind? I'd love to hear from you. Let's create something amazing together." },
    { key: "popupFormAriaLabel", label: "Contact Popup — Form Accessibility Label", defaultValue: "Project inquiry form" },
    { key: "popupNameLabel", label: "Contact Popup — Name Label", defaultValue: "Your Name" },
    { key: "popupEmailLabel", label: "Contact Popup — Email Label", defaultValue: "Your Email" },
    { key: "popupPhoneLabel", label: "Contact Popup — Phone Label", defaultValue: "Phone Number" },
    { key: "popupProjectTypeLabel", label: "Contact Popup — Project Type Label", defaultValue: "Project Type" },
    { key: "popupBudgetLabel", label: "Contact Popup — Budget Label", defaultValue: "Your Budget (Optional)" },
    { key: "popupMessageLabel", label: "Contact Popup — Message Label", defaultValue: "Your Message" },
    { key: "popupSubmitLabel", label: "Contact Popup — Submit Button", defaultValue: "Let's Talk" },
    { key: "popupSendingLabel", label: "Contact Popup — Sending Button", defaultValue: "Sending..." },
    { key: "popupSuccessHeading", label: "Contact Popup — Success Heading", defaultValue: "Message sent" },
    { key: "popupBenefitsAriaLabel", label: "Contact Popup — Benefits Accessibility Label", defaultValue: "Service benefits" },
    { key: "popupQuickResponseLabel", label: "Contact Popup — Benefit 1", defaultValue: "Quick response" },
    { key: "popupPrivacyLabel", label: "Contact Popup — Benefit 2", defaultValue: "Project details kept private" },
    { key: "popupCommunicationLabel", label: "Contact Popup — Benefit 3", defaultValue: "Professional communication" },
  ],
  about: [
    { key: "statsYearsLabel", label: "Stats — Years Experience", defaultValue: "Years experience" },
    { key: "statsProjectsLabel", label: "Stats — Projects Completed", defaultValue: "Projects completed" },
    { key: "statsClientsLabel", label: "Stats — Clients", defaultValue: "Clients" },
    { key: "statsViewsLabel", label: "Stats — Views Generated", defaultValue: "Views generated" },
    { key: "journeyEyebrow", label: "Journey Eyebrow", defaultValue: "Experience" },
    { key: "journeyHeading", label: "Journey Heading", kind: "textarea", maxLength: 240, defaultValue: "The path behind the practice." },
    { key: "journeyLinkLabel", label: "Journey Link Label", defaultValue: "Full experience" },
    { key: "journeyLinkUrl", label: "Journey Link URL", kind: "url", defaultValue: "/experience" },
    { key: "presentLabel", label: "Current Role End-date Label", defaultValue: "Present" },
  ],
  services: [
    { key: "showcaseEyebrow", label: "Services Showcase Eyebrow", defaultValue: "What I offer" },
    { key: "showcaseHeading", label: "Services Showcase Heading", kind: "textarea", maxLength: 240, defaultValue: "Services built around the story." },
    { key: "showcaseDescription", label: "Services Showcase Description", kind: "textarea", maxLength: 500, defaultValue: "Every active service below is drawn directly from the current service catalog." },
    { key: "emptyServicesLabel", label: "Services Empty State", defaultValue: "No active services yet." },
    { key: "toolsEyebrow", label: "Tools Section Eyebrow", defaultValue: "Tools & technologies" },
    { key: "toolsHeading", label: "Tools Section Heading", defaultValue: "The tools behind the work." },
  ],
  portfolio: [
    { key: "filterAllLabel", label: "Category Filter — All Label", defaultValue: "All" },
    { key: "filterAriaLabel", label: "Category Filter — Accessibility Label", defaultValue: "Filter projects by category" },
    { key: "collectionProjectSingular", label: "Collection Count — Singular", defaultValue: "project" },
    { key: "collectionProjectPlural", label: "Collection Count — Plural", defaultValue: "projects" },
    { key: "filteredEmptyDescription", label: "Filtered Empty State Description", kind: "textarea", maxLength: 500, defaultValue: "No published work matches this category at the moment." },
    { key: "cardPreviewAltSuffix", label: "Project Card Preview Alt Suffix", defaultValue: "project preview" },
    { key: "cardFallbackCategoryLabel", label: "Project Card Fallback Category", defaultValue: "Selected project" },
    { key: "featuredProjectLabel", label: "Featured Project Label", defaultValue: "Featured project" },
    { key: "viewProjectLabel", label: "Project Card Link Label", defaultValue: "View project" },
    { key: "detailNavigationAriaLabel", label: "Project Navigation Accessibility Label", defaultValue: "Project navigation" },
    { key: "detailPreviousLabel", label: "Previous Project Label", defaultValue: "Previous project" },
    { key: "detailNextLabel", label: "Next Project Label", defaultValue: "Next project" },
  ],
  contact: [
    { key: "infoEyebrow", label: "Contact Info Eyebrow", defaultValue: "Let's connect" },
    { key: "infoHeadingBefore", label: "Contact Info Heading Before Accent", defaultValue: "Great ideas deserve the right" },
    { key: "infoHeadingAccent", label: "Contact Info Heading Accent", defaultValue: "collaboration." },
    { key: "infoDescription", label: "Contact Info Description", kind: "textarea", maxLength: 500, defaultValue: "Share your goals, vision, and requirements. I'll use them to understand the right approach for your project." },
    { key: "officialDetailsLabel", label: "Official Details Label", defaultValue: "Official details" },
    { key: "nameLabel", label: "Contact Detail — Name", defaultValue: "Name" },
    { key: "emailLabel", label: "Contact Detail — Email", defaultValue: "Email" },
    { key: "phoneLabel", label: "Contact Detail — Phone", defaultValue: "Phone" },
    { key: "whatsappLabel", label: "Contact Detail — WhatsApp", defaultValue: "WhatsApp" },
    { key: "locationLabel", label: "Contact Detail — Location", defaultValue: "Location" },
    { key: "availabilityLabel", label: "Contact Detail — Availability", defaultValue: "Availability" },
    { key: "followLabel", label: "Contact Social Section Label", defaultValue: "Follow me" },
    { key: "workingTermsLabel", label: "Working Terms Section Label", defaultValue: "Working terms" },
    { key: "paymentTermsLabel", label: "Payment Terms Label", defaultValue: "Payment terms" },
    { key: "turnaroundTimeLabel", label: "Turnaround Time Label", defaultValue: "Turnaround time" },
    { key: "contactOptionsConfig", label: "Contact Form Select Options", kind: "contact-options", maxLength: 12000, defaultValue: DEFAULT_CONTACT_OPTIONS_SERIALIZED },
  ],
};

export function pageContentFields(pageKey: PageContentKey, baseFields: readonly PageContentField[]): readonly PageContentField[] {
  return [...baseFields, ...(PAGE_CONTENT_EXTRA_FIELDS[pageKey] ?? [])];
}

export function extraPageContentDefaults(pageKey: PageContentKey): Record<string, string> {
  return Object.fromEntries((PAGE_CONTENT_EXTRA_FIELDS[pageKey] ?? []).map((field) => [field.key, field.defaultValue]));
}
