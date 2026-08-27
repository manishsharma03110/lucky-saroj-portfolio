import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { ProcessTimeline } from "@/components/services/ProcessTimeline";
import { ServicesTestimonials } from "@/components/services/ServicesTestimonials";
import { ServicesCTA } from "@/components/services/ServicesCTA";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <>
      <Section spacing="md" className="bg-[var(--cine-void)]">
        <Container className="max-w-2xl">
          <Eyebrow marker="rec" className="mb-6">
            00:00:00:04 — SERVICES
          </Eyebrow>
          <h1 className="cine-display text-4xl leading-tight text-[var(--cine-text-primary)] sm:text-5xl">
            How I can help tell your story
          </h1>
          <p className="cine-body mt-5 text-base sm:text-lg">
            From YouTube documentaries to fast-paced social reels, I offer
            end-to-end post-production so you can focus on creating —
            I&rsquo;ll handle the edit.
          </p>
        </Container>
      </Section>
      <ServicesPreview />
      <ProcessTimeline />
      <ServicesTestimonials />
      <ServicesCTA />
    </>
  );
}
