import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutStats } from "@/components/about/AboutStats";
import { Skills } from "@/components/about/Skills";
import { Journey } from "@/components/about/Journey";
import { AboutCTA } from "@/components/about/AboutCTA";
import { getAboutProfile, getAboutSkills, getAboutTools, getExperiences } from "@/lib/db/queries";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const [profile, skills, tools, experiences] = await Promise.all([
    getAboutProfile(),
    getAboutSkills(),
    getAboutTools(),
    getExperiences(),
  ]);

  return (
    <>
      <AboutHero
        name={profile?.name ?? "Lucky Saroj"}
        headline={profile?.headline}
        biography={profile?.biography}
        profileImageUrl={profile?.profileImageUrl}
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
    </>
  );
}
