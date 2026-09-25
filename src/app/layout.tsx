import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/db/queries";
import { DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_TITLE, resolveSiteUrl } from "@/lib/seo";
import { CmsLiveSync } from "@/components/CmsLiveSync";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { themeInitScript } from "@/lib/theme-init";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-poppins", display: "swap" });
type Extra = { twitterCardType: "summary" | "summary_large_image"; twitterSiteUsername: string | null };

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
    <html lang="en" data-theme="dark" suppressHydrationWarning data-scroll-behavior="smooth" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <head>
        <script id="theme-init" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://drive.google.com" />
        <link rel="preconnect" href="https://drive.usercontent.google.com" />
        <link rel="dns-prefetch" href="//drive.google.com" />
        <link rel="dns-prefetch" href="//drive.usercontent.google.com" />
      </head>
      <body className="min-h-full flex flex-col"><ThemeProvider><CmsLiveSync />{children}</ThemeProvider></body>
    </html>
  );
}
