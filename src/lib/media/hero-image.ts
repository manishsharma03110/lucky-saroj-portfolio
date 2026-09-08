import { mediaReferenceSchema } from "@/lib/validations/urls";

export const HERO_IMAGE_FALLBACK = "/uploads/HomePage/homepage-hero-background.webp";

export function resolveHeroImageUrl(value: unknown): string {
  const parsed = mediaReferenceSchema.safeParse(value);
  return parsed.success ? parsed.data : HERO_IMAGE_FALLBACK;
}
