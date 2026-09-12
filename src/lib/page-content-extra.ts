import type { PageContentField, PageContentKey } from "./page-content";

export const PAGE_CONTENT_EXTRA_FIELDS: Partial<Record<PageContentKey, readonly PageContentField[]>> = {
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
  portfolio: [
    { key: "detailNavigationAriaLabel", label: "Project Navigation Accessibility Label", defaultValue: "Project navigation" },
    { key: "detailPreviousLabel", label: "Previous Project Label", defaultValue: "Previous project" },
    { key: "detailNextLabel", label: "Next Project Label", defaultValue: "Next project" },
  ],
};

export function pageContentFields(pageKey: PageContentKey, baseFields: readonly PageContentField[]): readonly PageContentField[] {
  return [...baseFields, ...(PAGE_CONTENT_EXTRA_FIELDS[pageKey] ?? [])];
}

export function extraPageContentDefaults(pageKey: PageContentKey): Record<string, string> {
  return Object.fromEntries((PAGE_CONTENT_EXTRA_FIELDS[pageKey] ?? []).map((field) => [field.key, field.defaultValue]));
}
