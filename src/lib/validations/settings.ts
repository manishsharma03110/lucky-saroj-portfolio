import { z } from "zod";
import { boundedContactEmailSchema } from "./email";
import { externalWebUrlSchema, mediaReferenceSchema } from "./urls";
import { assetIdSchema } from "@/lib/media/ownership";

const boundedExternalUrl = externalWebUrlSchema.refine((value) => value.length <= 300, "URL must be at most 300 characters.");
const optionalUrl = z.union([z.literal(""), boundedExternalUrl]);
const optionalImageUrl = z.union([z.literal(""), mediaReferenceSchema]).refine(
  (value) => value.length <= 2048,
  "Image reference is too long."
);
const optionalImageAssetId = z.union([z.literal(""), assetIdSchema]);
const optionalWhatsApp = z.union([
  z.literal(""),
  boundedExternalUrl,
  z.string().trim().regex(/^\+?[\d\s().-]{7,40}$/, "Enter a valid WhatsApp number or URL."),
]);
const optionalGaMeasurementId = z.union([
  z.literal(""),
  z.string().trim().toUpperCase().regex(/^G-[A-Z0-9]+$/, "Use a valid GA4 Measurement ID, for example G-XXXXXXXXXX."),
]);

function normalizeGoogleSiteVerification(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (!/<meta\b/i.test(trimmed)) return trimmed;
  if (!/name\s*=\s*["']google-site-verification["']/i.test(trimmed)) return trimmed;
  return trimmed.match(/content\s*=\s*["']([^"']+)["']/i)?.[1]?.trim() ?? trimmed;
}

const optionalGoogleSiteVerification = z
  .string()
  .max(2000, "Search Console verification input is too long.")
  .transform(normalizeGoogleSiteVerification)
  .refine((value) => value.length <= 255, "Search Console verification code must be at most 255 characters.")
  .refine((value) => !/[<>]/.test(value), "Paste only the Search Console verification code or its Google meta tag.");

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1).max(120),
  logoText: z.string().trim().min(1).max(10),
  logoImageUrl: optionalImageUrl.optional(),
  logoImageAssetId: optionalImageAssetId.optional(),
  favicon: optionalImageUrl.optional(),
  faviconAssetId: optionalImageAssetId.optional(),
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
  heroImageUrl: optionalImageUrl,
  heroImageAssetId: optionalImageAssetId,
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
  ogImageUrl: optionalImageUrl.optional(),
  ogImageAssetId: optionalImageAssetId.optional(),
  googleAnalyticsMeasurementId: optionalGaMeasurementId.optional().default(""),
  googleSiteVerification: optionalGoogleSiteVerification.optional().default(""),
});

export type SettingsInput = z.input<typeof settingsSchema>;
