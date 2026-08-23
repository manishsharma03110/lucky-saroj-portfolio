import { Quote } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { getPublishedTestimonials } from "@/lib/db/queries";

export async function TestimonialsPreview() {
  const testimonials = await getPublishedTestimonials(true);
  // Hide gracefully rather than showing placeholder/fake testimonials.
  if (testimonials.length === 0) return null;

  return (
    <Section spacing="lg" className="bg-[var(--cine-surface)]">
      <Container>
        <SectionHeading
          eyebrow="00:05:10:00 — TESTIMONIALS"
          title="What clients say"
          className="mb-14"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.id} hover={false} className="flex flex-col border-[var(--cine-border)] bg-[var(--cine-void)]">
              <Quote size={20} className="mb-4 text-[var(--cine-accent)]" />
              <blockquote className="cine-body flex-1 text-sm">
                &ldquo;{t.testimonialText}&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--cine-accent-soft)] text-sm font-semibold text-[var(--cine-accent)]">
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
