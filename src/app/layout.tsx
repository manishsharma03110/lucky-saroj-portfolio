import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Inter, Poppins } from "next/font/google";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/db/queries";
import { DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_TITLE, resolveSiteUrl } from "@/lib/seo";
import { CmsLiveSync } from "@/components/CmsLiveSync";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-poppins", display: "swap" });
type Extra = { twitterCardType: "summary" | "summary_large_image"; twitterSiteUsername: string | null };

export async function generateViewport(): Promise<Viewport> {
  const requestHeaders = await headers();
  const ua = requestHeaders.get("user-agent") || "";
  const chMobile = requestHeaders.get("sec-ch-ua-mobile");
  const chPlatform = requestHeaders.get("sec-ch-ua-platform") || "";

  // Browsers that explicitly request a desktop site remove their normal mobile
  // signal. Android Chromium can still expose the Android platform through UA
  // or Client Hints; iOS/iPadOS Safari presents a Macintosh desktop UA.
  // Give those requests a real desktop layout viewport so every Tailwind
  // lg/xl section (header, grids, about, footer and public pages) switches as
  // one system instead of producing a mixed mobile/desktop composition.
  const androidDesktopRequest =
    (/Android/i.test(ua) && !/Mobile/i.test(ua)) ||
    (/Android/i.test(chPlatform) && chMobile === "?0");
  const appleDesktopRequest =
    /Macintosh/i.test(ua) &&
    /AppleWebKit/i.test(ua) &&
    /Safari/i.test(ua) &&
    !/Mobile\//i.test(ua);

  return {
    width: androidDesktopRequest || appleDesktopRequest ? 1200 : "device-width",
    initialScale: 1,
    viewportFit: "cover",
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const [settings, extraRows] = await Promise.all([
    getSiteSettings(),
    db.execute<Extra>(sql`SELECT twitter_card_type AS "twitterCardType",twitter_site_username AS "twitterSiteUsername" FROM site_settings WHERE id='singleton:settings'`),
  ]);
  const extra = extraRows.rows[0];
  const title = settings?.seoTitle || DEFAULT_SITE_TITLE;
  const description = settings?.seoDescription || DEFAULT_SITE_DESCRIPTION;
  const image = settings?.ogImageUrl || undefined;
  const siteName = settings?.siteName || "Lucky Saroj";
  return {
    metadataBase: resolveSiteUrl(), title: { default: title, template: `%s — ${siteName}` }, description, alternates: { canonical: "/" },
    ...(settings?.favicon ? { icons: { icon: settings.favicon } } : {}),
    openGraph: { type: "website", siteName, title, description, url: "/", ...(image ? { images: [image] } : {}) },
    twitter: { card: extra?.twitterCardType ?? (image ? "summary_large_image" : "summary"), title, description, ...(extra?.twitterSiteUsername ? { site: extra.twitterSiteUsername } : {}), ...(image ? { images: [image] } : {}) },
    verification: settings?.googleSiteVerification ? { google: settings.googleSiteVerification } : undefined,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col"><CmsLiveSync />{children}</body>
    </html>
  );
}
