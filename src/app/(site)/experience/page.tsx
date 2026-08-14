import type { Metadata } from "next";
import { ExperienceTimeline } from "@/components/about/ExperienceTimeline";
import { CTA } from "@/components/home/CTA";
import { getExperiences } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Experience" };

export default async function ExperiencePage() {
  const experiences = await getExperiences();

  return (
    <>
      <ExperienceTimeline
        experiences={experiences}
        eyebrow="00:00:00:03 — EXPERIENCE"
        heading="My Professional Journey"
      />
      <CTA />
    </>
  );
}
