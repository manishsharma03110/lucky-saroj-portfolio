import { Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { getPublishedTestimonials } from "@/lib/db/queries";

export async function TestimonialsSection({ featuredOnly = true }: { featuredOnly?: boolean }) {
  const testimonials = await getPublishedTestimonials(featuredOnly);
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-[var(--color-paper-dim)] py-20 md:py-28">
      <Container>
        <div className="mb-12 text-center">
          <p className="timecode mb-3">TESTIMONIALS</p>
          <h2 className="font-display text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
            What clients say
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.id}
              className="flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-6"
            >
              <div className="mb-3 flex gap-1 text-[var(--color-accent)]">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                &ldquo;{t.testimonialText}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-soft)] font-display text-sm font-semibold text-[var(--color-accent)]">
                  {t.clientName.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-[var(--color-ink)]">
                    {t.clientName}
                  </span>
                  <span className="block text-xs text-[var(--color-muted)]">
                    {[t.designation, t.company].filter(Boolean).join(", ")}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
