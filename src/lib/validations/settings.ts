import { z } from "zod";
import { boundedContactEmailSchema } from "./email";
import { externalWebUrlSchema, mediaReferenceSchema } from "./urls";
import { assetIdSchema } from "@/lib/media/ownership";

const boundedExternalUrl = externalWebUrlSchema.refine((value) => value.length <= 300, "URL must be at most 300 characters.");
const optionalUrl = z.union([z.literal(""), boundedExternalUrl]);
const optionalHeroImageUrl = z.union([z.literal(""), mediaReferenceSchema]).refine(
  (value) => value.length <= 2048,
  "Hero image reference is too long."
);
const optionalHeroImageAssetId = z.union([z.literal(""), assetIdSchema]);
const optionalWhatsApp = z.union([
  z.literal(""),
  boundedExternalUrl,
  z.string().trim().regex(/^\+?[\d\s().-]{7,40}$/, "Enter a valid WhatsApp number or URL."),
]);

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1).max(120),
  logoText: z.string().trim().min(1).max(10),
  contactEmail: boundedContactEmailSchema,
  contactPhone: z.string().trim().max(40),
  whatsapp: optionalWhatsApp,
  location: z.string().trim().max(120),
  availability: z.string().trim().max(120),
  paymentTerms: z.string().trim().max(300).optional().or(z.literal("")),
  turnaroundTime: z.string().trim().max(300).optional().or(z.literal("")),
  heroHeading: z.string().trim().max(160),
  heroSubheading: z.string().trim().max(200),
  heroDescription: z.string().trim().max(600),
  heroImageUrl: optionalHeroImageUrl,
  heroImageAssetId: optionalHeroImageAssetId,
  statYears: z.string().trim().max(20),
  statProjects: z.string().trim().max(20),
  statClients: z.string().trim().max(20),
  statViews: z.string().trim().max(20),
  footerDescription: z.string().trim().max(400),
  instagramUrl: optionalUrl,
  twitterUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  behanceUrl: optionalUrl,
  vimeoUrl: optionalUrl,
  seoTitle: z.string().trim().max(200),
  seoDescription: z.string().trim().max(300).optional().or(z.literal("")),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
