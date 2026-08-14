import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(80)
    .regex(slugRegex, "Use lowercase letters, numbers and hyphens only"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
