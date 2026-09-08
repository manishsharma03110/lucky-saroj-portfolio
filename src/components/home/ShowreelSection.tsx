import { VideoPlayer } from "@/components/ui/VideoPlayer";
import type { getFeaturedShowreel } from "@/lib/db/queries";

export function ShowreelSection({ showreel }: { showreel: Awaited<ReturnType<typeof getFeaturedShowreel>> }) {
  if (!showreel?.videoUrl) return null;

  return (
    <section id="showreel" className="relative scroll-mt-24 overflow-hidden bg-[var(--background-secondary)] py-16 md:py-20 lg:py-24 2xl:py-28">
      <div className="pointer-events-none absolute right-[-12rem] top-1/4 h-96 w-96 rounded-full bg-[var(--accent-glow)] opacity-60 blur-[140px]" aria-hidden />
      <div className="mx-auto w-full max-w-[1560px] px-5 sm:px-8 lg:px-12 2xl:px-16">
        <div className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.5fr)] lg:items-end lg:gap-12">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">Featured showreel</p>
            <h2 className="max-w-4xl font-display text-[clamp(2.25rem,4.5vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--text-primary)]">
              {showreel.title}
            </h2>
          </div>
          {showreel.duration && <p className="max-w-md text-sm uppercase tracking-[0.16em] text-[var(--text-muted)]">Runtime · {showreel.duration}</p>}
        </div>

        <div className="relative aspect-video overflow-hidden rounded-[12px] border border-white/12 bg-[var(--surface-primary)] shadow-[0_32px_110px_rgba(0,0,0,0.46)]">
          <VideoPlayer
            videoUrl={showreel.videoUrl}
            posterUrl={showreel.thumbnailUrl}
            title={showreel.title}
            className="h-full w-full"
          />
        </div>
      </div>
    </section>
  );
}
