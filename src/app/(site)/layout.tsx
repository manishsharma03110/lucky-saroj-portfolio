import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactPopup } from "@/components/contact/ContactPopup";
import { getSiteBranding, getSiteSettings } from "@/lib/db/queries";
import { getPageContent } from "@/lib/db/page-content-service";

// CMS-driven content should reflect immediately after an admin edit, not
// require a rebuild — render these pages per-request instead of at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const socialImage = settings?.ogImageUrl || undefined;
  return {
    icons: settings?.favicon ? { icon: settings.favicon } : undefined,
    openGraph: socialImage ? { images: [{ url: socialImage }] } : undefined,
    twitter: socialImage ? { card: "summary_large_image", images: [socialImage] } : undefined,
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, branding, globalPage] = await Promise.all([getSiteSettings(), getSiteBranding(), getPageContent("global")]);
  const global = globalPage.content;
  return (
    <div className="public-site contents">
      <Header
        logoText={settings?.logoText}
        logoImageUrl={branding?.logoImageUrl}
        siteName={settings?.siteName}
        roleLabel={global.headerRoleLabel}
        ctaLabel={global.headerCtaLabel}
        ctaUrl={global.headerCtaUrl}
        navLabels={{ home: global.navHomeLabel, about: global.navAboutLabel, portfolio: global.navPortfolioLabel, services: global.navServicesLabel, experience: global.navExperienceLabel, contact: global.navContactLabel }}
      />
      <main className="flex-1">{children}</main>
      <Footer content={global} />
      <ContactPopup copy={global} />
    </div>
  );
}
