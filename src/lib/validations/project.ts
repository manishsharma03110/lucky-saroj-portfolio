import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const projectSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(160),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(160)
    .regex(slugRegex, "Use lowercase letters, numbers and hyphens only"),
  clientName: z.string().trim().max(160).optional().or(z.literal("")),
  year: z.coerce.number().int().min(1990).max(2100).optional(),
  categoryId: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  challenge: z.string().trim().max(2000).optional().or(z.literal("")),
  approach: z.string().trim().max(2000).optional().or(z.literal("")),
  result: z.string().trim().max(2000).optional().or(z.literal("")),
  thumbnailUrl: z.string().trim().max(500).optional().or(z.literal("")),
  videoUrl: z.string().trim().max(500).optional().or(z.literal("")),
  isFeatured: z.coerce.boolean().optional(),
  status: z.enum(["draft", "published"]),
  seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(300).optional().or(z.literal("")),
  tools: z.string().trim().max(500).optional().or(z.literal("")), // comma separated
});

export type ProjectInput = z.infer<typeof projectSchema>;
