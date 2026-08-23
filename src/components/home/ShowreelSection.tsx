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
          eyebrow="00:00:45:00 — SHOWREEL"
          title={showreel.title}
          description={showreel.duration ?? undefined}
          align="center"
          className="mx-auto mb-12"
        />

        <MediaFrame aspect="aspect-video" className="mx-auto max-w-4xl">
          <VideoPlayer
            videoUrl={showreel.videoUrl}
            posterUrl={showreel.thumbnailUrl}
            title={showreel.title}
            className="h-full w-full"
          />
        </MediaFrame>
      </Container>
    </Section>
  );
}
