import { ArrowRight, Play } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionHeading";

export function Hero({
  heading,
  subheading,
  description,
  heroImageUrl,
}: {
  heading: string;
  subheading: string;
  description: string;
  heroImageUrl?: string | null;
}) {
  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-[var(--cine-void)]">
      {/* Media layer — reuses the CMS hero image when the site owner has set
          one; otherwise falls back to a purposeful abstract cinematic panel
          rather than inventing a stock photo/video asset. */}
      <div className="absolute inset-0">
        {heroImageUrl ? (
          <div
            className="h-full w-full bg-cover bg-center opacity-60"
            style={{ backgroundImage: `url('${heroImageUrl}')` }}
            role="img"
            aria-label={heading}
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_top_right,_rgba(226,130,61,0.10),_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.04),_transparent_50%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--cine-void)] via-[var(--cine-void)]/70 to-[var(--cine-void)]/30" />
      </div>

      {/* Subtle video-editor chrome — corners, never dominant */}
      <div className="pointer-events-none absolute inset-6 hidden sm:block" aria-hidden>
        <div className="absolute left-0 top-0 flex items-center gap-2 text-[var(--cine-text-tertiary)]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
          <span className="cine-eyebrow !text-[var(--cine-text-tertiary)]">REC</span>
        </div>
        <p className="absolute right-0 top-0 cine-eyebrow !text-[var(--cine-text-tertiary)]">
          PROJECT_001
        </p>
        <p className="absolute bottom-0 left-0 cine-eyebrow !text-[var(--cine-text-tertiary)]">
          00:00:00:01
        </p>
        <p className="absolute bottom-0 right-0 cine-eyebrow !text-[var(--cine-text-tertiary)]">
          FRAME 001
        </p>
      </div>

      <Container className="relative flex min-h-[92vh] flex-col justify-center py-28">
        <Eyebrow marker="rec" className="mb-6">
          VIDEO EDITOR — VISUAL STORYTELLER
        </Eyebrow>

        <h1 className="cine-display max-w-4xl text-6xl text-[var(--cine-text-primary)] sm:text-7xl lg:text-8xl">
          {heading}
        </h1>

        <p className="mt-6 max-w-xl text-lg text-[var(--cine-text-secondary)] sm:text-xl">
          {subheading}
        </p>

        {description && (
          <p className="cine-body mt-4 max-w-lg text-sm sm:text-base">{description}</p>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button href="/portfolio" variant="cine-solid" withArrow className="!rounded-md !px-7 !py-3.5">
            View My Work
          </Button>
          <Button href="#showreel" variant="cine-outline" className="!rounded-md !px-7 !py-3.5 gap-2">
            <Play size={15} fill="currentColor" /> Watch Showreel
          </Button>
        </div>
      </Container>

      <div className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[var(--cine-text-tertiary)] sm:flex" aria-hidden>
        <span className="cine-eyebrow !text-[var(--cine-text-tertiary)]">SCROLL</span>
        <ArrowRight size={14} className="rotate-90" />
      </div>
    </section>
  );
}
