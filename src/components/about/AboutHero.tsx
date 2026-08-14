import { Container } from "@/components/ui/Container";

export function AboutHero({
  headline,
  biography,
}: {
  headline?: string | null;
  biography?: string | null;
}) {
  return (
    <section className="py-16 md:py-20">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="timecode mb-4">00:00:00:02 — ABOUT ME</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-[var(--color-ink)] sm:text-5xl">
            {headline}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-[var(--color-ink-soft)]">
            {biography}
          </p>
          <p className="mt-6 font-display text-lg italic text-[var(--color-accent)]">
            Lucky Saroj
          </p>
        </div>
        <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[var(--color-ink)]">
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1200&auto=format&fit=crop')",
            }}
            role="img"
            aria-label="Lucky Saroj portrait"
          />
        </div>
      </Container>
    </section>
  );
}
