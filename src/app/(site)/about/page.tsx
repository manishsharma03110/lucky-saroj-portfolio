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
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "About",
  description: "Meet Lucky Saroj, a video editor and visual storyteller focused on documentaries, commercials, social content and motion-led post-production.",
  path: "/about",
});

export default async function AboutPage() {
  const [profile, skills, tools, experiences, settings] = await Promise.all([
    getAboutProfile(),
    getAboutSkills(),
    getAboutTools(),
    getExperiences(),
    getSiteSettings(),
  ]);

  return (
    <main className="overflow-hidden bg-[var(--background-primary)] text-[var(--text-primary)]">
      <AboutHero
        name={profile?.name ?? ""}
        headline={profile?.headline}
        biography={profile?.biography}
        profileImageUrl={profile?.profileImageUrl}
        location={settings?.location}
        availability={settings?.availability}
      />
      <AboutStats
        years={profile?.yearsExperience ?? 0}
        projects={profile?.projectsCompleted ?? 0}
        clients={profile?.clientCount ?? 0}
        views={profile?.viewsGenerated ?? "0"}
      />
      <Skills skills={skills} tools={tools} />
      <Journey experiences={experiences} />
      <AboutCTA />
    </main>
  );
}
