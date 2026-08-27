import { Quote } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { getPublishedTestimonials } from "@/lib/db/queries";

/**
 * Services-page-only testimonials section. Deliberately a fresh component
 * rather than reusing `TestimonialCard.tsx` (which was previously shared
 * with Home) or the Home page's `TestimonialsPreview.tsx`, so those two can
 * change independently later without affecting this one. Shows all real
 * published testimonials (not just featured), giving Services page a wider
 * sample than Home's featured-only carousel — all real CMS data, nothing
 * invented.
 */
export async function ServicesTestimonials() {
  const testimonials = await getPublishedTestimonials(false);
  if (testimonials.length === 0) return null;

  return (
    <Section spacing="md" className="bg-[var(--cine-void)]">
      <Container>
        <SectionHeading
          eyebrow="00:03:00:00 — CLIENT FEEDBACK"
          title="What people say"
          className="mb-14"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {testimonials.map((t) => (
            <Card
              key={t.id}
              hover={false}
              className="flex flex-col gap-6 border-[var(--cine-border)] bg-[var(--cine-surface)] p-7"
            >
              <Quote size={22} className="text-[var(--cine-accent)]" />
              <blockquote className="cine-body flex-1 text-[0.95rem] leading-relaxed">
                &ldquo;{t.testimonialText}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3 border-t border-[var(--cine-border)] pt-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--cine-accent-soft)] text-sm font-semibold text-[var(--cine-accent)]">
                  {t.clientName.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-medium text-[var(--cine-text-primary)]">
                    {t.clientName}
                  </span>
                  <span className="block text-xs text-[var(--cine-text-tertiary)]">
                    {[t.designation, t.company].filter(Boolean).join(", ")}
                  </span>
                </span>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
