import { Briefcase, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { schema } from "@/lib/db";

type Experience = typeof schema.experiences.$inferSelect;

type ExperienceHeroProps = {
  experiences: Experience[];
  eyebrow?: string;
  heading?: string;
  description?: string;
  heroImageUrl?: string | null;
  heroImageAlt?: string;
  currentRoleLabel?: string;
  locationLabel?: string;
  entriesLabel?: string;
  primaryLabel?: string;
  primaryUrl?: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
};

export function ExperienceHero(props: ExperienceHeroProps) {
  const {
    experiences,
    eyebrow = "Experience",
    heading = "Crafting stories through experience and precision.",
    description = "Over the years, I’ve worked across different industries and creative environments — sharpening my skills, understanding stories deeper, and delivering impactful edits.",
    heroImageUrl,
    heroImageAlt = "Professional video editing experience",
    currentRoleLabel = "Current role",
    locationLabel = "Location",
    entriesLabel = "Experience entries",
    primaryLabel = "View My Work",
    primaryUrl = "/portfolio",
    secondaryLabel = "Let’s Connect",
    secondaryUrl = "/contact",
  } = props;

  const current = experiences.find((experience) => experience.isCurrent || experience.endDate?.trim().toLowerCase() === "present");
  const first = experiences[experiences.length - 1];
  const firstStart = first?.startDate?.trim() || "—";
  const currentEnd = current?.endDate?.trim() || "Present";

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[var(--background-primary)] py-14 sm:py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_22%,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_88%_72%,rgba(59,130,246,0.08),transparent_30%)]" aria-hidden />

      <div className="relative mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12 2xl:px-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(28rem,1.08fr)] lg:gap-14 xl:gap-18">
          <div className="min-w-0">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">
              <span className="h-px w-10 bg-current" aria-hidden />
              {eyebrow}
            </p>

            <h1 className="mt-6 max-w-[13ch] text-balance font-display text-[clamp(2.75rem,5vw,5.25rem)] font-semibold leading-[0.96] tracking-[-0.052em] text-[var(--text-primary)]">
              {heading}
            </h1>

            <p className="mt-7 max-w-[38rem] whitespace-pre-line text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              {description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href={primaryUrl} variant="cine-solid" withArrow className="!rounded-md !px-7 !py-3.5">
                {primaryLabel}
              </Button>
              <Button href={secondaryUrl} variant="cine-outline" withArrow className="!rounded-md !px-7 !py-3.5">
                {secondaryLabel}
              </Button>
            </div>
          </div>

          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-md border border-white/10 bg-[var(--surface-primary)] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
              <div className="relative aspect-[16/11] min-h-[280px] sm:aspect-[16/9] lg:aspect-[16/11]">
                {heroImageUrl ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-[1.02] motion-reduce:transition-none"
                    style={{ backgroundImage: `url('${heroImageUrl}')` }}
                    role="img"
                    aria-label={heroImageAlt}
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(59,130,246,0.12),rgba(18,20,25,0.96)_55%,rgba(59,130,246,0.05))]" aria-hidden />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--background-primary)]/75 via-transparent to-transparent" aria-hidden />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)]/70 to-transparent" aria-hidden />
              </div>

              <div className="grid gap-px bg-white/10 sm:grid-cols-3">
                <div className="flex min-w-0 items-center gap-3 bg-[var(--surface-primary)] px-4 py-4 sm:px-5">
                  <Briefcase size={18} className="shrink-0 text-[var(--accent-primary)]" strokeWidth={1.6} aria-hidden />
                  <div className="min-w-0">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-readable,var(--text-muted))]">{currentRoleLabel}</p>
                    <p className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-[var(--text-primary)]">{current?.role ?? "—"}</p>
                  </div>
                </div>

                <div className="flex min-w-0 items-center gap-3 bg-[var(--surface-primary)] px-4 py-4 sm:px-5">
                  <MapPin size={18} className="shrink-0 text-[var(--accent-primary)]" strokeWidth={1.6} aria-hidden />
                  <div className="min-w-0">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-readable,var(--text-muted))]">{locationLabel}</p>
                    <p className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-[var(--text-primary)]">{current?.location ?? "—"}</p>
                  </div>
                </div>

                <div className="flex min-w-0 items-center gap-3 bg-[var(--surface-primary)] px-4 py-4 sm:px-5">
                  <CalendarDays size={18} className="shrink-0 text-[var(--accent-primary)]" strokeWidth={1.6} aria-hidden />
                  <div className="min-w-0">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-readable,var(--text-muted))]">{entriesLabel}</p>
                    <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{experiences.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-7 sm:mt-12 sm:pt-8 lg:mt-14">
          <div className="flex items-center justify-between gap-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-readable,var(--text-muted))] sm:text-xs">
            <span>{firstStart}</span>
            <span className="text-center text-[var(--accent-primary)]">Career timeline</span>
            <span>{currentEnd}</span>
          </div>
          <div className="relative mt-4 h-px bg-white/10">
            <span className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,var(--accent-primary),rgba(59,130,246,0.25))]" aria-hidden />
            <span className="absolute -top-1.5 left-0 size-3 rounded-full border border-[var(--accent-primary)] bg-[var(--background-primary)]" aria-hidden />
            <span className="absolute -top-1.5 right-0 size-3 rounded-full bg-[var(--accent-primary)] shadow-[0_0_0_5px_rgba(59,130,246,0.1)]" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
