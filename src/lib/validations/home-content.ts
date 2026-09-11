import { z } from "zod";

const internalPath = z.string().trim().min(1).max(200).regex(/^\/[A-Za-z0-9_\-/]*$/, "Use an internal path such as /portfolio.");
const shortText = z.string().trim().min(1).max(120);
const heading = z.string().trim().min(1).max(220);
const description = z.string().trim().min(1).max(600);

export const homePageContentSchema = z.object({
  selectedWorkEyebrow: shortText,
  selectedWorkHeading: heading,
  selectedWorkCtaLabel: shortText,
  selectedWorkCtaUrl: internalPath,
  servicesEyebrow: shortText,
  servicesHeading: heading,
  servicesDescription: description,
  servicesCtaLabel: shortText,
  servicesCtaUrl: internalPath,
  aboutEyebrow: shortText,
  aboutCtaLabel: shortText,
  aboutCtaUrl: internalPath,
  testimonialsEyebrow: shortText,
  testimonialsHeading: heading,
  testimonialsDescription: description,
  finalCtaEyebrow: shortText,
  finalCtaHeading: heading,
  finalCtaDescription: description,
  finalCtaButtonLabel: shortText,
  finalCtaButtonUrl: internalPath,
});

export type HomePageContentInput = z.infer<typeof homePageContentSchema>;
