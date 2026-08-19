import { Container } from "@/components/ui/Container";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { getFeaturedShowreel } from "@/lib/db/queries";

export async function ShowreelSection() {
  const showreel = await getFeaturedShowreel();
  if (!showreel?.videoUrl) return null;

  return (
    <section id="showreel" className="scroll-mt-24 py-20 md:py-28">
      <Container>
        <div className="mb-10 text-center">
          <p className="timecode mb-3">00:00:45:00 — SHOWREEL</p>
          <h2 className="font-display text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
            {showreel.title}
          </h2>
          {showreel.duration && (
            <p className="mt-2 text-sm text-[var(--color-muted)]">{showreel.duration}</p>
          )}
        </div>

        <div className="mx-auto aspect-video max-w-4xl overflow-hidden rounded-2xl">
          <VideoPlayer
            videoUrl={showreel.videoUrl}
            posterUrl={showreel.thumbnailUrl}
            title={showreel.title}
            className="h-full w-full"
          />
        </div>
      </Container>
    </section>
  );
}