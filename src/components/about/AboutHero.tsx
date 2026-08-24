import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { MediaFrame } from "@/components/ui/MediaFrame";

export function AboutHero({
  name,
  headline,
  biography,
  profileImageUrl,
}: {
  name: string;
  headline?: string | null;
  biography?: string | null;
  profileImageUrl?: string | null;
}) {
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <Section spacing="lg" className="bg-[var(--cine-void)]">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <MediaFrame aspect="aspect-[4/5]" showCorners={false} className="max-w-sm lg:max-w-none">
          {profileImageUrl ? (
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url('${profileImageUrl}')` }}
              role="img"
              aria-label={name}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[linear-gradient(155deg,var(--cine-surface)_0%,var(--cine-surface-2)_100%)]">
              <span className="cine-display select-none text-[8rem] leading-none text-[var(--cine-text-tertiary)]" aria-hidden>
                {initial}
              </span>
              <span className="h-px w-10 bg-[var(--cine-accent)]" aria-hidden />
            </div>
          )}
        </MediaFrame>

        <div>
          <Eyebrow marker="rec" className="mb-6">
            00:00:00:02 — ABOUT ME
          </Eyebrow>

          <h1 className="cine-display text-4xl leading-tight text-[var(--cine-text-primary)] sm:text-5xl lg:text-6xl">
            {headline}
          </h1>

          {biography && (
            <p className="cine-body mt-6 max-w-lg text-base leading-relaxed sm:text-lg">
              {biography}
            </p>
          )}

          <p className="cine-eyebrow mt-8 !text-base !normal-case !tracking-normal !text-[var(--cine-text-primary)]">
            — {name}
          </p>
        </div>
      </Container>
    </Section>
  );
}
