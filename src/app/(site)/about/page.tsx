import { AboutHero } from "@/components/about/AboutHero";
import { AboutStats } from "@/components/about/AboutStats";
import { Skills } from "@/components/about/Skills";
import { Journey } from "@/components/about/Journey";
import { AboutCTA } from "@/components/about/AboutCTA";
import {
  getAboutProfile,
  getAboutSkills,
  getAboutTools,
  getExperiences,
  getSiteSettings,
} from "@/lib/db/queries";
import { getPageContent } from "@/lib/db/page-content-service";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "About",
  description: "Meet Lucky Saroj, a video editor and visual storyteller focused on documentaries, commercials, social content and motion-led post-production.",
  path: "/about",
});

export default async function AboutPage() {
  const [profile, skills, tools, experiences, settings, page] = await Promise.all([
    getAboutProfile(),
    getAboutSkills(),
    getAboutTools(),
    getExperiences(),
    getSiteSettings(),
    getPageContent("about"),
  ]);
  const copy = page.content;

  return (
    <main className="overflow-hidden bg-[var(--background-primary)] text-[var(--text-primary)]">
      <AboutHero
        name={profile?.name ?? ""}
        headline={profile?.headline}
        biography={profile?.biography}
        profileImageUrl={profile?.profileImageUrl}
        location={settings?.location}
        availability={settings?.availability}
        eyebrow={copy.heroEyebrow}
        primaryLabel={copy.heroPrimaryLabel}
        primaryUrl={copy.heroPrimaryUrl}
        secondaryLabel={copy.heroSecondaryLabel}
        secondaryUrl={copy.heroSecondaryUrl}
      />
      <AboutStats
        years={profile?.yearsExperience ?? 0}
        projects={profile?.projectsCompleted ?? 0}
        clients={profile?.clientCount ?? 0}
        views={profile?.viewsGenerated ?? "0"}
      />
      <Skills biography={profile?.biography} skills={skills} tools={tools} storyEyebrow={copy.storyEyebrow} storyHeading={copy.storyHeading} skillsLabel={copy.skillsLabel} toolsLabel={copy.toolsLabel} />
      <Journey experiences={experiences} />
      <AboutCTA eyebrow={copy.ctaEyebrow} heading={copy.ctaHeading} description={copy.ctaDescription} primaryLabel={copy.ctaPrimaryLabel} primaryUrl={copy.ctaPrimaryUrl} secondaryLabel={copy.ctaSecondaryLabel} secondaryUrl={copy.ctaSecondaryUrl} />
    </main>
  );
}
