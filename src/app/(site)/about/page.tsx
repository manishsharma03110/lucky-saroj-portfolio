import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutStats } from "@/components/about/AboutStats";
import { Skills } from "@/components/about/Skills";
import { ExperienceTimeline } from "@/components/about/ExperienceTimeline";
import { CTA } from "@/components/home/CTA";
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
      <AboutHero headline={profile?.headline} biography={profile?.biography} />
      <AboutStats
        years={profile?.yearsExperience ?? 0}
        projects={profile?.projectsCompleted ?? 0}
        clients={profile?.clientCount ?? 0}
        views={profile?.viewsGenerated ?? "0"}
      />
      <Skills skills={skills} tools={tools} />
      <ExperienceTimeline experiences={experiences} compact />
      <CTA />
    </>
  );
}
