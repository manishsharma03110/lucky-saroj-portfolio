import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutStats } from "@/components/about/AboutStats";
import { Skills } from "@/components/about/Skills";
import { Journey } from "@/components/about/Journey";
import { AboutCTA } from "@/components/about/AboutCTA";
import { PageMotionBoundary } from "@/components/ui/PageMotionBoundary";
import { getAboutProfile, getAboutSkills, getAboutTools, getExperiences, getSiteSettings } from "@/lib/db/queries";
import { getPageContent } from "@/lib/db/page-content-service";
import { getPageSeo } from "@/lib/db/page-seo-service";
import { createCmsPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, settings] = await Promise.all([getPageSeo("about"), getSiteSettings()]);
  return createCmsPageMetadata(seo, settings?.ogImageUrl);
}

export default async function AboutPage() {
  const [profile, skills, tools, experiences, settings, page] = await Promise.all([
    getAboutProfile(), getAboutSkills(), getAboutTools(), getExperiences(), getSiteSettings(), getPageContent("about"),
  ]);
  const copy = page.content;

  return (
    <PageMotionBoundary className="bg-[var(--background-primary)] text-[var(--text-primary)]">
      <AboutHero name={profile?.name ?? ""} headline={profile?.headline} biography={profile?.biography} profileImageUrl={profile?.profileImageUrl} location={settings?.location} availability={settings?.availability} eyebrow={copy.heroEyebrow} primaryLabel={copy.heroPrimaryLabel} primaryUrl={copy.heroPrimaryUrl} secondaryLabel={copy.heroSecondaryLabel} secondaryUrl={copy.heroSecondaryUrl} />
      <AboutStats years={profile?.yearsExperience ?? 0} projects={profile?.projectsCompleted ?? 0} clients={profile?.clientCount ?? 0} views={profile?.viewsGenerated ?? "0"} yearsLabel={copy.statsYearsLabel} projectsLabel={copy.statsProjectsLabel} clientsLabel={copy.statsClientsLabel} viewsLabel={copy.statsViewsLabel} />
      <Skills biography={profile?.biography} skills={skills} tools={tools} storyEyebrow={copy.storyEyebrow} storyHeading={copy.storyHeading} skillsLabel={copy.skillsLabel} toolsLabel={copy.toolsLabel} />
      <Journey experiences={experiences} eyebrow={copy.journeyEyebrow} heading={copy.journeyHeading} linkLabel={copy.journeyLinkLabel} linkUrl={copy.journeyLinkUrl} presentLabel={copy.presentLabel} />
      <AboutCTA eyebrow={copy.ctaEyebrow} heading={copy.ctaHeading} description={copy.ctaDescription} primaryLabel={copy.ctaPrimaryLabel} primaryUrl={copy.ctaPrimaryUrl} secondaryLabel={copy.ctaSecondaryLabel} secondaryUrl={copy.ctaSecondaryUrl} />
    </PageMotionBoundary>
  );
}
