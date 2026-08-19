import { Play } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function Hero({
  heading,
  subheading,
  description,
}: {
  heading: string;
  subheading: string;
  description: string;
}) {
  return (
    <section className="relative overflow-hidden bg-[var(--color-paper)] pb-16 pt-16 md:pb-24 md:pt-20">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="timecode mb-5">HI, I&rsquo;M</p>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-[var(--color-ink)] sm:text-6xl lg:text-7xl">
            {heading}
          </h1>
          <p className="mt-5 font-display text-lg font-semibold uppercase tracking-wide text-[var(--color-accent)] sm:text-xl">
            {subheading}
          </p>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--color-ink-soft)]">
            {description}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button href="/portfolio">View My Work</Button>
            <Button href="#showreel" variant="secondary" className="gap-2">
              <Play size={16} /> Watch Showreel
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[var(--color-ink)]">
            <div
              className="h-full w-full bg-cover bg-center opacity-90"
              style={{
                backgroundImage:
                  "url('https://raw.githubusercontent.com/manishsharma03110/lucky-saroj-portfolio/refs/heads/main/public/uploads/HomePage/Video%20Editor%20Banner.png')",
              }}
              role="img"
              aria-label="Lucky Saroj, video editor, behind the camera"
            />
          </div>
          <a
            href="#showreel"
            className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white/95 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink)] shadow-lg backdrop-blur transition-transform hover:scale-105"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-white">
              <Play size={14} fill="currentColor" />
            </span>
            Play Showreel
          </a>
        </div>
      </Container>
    </section>
  );
}
