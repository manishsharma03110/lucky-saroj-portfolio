import type { Metadata } from "next";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { ContactFormShell } from "@/components/contact/page/ContactFormShell";
import { ContactHero } from "@/components/contact/page/ContactHero";
import { ContactPortfolioCTA } from "@/components/contact/page/ContactPortfolioCTA";
import { getAboutProfile, getServices, getSiteSettings } from "@/lib/db/queries";
import { getPageContent } from "@/lib/db/page-content-service";
import { getPageSeo } from "@/lib/db/page-seo-service";
import { createCmsPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, settings] = await Promise.all([getPageSeo("contact"), getSiteSettings()]);
  return createCmsPageMetadata(seo, settings?.ogImageUrl);
}

export default async function ContactPage() {
  const [settings, profile, services, page] = await Promise.all([
    getSiteSettings(),
    getAboutProfile(),
    getServices(),
    getPageContent("contact"),
  ]);
  const copy = page.content;
  const socialLinks = [
    { label: "Instagram", href: settings?.instagramUrl },
    { label: "X / Twitter", href: settings?.twitterUrl },
    { label: "YouTube", href: settings?.youtubeUrl },
    { label: "LinkedIn", href: settings?.linkedinUrl },
    { label: "Behance", href: settings?.behanceUrl },
    { label: "Vimeo", href: settings?.vimeoUrl },
  ];

  return (
    <main className="overflow-hidden bg-[var(--background-primary)]">
      <ContactHero eyebrow={copy.heroEyebrow} titleBefore={copy.heroTitleBefore} titleAccent={copy.heroTitleAccent} titleAfter={copy.heroTitleAfter} description={copy.heroDescription} />

      <section className="bg-[var(--background-primary)] py-12 sm:py-16" aria-labelledby="contact-details-heading">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-12 rounded-lg border border-white/10 bg-[var(--background-secondary)] p-5 sm:p-8 lg:grid-cols-[minmax(17rem,0.68fr)_minmax(0,1.32fr)] lg:items-start lg:gap-10 lg:p-0 lg:pl-10 xl:grid-cols-[minmax(18rem,0.64fr)_minmax(0,1.36fr)] xl:gap-14 xl:pl-12">
            <ContactInfo
              name={settings?.siteName ?? profile?.name ?? "Lucky Saroj"}
              email={settings?.contactEmail}
              phone={settings?.contactPhone}
              whatsapp={settings?.whatsapp}
              location={settings?.location}
              availability={settings?.availability}
              paymentTerms={settings?.paymentTerms}
              turnaroundTime={settings?.turnaroundTime}
              socialLinks={socialLinks}
            />
            <ContactFormShell projectCategories={services.map((service) => service.name)} />
          </div>
        </div>
      </section>
      <ContactPortfolioCTA heading={copy.portfolioCtaHeading} description={copy.portfolioCtaDescription} label={copy.portfolioCtaLabel} url={copy.portfolioCtaUrl} />
    </main>
  );
}
