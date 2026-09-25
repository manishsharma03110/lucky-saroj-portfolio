import { Play } from "lucide-react";
import { VideoLaunchSurface } from "@/components/ui/VideoLaunchSurface";
import type { getFeaturedShowreel } from "@/lib/db/queries";
import type { HomePageContent } from "@/lib/db/home-content-service";

export function ShowreelSection({ showreel, content }: { showreel: Awaited<ReturnType<typeof getFeaturedShowreel>>; content: HomePageContent }) {
  if (!showreel?.videoUrl) return null;

  return (
    <section id="showreel" className="relative scroll-mt-24 overflow-hidden bg-[var(--background-secondary)] py-16 md:py-20 lg:py-24 2xl:py-28">
      <div className="pointer-events-none absolute right-[-12rem] top-1/4 h-96 w-96 rounded-full bg-[var(--accent-glow)] opacity-60 blur-[140px]" aria-hidden />
      <div className="mx-auto w-full max-w-[1560px] px-5 sm:px-8 lg:px-12 2xl:px-16">
        <div className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.5fr)] lg:items-end lg:gap-12">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">{content.showreelEyebrow}</p>
            <h2 className="max-w-4xl font-display text-[clamp(2.25rem,4.5vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--text-primary)]">{showreel.title}</h2>
          </div>
          {showreel.duration && <p className="max-w-md text-sm uppercase tracking-[0.16em] text-[var(--text-readable, var(--text-muted))]">{content.showreelRuntimeLabel} · {showreel.duration}</p>}
        </div>

        <VideoLaunchSurface
          videoUrl={showreel.videoUrl}
          posterUrl={showreel.thumbnailUrl}
          title={showreel.title}
          orientation="auto"
          className="group relative aspect-video w-full overflow-hidden rounded-[12px] border border-white/12 bg-[var(--surface-primary)] shadow-[0_32px_110px_rgba(0,0,0,0.46)]"
        >
          {showreel.thumbnailUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-[1.01]"
              style={{ backgroundImage: `url('${showreel.thumbnailUrl}')` }}
              role="img"
              aria-label={`${showreel.title} showreel poster`}
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_30%,var(--accent-glow),transparent_34%),linear-gradient(145deg,var(--surface-elevated),var(--background-primary))]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" aria-hidden />
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/65 text-white shadow-[0_18px_55px_rgba(0,0,0,.45)] backdrop-blur-md transition-transform duration-300 group-hover:scale-105 sm:h-20 sm:w-20">
            <Play size={26} fill="currentColor" className="ml-1" />
          </span>
          <span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-md sm:bottom-5 sm:left-5">Play fullscreen</span>
        </VideoLaunchSurface>
      </div>
    </section>
  );
}
