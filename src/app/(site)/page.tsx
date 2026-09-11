import type { Metadata } from "next";
import { AboutPreview } from "@/components/home/AboutPreview";
import { EditingStyles } from "@/components/home/EditingStyles";
import { FinalCTA } from "@/components/home/FinalCTA";
import { Hero } from "@/components/home/Hero";
import { SelectedWork } from "@/components/home/SelectedWork";
import { ShowreelSection } from "@/components/home/ShowreelSection";
import { TestimonialsPreview } from "@/components/home/TestimonialsPreview";
import { getFeaturedShowreel, getSiteSettings } from "@/lib/db/queries";
import { getHomePageContent } from "@/lib/db/home-content-service";
import { getPageSeo } from "@/lib/db/page-seo-service";
import { createCmsPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, settings] = await Promise.all([getPageSeo("home"), getSiteSettings()]);
  return createCmsPageMetadata(seo, settings?.ogImageUrl);
}

export default async function HomePage() {
  const [settings, showreel, content] = await Promise.all([
    getSiteSettings(),
    getFeaturedShowreel(),
    getHomePageContent(),
  ]);

  return (
    <main className="overflow-hidden bg-[var(--background-primary)] text-[var(--text-primary)]">
      <Hero
        heading={settings?.heroHeading ?? settings?.siteName ?? ""}
        subheading={settings?.heroSubheading ?? ""}
        description={settings?.heroDescription ?? ""}
        heroImageUrl={settings?.heroImageUrl}
        hasShowreel={Boolean(showreel?.videoUrl)}
      />
      <SelectedWork content={content} />
      <ShowreelSection showreel={showreel} />
      <EditingStyles content={content} />
      <AboutPreview content={content} />
      <TestimonialsPreview content={content} />
      <FinalCTA content={content} />
    </main>
  );
}
