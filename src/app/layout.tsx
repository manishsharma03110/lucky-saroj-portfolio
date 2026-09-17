import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Poppins } from "next/font/google";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/db/queries";
import { DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_TITLE, resolveSiteUrl } from "@/lib/seo";
import "./globals.css";

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
    metadataBase: resolveSiteUrl(),
    title: { default: title, template: `%s — ${siteName}` },
    description,
    alternates: { canonical: "/" },
    ...(settings?.favicon ? { icons: { icon: settings.favicon } } : {}),
    openGraph: { type: "website", siteName, title, description, url: "/", ...(image ? { images: [image] } : {}) },
    twitter: {
      card: extra?.twitterCardType ?? (image ? "summary_large_image" : "summary"),
      title,
      description,
      ...(extra?.twitterSiteUsername ? { site: extra.twitterSiteUsername } : {}),
      ...(image ? { images: [image] } : {}),
    },
    verification: settings?.googleSiteVerification ? { google: settings.googleSiteVerification } : undefined,
  };
}

const responsiveModeScript = `
(function () {
  try {
    var root = document.documentElement;
    var viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) return;

    var ua = navigator.userAgent || '';
    var platform = navigator.platform || '';
    var touchPoints = navigator.maxTouchPoints || 0;
    var mobileToken = /iPhone|iPad|iPod|Android|Mobile|IEMobile|Opera Mini/i.test(ua);
    var appleMobileToken = /iPhone|iPad|iPod/i.test(ua);
    var macStyleUA = /Macintosh/i.test(ua);
    var iPadDesktopUA = macStyleUA && (platform === 'MacIntel' || platform === 'Macintosh') && touchPoints > 1;
    var coarsePointer = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    var shortSide = Math.min(screen.width || 9999, screen.height || 9999);
    var phoneSizedScreen = shortSide <= 500;
    var touchDevice = touchPoints > 0 || coarsePointer;

    // iPhone Safari's Request Desktop Website can expose a desktop/Mac-style UA.
    // A Mac-style UA + touch + phone-sized physical screen is therefore treated
    // as an explicit desktop-content request, while normal iPhone UA stays mobile.
    var iphoneRequestedDesktop = macStyleUA && touchDevice && phoneSizedScreen && !appleMobileToken;
    var requestedDesktop = iphoneRequestedDesktop || (touchDevice && shortSide <= 1024 && !mobileToken && !iPadDesktopUA);

    if (requestedDesktop) {
      viewport.setAttribute('content', 'width=1200, initial-scale=1, viewport-fit=cover');
      root.dataset.requestedDesktop = 'true';
      root.dataset.responsiveMode = 'desktop';
    } else {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
      delete root.dataset.requestedDesktop;
      root.dataset.responsiveMode = mobileToken || touchDevice ? 'mobile' : 'desktop';
    }
  } catch (_) {
    // Keep the standards-based responsive viewport if browser signals are unavailable.
  }
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Script id="responsive-site-viewport" strategy="beforeInteractive">
          {responsiveModeScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
