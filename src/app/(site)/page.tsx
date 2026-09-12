import type { Metadata } from "next";
import { AboutPreview } from "@/components/home/AboutPreview";
import { EditingStyles } from "@/components/home/EditingStyles";
import { FinalCTA } from "@/components/home/FinalCTA";
import { Hero } from "@/components/home/Hero";
import { SelectedWork } from "@/components/home/SelectedWork";
import { ShowreelSection } from "@/components/home/ShowreelSection";
import { TestimonialsPreview } from "@/components/home/TestimonialsPreview";
import { MotionReveal } from "@/components/ui/MotionReveal";
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
        heroImageAlt={content.heroImageAlt}
        primaryLabel={content.heroPrimaryLabel}
        primaryUrl={content.heroPrimaryUrl}
        showreelLabel={content.heroShowreelLabel}
        showreelUrl={content.heroShowreelUrl}
        hasShowreel={Boolean(showreel?.videoUrl)}
      />
      <MotionReveal><SelectedWork content={content} /></MotionReveal>
      <MotionReveal delay={70}><ShowreelSection showreel={showreel} content={content} /></MotionReveal>
      <MotionReveal delay={90}><EditingStyles content={content} /></MotionReveal>
      <MotionReveal delay={90}><AboutPreview content={content} /></MotionReveal>
      <MotionReveal delay={90}><TestimonialsPreview content={content} /></MotionReveal>
      <MotionReveal delay={70}><FinalCTA content={content} /></MotionReveal>
    </main>
  );
}
