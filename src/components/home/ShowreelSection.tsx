import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { getFeaturedShowreel } from "@/lib/db/queries";

export async function ShowreelSection() {
  const showreel = await getFeaturedShowreel();
  // Gracefully hide rather than showing broken/empty content, exactly as
  // the previous implementation did — behavior unchanged, styling updated.
  if (!showreel?.videoUrl) return null;

  return (
    <Section id="showreel" spacing="lg" className="scroll-mt-24 bg-[var(--cine-void)]">
      <Container>
        <SectionHeading
          eyebrow="00:00:45:00 — FEATURED SHOWREEL"
          title={showreel.title}
          align="center"
          className="mx-auto mb-12"
        />

        <div className="relative mx-auto max-w-5xl">
          {/* Faint accent glow behind the frame — grounds the video as the
              visual centerpiece of the section without adding a literal
              gradient inside the media itself. */}
          <div
            className="pointer-events-none absolute -inset-8 -z-10 opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(226,130,61,0.18), transparent 65%)",
            }}
            aria-hidden
          />

          <MediaFrame
            aspect="aspect-video"
            overlay={
              showreel.duration ? (
                <span className="cine-eyebrow absolute bottom-4 right-4 rounded-sm border border-white/20 bg-black/50 px-2 py-1 !text-white backdrop-blur-sm">
                  {showreel.duration}
                </span>
              ) : undefined
            }
          >
            <VideoPlayer
              videoUrl={showreel.videoUrl}
              posterUrl={showreel.thumbnailUrl}
              title={showreel.title}
              className="h-full w-full"
            />
          </MediaFrame>
        </div>
      </Container>
    </Section>
  );
}
