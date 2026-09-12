import { z } from "zod";
import { formDataCheckboxSchema } from "./booleans";
import { mediaReferenceSchema } from "./urls";
import { assetIdSchema } from "@/lib/media/ownership";

const optionalAssetId = assetIdSchema.optional().or(z.literal(""));
const optionalMediaReference = z.union([z.literal(""), mediaReferenceSchema]).refine(
  (value) => value.length <= 500,
  "Media reference must be at most 500 characters."
).optional();

export const testimonialSchema = z.object({
  clientName: z.string().trim().min(1, "Client name is required").max(120),
  designation: z.string().trim().max(120).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  profileImageUrl: optionalMediaReference,
  profileImageAssetId: optionalAssetId,
  testimonialText: z.string().trim().min(1, "Testimonial text is required").max(1000),
  rating: z.coerce.number().int().min(1).max(5),
  isFeatured: formDataCheckboxSchema,
  status: z.enum(["draft", "published"]),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
