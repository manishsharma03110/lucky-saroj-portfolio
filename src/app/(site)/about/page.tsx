import type { Metadata } from "next";
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

export const metadata: Metadata = { title: "About" };

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
      <Skills biography={profile?.biography} skills={skills} tools={tools} />
      <Journey experiences={experiences} />
      <AboutCTA />
    </main>
  );
}
