import { Hero } from "@/components/home/Hero";
import { SkillsMarquee } from "@/components/home/SkillsMarquee";
import { SelectedWork } from "@/components/home/SelectedWork";
import { EditingStyles } from "@/components/home/EditingStyles";
import { ShowreelSection } from "@/components/home/ShowreelSection";
import { WhyWorkWithMe } from "@/components/home/WhyWorkWithMe";
import { Process } from "@/components/home/Process";
import { AboutPreview } from "@/components/home/AboutPreview";
import { TestimonialsPreview } from "@/components/home/TestimonialsPreview";
import { FinalCTA } from "@/components/home/FinalCTA";
import { getSiteSettings } from "@/lib/db/queries";

export default async function HomePage() {
  const settings = await getSiteSettings();

  return (
    <>
      <Hero
        heading={settings?.heroHeading ?? "LUCKY SAROJ"}
        subheading={settings?.heroSubheading ?? "VIDEO EDITOR & VISUAL STORYTELLER"}
        description={settings?.heroDescription ?? ""}
        heroImageUrl={settings?.heroImageUrl}
      />
      <SkillsMarquee />
      <SelectedWork />
      <EditingStyles />
      <ShowreelSection />
      <WhyWorkWithMe />
      <Process />
      <AboutPreview />
      <TestimonialsPreview />
      <FinalCTA />
    </>
  );
}
