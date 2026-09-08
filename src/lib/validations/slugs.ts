import { z } from "zod";

export const CATEGORY_SLUG_MAX_LENGTH = 80;
export const PROJECT_SLUG_MAX_LENGTH = 160;
export const RESERVED_CATEGORY_SLUGS = ["all"] as const;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugSchema(maximumLength: number) {
  return z.string().trim().min(1, "Slug is required.").max(maximumLength, `Slug must be at most ${maximumLength} characters.`).regex(slugPattern, "Use lowercase ASCII letters, numbers, and single hyphens only.");
}

export const projectSlugSchema = slugSchema(PROJECT_SLUG_MAX_LENGTH);
export const categorySlugSchema = slugSchema(CATEGORY_SLUG_MAX_LENGTH).refine(
  (slug) => !(RESERVED_CATEGORY_SLUGS as readonly string[]).includes(slug),
  "This category slug is reserved."
);
