import { z } from "zod";
import { formDataCheckboxSchema } from "./booleans";
import { entityIdSchema } from "./identifiers";
import { projectSlugSchema } from "./slugs";
import { mediaReferenceSchema } from "./urls";
import { assetIdSchema } from "@/lib/media/ownership";
import { getVideoSource } from "@/lib/media/video";

const optionalEntityId = z.union([z.literal(""), entityIdSchema]);
const optionalAssetId = assetIdSchema.optional().or(z.literal(""));
const optionalMediaReference = z.union([z.literal(""), mediaReferenceSchema]).refine((v) => v.length <= 500, "Media reference must be at most 500 characters.");
const optionalSocialImage = z.union([z.literal(""), mediaReferenceSchema]).refine((v) => v.length <= 2048, "Social image reference is too long.");
const optionalVideoReference = z.string().trim().max(2048, "Video URL is too long.").optional().or(z.literal("")).superRefine((value, ctx) => {
  if (!value || getVideoSource(value)) return;
  ctx.addIssue({
    code: "custom",
    message: "Enter a valid video URL. Pinterest, YouTube, Google Drive, direct MP4/WebM, and other http(s) video/page URLs are accepted.",
  });
});

export const projectSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(160), slug: projectSlugSchema,
  clientName: z.string().trim().max(160).optional().or(z.literal("")), year: z.coerce.number().int().min(1990).max(2100).optional(), categoryId: optionalEntityId,
  description: z.string().trim().max(2000).optional().or(z.literal("")), challenge: z.string().trim().max(2000).optional().or(z.literal("")), approach: z.string().trim().max(2000).optional().or(z.literal("")), result: z.string().trim().max(2000).optional().or(z.literal("")),
  thumbnailUrl: optionalMediaReference, thumbnailAssetId: optionalAssetId, thumbnailAlt: z.string().trim().max(300).optional().or(z.literal("")),
  videoUrl: optionalVideoReference, videoAssetId: optionalAssetId, videoOrientation: z.enum(["auto", "landscape", "portrait"]).default("auto"),
  isFeatured: formDataCheckboxSchema, status: z.enum(["draft", "published"]), seoTitle: z.string().trim().max(200).optional().or(z.literal("")), seoDescription: z.string().trim().max(320).optional().or(z.literal("")),
  ogTitle: z.string().trim().max(200).optional().or(z.literal("")), ogDescription: z.string().trim().max(320).optional().or(z.literal("")), ogImageUrl: optionalSocialImage.optional(),
  twitterTitle: z.string().trim().max(200).optional().or(z.literal("")), twitterDescription: z.string().trim().max(320).optional().or(z.literal("")), twitterImageUrl: optionalSocialImage.optional(),
  tools: z.string().trim().max(500).optional().or(z.literal("")), relatedProjectIds: z.array(entityIdSchema).max(3, "Choose up to 3 related projects.").optional(),
});
export type ProjectInput = z.input<typeof projectSchema>;
export type ParsedProjectInput = z.output<typeof projectSchema>;
