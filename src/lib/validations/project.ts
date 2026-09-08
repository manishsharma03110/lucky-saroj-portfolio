import { z } from "zod";
import { formDataCheckboxSchema } from "./booleans";
import { entityIdSchema } from "./identifiers";
import { projectSlugSchema } from "./slugs";
import { mediaReferenceSchema } from "./urls";
import { assetIdSchema } from "@/lib/media/ownership";

const optionalEntityId = z.union([z.literal(""), entityIdSchema]);
const optionalAssetId = assetIdSchema.optional().or(z.literal(""));
const optionalMediaReference = z.union([z.literal(""), mediaReferenceSchema]).refine(
  (value) => value.length <= 500,
  "Media reference must be at most 500 characters."
);

export const projectSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(160),
  slug: projectSlugSchema,
  clientName: z.string().trim().max(160).optional().or(z.literal("")),
  year: z.coerce.number().int().min(1990).max(2100).optional(),
  categoryId: optionalEntityId,
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  challenge: z.string().trim().max(2000).optional().or(z.literal("")),
  approach: z.string().trim().max(2000).optional().or(z.literal("")),
  result: z.string().trim().max(2000).optional().or(z.literal("")),
  thumbnailUrl: optionalMediaReference,
  thumbnailAssetId: optionalAssetId,
  videoUrl: optionalMediaReference,
  videoAssetId: optionalAssetId,
  isFeatured: formDataCheckboxSchema,
  status: z.enum(["draft", "published"]),
  seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(300).optional().or(z.literal("")),
  tools: z.string().trim().max(500).optional().or(z.literal("")), // comma separated
});

export type ProjectInput = z.infer<typeof projectSchema>;
