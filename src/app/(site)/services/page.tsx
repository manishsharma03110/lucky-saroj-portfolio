import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { ProcessTimeline } from "@/components/services/ProcessTimeline";
import { TestimonialsSection } from "@/components/testimonials/TestimonialCard";
import { CTA } from "@/components/home/CTA";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <>
      <section className="py-16 md:py-20">
        <Container className="max-w-2xl">
          <p className="timecode mb-4">00:00:00:04 — SERVICES</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-[var(--color-ink)] sm:text-5xl">
            How I can help tell your story
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[var(--color-ink-soft)]">
            From YouTube documentaries to fast-paced social reels, I offer end-to-end
            post-production so you can focus on creating — I&rsquo;ll handle the edit.
          </p>
        </Container>
      </section>
      <ServicesPreview heading="What I Offer" />
      <ProcessTimeline />
      <TestimonialsSection />
      <CTA />
    </>
  );
}
