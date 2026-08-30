import { VideoPlayer } from "@/components/ui/VideoPlayer";
import type { getFeaturedShowreel } from "@/lib/db/queries";

export function ShowreelSection({ showreel }: { showreel: Awaited<ReturnType<typeof getFeaturedShowreel>> }) {
  if (!showreel?.videoUrl) return null;

  return (
    <section id="showreel" className="scroll-mt-24 bg-[var(--background-primary)] py-16 md:py-20 lg:py-28">
      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
        <div className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.5fr)] lg:items-end lg:gap-12">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">Featured showreel</p>
            <h2 className="max-w-4xl font-display text-[clamp(2.25rem,4.5vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--text-primary)]">
              {showreel.title}
            </h2>
          </div>
          {showreel.duration && <p className="max-w-md text-sm uppercase tracking-[0.16em] text-[var(--text-muted)]">Runtime · {showreel.duration}</p>}
        </div>

        <div className="relative aspect-video overflow-hidden rounded-[10px] border border-white/10 bg-[var(--surface-primary)] shadow-[0_28px_90px_rgba(0,0,0,0.32)]">
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
