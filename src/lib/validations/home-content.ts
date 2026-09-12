import { z } from "zod";

const internalTarget = z.string().trim().min(1).max(200).regex(/^(?:\/[A-Za-z0-9_\-/]*|#[A-Za-z][A-Za-z0-9_-]*)$/, "Use an internal path such as /portfolio or an anchor such as #showreel.");
const shortText = z.string().trim().min(1).max(120);
const optionalShortText = z.string().trim().max(240);
const heading = z.string().trim().min(1).max(220);
const description = z.string().trim().min(1).max(600);

export const homePageContentSchema = z.object({
  heroPrimaryLabel: shortText,
  heroPrimaryUrl: internalTarget,
  heroShowreelLabel: shortText,
  heroShowreelUrl: internalTarget,
  heroImageAlt: optionalShortText,
  showreelEyebrow: shortText,
  showreelRuntimeLabel: shortText,
  selectedWorkEyebrow: shortText,
  selectedWorkHeading: heading,
  selectedWorkCtaLabel: shortText,
  selectedWorkCtaUrl: internalTarget,
  servicesEyebrow: shortText,
  servicesHeading: heading,
  servicesDescription: description,
  servicesCtaLabel: shortText,
  servicesCtaUrl: internalTarget,
  aboutEyebrow: shortText,
  aboutCtaLabel: shortText,
  aboutCtaUrl: internalTarget,
  aboutStatYearsLabel: shortText,
  aboutStatProjectsLabel: shortText,
  aboutStatClientsLabel: shortText,
  aboutStatViewsLabel: shortText,
  aboutPortraitFallbackLabel: shortText,
  aboutProfileImageAlt: optionalShortText,
  testimonialsEyebrow: shortText,
  testimonialsHeading: heading,
  testimonialsDescription: description,
  finalCtaEyebrow: shortText,
  finalCtaHeading: heading,
  finalCtaDescription: description,
  finalCtaButtonLabel: shortText,
  finalCtaButtonUrl: internalTarget,
});

export type HomePageContentInput = z.infer<typeof homePageContentSchema>;
