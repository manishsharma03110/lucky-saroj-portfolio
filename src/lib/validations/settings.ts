import { z } from "zod";
import { boundedContactEmailSchema } from "./email";
import { externalWebUrlSchema, mediaReferenceSchema } from "./urls";
import { assetIdSchema } from "@/lib/media/ownership";

const boundedExternalUrl = externalWebUrlSchema.refine((value) => value.length <= 300, "URL must be at most 300 characters.");
const optionalUrl = z.union([z.literal(""), boundedExternalUrl]);
const optionalImageUrl = z.union([z.literal(""), mediaReferenceSchema]).refine((value) => value.length <= 2048, "Image reference is too long.");
const optionalImageAssetId = z.union([z.literal(""), assetIdSchema]);
const optionalWhatsApp = z.union([z.literal(""), boundedExternalUrl, z.string().trim().regex(/^\+?[\d\s().-]{7,40}$/, "Enter a valid WhatsApp number or URL.")]);
const optionalGaMeasurementId = z.union([z.literal(""), z.string().trim().toUpperCase().regex(/^G-[A-Z0-9]+$/, "Use a valid GA4 Measurement ID, for example G-XXXXXXXXXX.")]);
const twitterUsername = z.union([z.literal(""), z.string().trim().regex(/^@[A-Za-z0-9_]{1,15}$/, "Use a valid X/Twitter username beginning with @.")]);

function normalizeGoogleSiteVerification(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed || !/<meta\b/i.test(trimmed)) return trimmed;
  if (!/name\s*=\s*["']google-site-verification["']/i.test(trimmed)) return trimmed;
  const contentMatch = trimmed.match(/\bcontent\s*=\s*(["'])(.*?)\1/i);
  return contentMatch?.[2]?.trim() ?? trimmed;
}
const optionalGoogleSiteVerification = z.preprocess(normalizeGoogleSiteVerification, z.union([z.literal(""), z.string().trim().max(512).refine((value) => !/[<>]/.test(value), "Paste only the Google verification content value, or a valid google-site-verification meta tag.")]));

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1).max(120), logoText: z.string().trim().min(1).max(10), logoImageUrl: optionalImageUrl.optional(), logoImageAssetId: optionalImageAssetId.optional(), favicon: optionalImageUrl.optional(), faviconAssetId: optionalImageAssetId.optional(),
  contactEmail: boundedContactEmailSchema, contactPhone: z.string().trim().max(40), whatsapp: optionalWhatsApp, location: z.string().trim().max(120), availability: z.string().trim().max(120), paymentTerms: z.string().trim().max(300).optional().or(z.literal("")), turnaroundTime: z.string().trim().max(300).optional().or(z.literal("")),
  heroHeading: z.string().trim().max(160), heroSubheading: z.string().trim().max(200), heroDescription: z.string().trim().max(600), heroImageUrl: optionalImageUrl, heroImageAssetId: optionalImageAssetId, statYears: z.string().trim().max(20), statProjects: z.string().trim().max(20), statClients: z.string().trim().max(20), statViews: z.string().trim().max(20), footerDescription: z.string().trim().max(400),
  instagramUrl: optionalUrl, twitterUrl: optionalUrl, youtubeUrl: optionalUrl, linkedinUrl: optionalUrl, behanceUrl: optionalUrl, vimeoUrl: optionalUrl,
  seoTitle: z.string().trim().max(200), seoDescription: z.string().trim().max(300).optional().or(z.literal("")), ogImageUrl: optionalImageUrl.optional(), ogImageAssetId: optionalImageAssetId.optional(), googleAnalyticsMeasurementId: optionalGaMeasurementId.optional().default(""), googleSiteVerification: optionalGoogleSiteVerification.optional().default(""),
  twitterCardType: z.enum(["summary", "summary_large_image"]).optional().default("summary_large_image"), twitterSiteUsername: twitterUsername.optional().default(""), robotsTxt: z.string().trim().min(1, "robots.txt cannot be empty.").max(5000, "robots.txt must be at most 5000 characters.").refine((value) => !/^\s*(?:Sitemap|Host):\s*(?!https:\/\/)/im.test(value), "Sitemap and Host directives must use HTTPS URLs.").optional().default("User-agent: *\nAllow: /")
});
export type SettingsInput = z.input<typeof settingsSchema>;
