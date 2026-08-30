import type { Metadata } from "next";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { ContactFormShell } from "@/components/contact/page/ContactFormShell";
import { ContactHero } from "@/components/contact/page/ContactHero";
import { ContactPortfolioCTA } from "@/components/contact/page/ContactPortfolioCTA";
import { getAboutProfile, getServices, getSiteSettings } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const [settings, profile, services] = await Promise.all([
    getSiteSettings(),
    getAboutProfile(),
    getServices(),
  ]);
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
      <ContactHero />

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
      <ContactPortfolioCTA />
    </main>
  );
}
