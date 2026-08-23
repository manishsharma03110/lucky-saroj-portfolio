import { Film } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { getAboutProfile } from "@/lib/db/queries";

export async function AboutPreview() {
  const profile = await getAboutProfile();
  if (!profile) return null;

  // Stats are only shown when the CMS actually has non-zero values — these
  // come straight from the admin-editable `about_profile` table, never
  // fabricated here.
  const stats = [
    { value: profile.yearsExperience > 0 ? `${profile.yearsExperience}+` : null, label: "Years" },
    { value: profile.projectsCompleted > 0 ? `${profile.projectsCompleted}+` : null, label: "Projects" },
    { value: profile.clientCount > 0 ? `${profile.clientCount}+` : null, label: "Clients" },
  ].filter((s) => s.value);

  return (
    <Section spacing="lg" className="bg-[var(--cine-void)]">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <MediaFrame aspect="aspect-[4/5]" showCorners={false}>
          {profile.profileImageUrl ? (
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url('${profile.profileImageUrl}')` }}
              role="img"
              aria-label={profile.name}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--cine-surface)] text-[var(--cine-text-tertiary)]">
              <Film size={40} strokeWidth={1.25} />
            </div>
          )}
        </MediaFrame>

        <div>
          <Eyebrow className="mb-5">00:04:40:00 — ABOUT</Eyebrow>
          <h2 className="cine-display text-3xl text-[var(--cine-text-primary)] sm:text-4xl">
            {profile.headline ?? profile.name}
          </h2>
          {profile.biography && (
            <p className="cine-body mt-5 max-w-lg text-base">{profile.biography}</p>
          )}

          {stats.length > 0 && (
            <div className="mt-8 flex gap-10">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="cine-display text-2xl text-[var(--cine-accent)]">{s.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-[var(--cine-text-tertiary)]">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Button href="/about" variant="cine-outline" withArrow className="!rounded-md mt-9">
            More About Me
          </Button>
        </div>
      </Container>
    </Section>
  );
}
