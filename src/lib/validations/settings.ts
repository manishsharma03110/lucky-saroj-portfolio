import { z } from "zod";

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1).max(120),
  logoText: z.string().trim().min(1).max(10),
  contactEmail: z.string().trim().email(),
  contactPhone: z.string().trim().max(40),
  location: z.string().trim().max(120),
  availability: z.string().trim().max(120),
  heroHeading: z.string().trim().max(160),
  heroSubheading: z.string().trim().max(200),
  heroDescription: z.string().trim().max(600),
  statYears: z.string().trim().max(20),
  statProjects: z.string().trim().max(20),
  statClients: z.string().trim().max(20),
  statViews: z.string().trim().max(20),
  footerDescription: z.string().trim().max(400),
  instagramUrl: z.string().trim().max(300).optional().or(z.literal("")),
  youtubeUrl: z.string().trim().max(300).optional().or(z.literal("")),
  linkedinUrl: z.string().trim().max(300).optional().or(z.literal("")),
  behanceUrl: z.string().trim().max(300).optional().or(z.literal("")),
  vimeoUrl: z.string().trim().max(300).optional().or(z.literal("")),
  seoTitle: z.string().trim().max(200),
  seoDescription: z.string().trim().max(300).optional().or(z.literal("")),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
