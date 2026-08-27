import { ArrowDown, Play } from "lucide-react";
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
    <section className="relative min-h-[94vh] overflow-hidden bg-[var(--cine-void)]">
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
          <div
            className="h-full w-full opacity-90"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 60% 50% at 78% 15%, rgba(226,130,61,0.14), transparent 60%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(255,255,255,0.05), transparent 60%), repeating-linear-gradient(115deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--cine-void)] via-[var(--cine-void)]/75 to-[var(--cine-void)]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--cine-void)]/40 via-transparent to-transparent" />
        {/* Header (shared across all public pages) uses a slightly different
            near-black value than the cinematic --cine-void tokens. Rather
            than touching the shared Header, blend the seam away from this
            side: fade from Header's exact color into --cine-void over the
            first ~120px, so the transition from nav into hero is invisible
            instead of a hard color cut. */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--color-ink)] to-transparent" />
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

      <Container className="relative flex min-h-[94vh] flex-col justify-center py-28">
        <Eyebrow marker="rec" className="mb-7">
          00:00:00:01 — INTRO
        </Eyebrow>

        <h1 className="cine-display max-w-5xl text-6xl text-[var(--cine-text-primary)] sm:text-8xl lg:text-[7.5rem] lg:leading-[0.95]">
          {heading}
        </h1>

        <p className="cine-eyebrow mt-7 !text-base !tracking-[0.14em] !text-[var(--cine-accent)] sm:!text-lg">
          {subheading}
        </p>

        {description && (
          <p className="cine-body mt-4 max-w-lg text-sm sm:text-base">{description}</p>
        )}

        <div className="mt-11 flex flex-wrap items-center gap-4">
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
        <ArrowDown size={14} />
      </div>
    </section>
  );
}
