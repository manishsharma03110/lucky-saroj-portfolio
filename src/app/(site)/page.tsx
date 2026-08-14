import { Hero } from "@/components/home/Hero";
import { ValueStrip } from "@/components/home/ValueStrip";
import { SelectedWork } from "@/components/home/SelectedWork";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { TestimonialsSection } from "@/components/testimonials/TestimonialCard";
import { CTA } from "@/components/home/CTA";
import { getSiteSettings } from "@/lib/db/queries";

export default async function HomePage() {
  const settings = await getSiteSettings();

  return (
    <>
      <Hero
        heading={settings?.heroHeading ?? "LUCKY SAROJ"}
        subheading={settings?.heroSubheading ?? "VIDEO EDITOR & VISUAL STORYTELLER"}
        description={settings?.heroDescription ?? ""}
      />
      <ValueStrip />
      <SelectedWork />
      <ServicesPreview />
      <TestimonialsSection />
      <CTA />
    </>
  );
}
