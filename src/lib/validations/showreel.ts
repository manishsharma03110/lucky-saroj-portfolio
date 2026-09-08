import { z } from "zod";
import { formDataCheckboxSchema } from "./booleans";
import { mediaReferenceSchema } from "./urls";
import { assetIdSchema } from "@/lib/media/ownership";

const optionalAssetId = assetIdSchema.optional().or(z.literal(""));

const optionalMediaReference = z.union([z.literal(""), mediaReferenceSchema]).refine(
  (value) => value.length <= 500,
  "Media reference must be at most 500 characters."
);

export const showreelSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
  videoUrl: optionalMediaReference,
  videoAssetId: optionalAssetId,
  thumbnailUrl: optionalMediaReference,
  thumbnailAssetId: optionalAssetId,
  duration: z.string().trim().max(20).optional().or(z.literal("")),
  isFeatured: formDataCheckboxSchema,
  status: z.enum(["draft", "published"]),
});

export type ShowreelInput = z.infer<typeof showreelSchema>;
