import type { Metadata } from "next";
import type { PageSeoRecord } from "@/lib/db/page-seo-service";

export const SITE_NAME = "Lucky Saroj";
export const DEFAULT_SITE_TITLE = "Lucky Saroj — Video Editor & Visual Storyteller";
export const DEFAULT_SITE_DESCRIPTION =
  "Portfolio of Lucky Saroj, a freelance video editor specializing in YouTube documentaries, commercials, reels and motion graphics.";
export const FALLBACK_SITE_ORIGIN = "https://lucky-saroj-portfolio.vercel.app";

type SeoEnvironment = Record<string, string | undefined> & {
  NEXT_PUBLIC_SITE_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
};

function parseOrigin(value: string): URL | null {
  try {
    const parsed = new URL(value);
    if (!new Set(["http:", "https:"]).has(parsed.protocol)) return null;
    if (parsed.username || parsed.password || parsed.search || parsed.hash) return null;
    parsed.pathname = "/";
    return parsed;
  } catch {
    return null;
  }
}

export function resolveSiteUrl(environment: SeoEnvironment = process.env): URL {
  const configured = environment.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    const parsed = parseOrigin(configured);
    if (parsed) return parsed;
  }

  const vercelProductionHost = environment.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProductionHost) {
    const parsed = parseOrigin(`https://${vercelProductionHost.replace(/^https?:\/\//, "")}`);
    if (parsed) return parsed;
  }

  return new URL(FALLBACK_SITE_ORIGIN);
}

export function absoluteSiteUrl(pathname: string, environment?: SeoEnvironment): string {
  return new URL(pathname, resolveSiteUrl(environment)).toString();
}

function normalizeSocialImage(image: string | null | undefined): string[] | undefined {
  const value = image?.trim();
  if (!value) return undefined;
  try {
    return [new URL(value, resolveSiteUrl()).toString()];
  } catch {
    return undefined;
  }
}

export function createPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  keywords?: string[];
  robotsIndex?: boolean;
}): Metadata {
  const images = normalizeSocialImage(input.image);
  const robotsIndex = input.robotsIndex ?? true;
  return {
    title: input.title,
    description: input.description,
    ...(input.keywords && input.keywords.length > 0 ? { keywords: input.keywords } : {}),
    alternates: { canonical: input.path },
    robots: robotsIndex
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: input.title,
      description: input.description,
      url: input.path,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: input.title,
      description: input.description,
      ...(images ? { images } : {}),
    },
  };
}

export function createCmsPageMetadata(seo: PageSeoRecord, globalImage?: string | null): Metadata {
  const image = seo.ogImageUrl || globalImage || null;
  const images = normalizeSocialImage(image);
  const keywords = seo.keywords
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    ...(keywords.length > 0 ? { keywords } : {}),
    alternates: { canonical: seo.canonicalPath },
    robots: seo.robotsIndex
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: seo.canonicalPath,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: seo.ogTitle,
      description: seo.ogDescription,
      ...(images ? { images } : {}),
    },
  };
}
