import { z } from "zod";
import { mediaReferenceSchema } from "./urls";
import { assetIdSchema } from "@/lib/media/ownership";

const optionalProfileImageUrl = z.union([z.literal(""), mediaReferenceSchema]).refine(
  (value) => value.length <= 2048,
  "Profile image reference is too long."
);
const optionalProfileImageAssetId = z.union([z.literal(""), assetIdSchema]);

export const aboutProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  headline: z.string().trim().max(200).optional().or(z.literal("")),
  biography: z.string().trim().max(3000).optional().or(z.literal("")),
  profileImageUrl: optionalProfileImageUrl,
  profileImageAssetId: optionalProfileImageAssetId,
  yearsExperience: z.coerce.number().int().min(0).max(80),
  projectsCompleted: z.coerce.number().int().min(0).max(100000),
  clientCount: z.coerce.number().int().min(0).max(100000),
  viewsGenerated: z.string().trim().max(40),
  skills: z.string().trim().max(1000).optional().or(z.literal("")), // comma separated
  tools: z.string().trim().max(1000).optional().or(z.literal("")), // comma separated
});

export type AboutProfileInput = z.infer<typeof aboutProfileSchema>;
