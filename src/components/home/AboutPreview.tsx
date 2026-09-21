import Image from "next/image";
import Link from "next/link";
import { CountUpStat } from "@/components/home/CountUpStat";
import { getAboutProfile } from "@/lib/db/queries";
import type { HomePageContent } from "@/lib/db/home-content-service";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function parseStoredMetric(value: string) {
  const normalized = value.replace(/,/g, "").trim();
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
}

export async function AboutPreview({ content }: { content: HomePageContent }) {
  const profile = await getAboutProfile();
  if (!profile) return null;

  const storedViews = profile.viewsGenerated !== "0" ? parseStoredMetric(profile.viewsGenerated) : null;
  const stats = [
    profile.yearsExperience > 0 ? { target: profile.yearsExperience, fallback: formatNumber(profile.yearsExperience), label: content.aboutStatYearsLabel } : null,
    profile.projectsCompleted > 0 ? { target: profile.projectsCompleted, fallback: formatNumber(profile.projectsCompleted), label: content.aboutStatProjectsLabel } : null,
    profile.clientCount > 0 ? { target: profile.clientCount, fallback: formatNumber(profile.clientCount), label: content.aboutStatClientsLabel } : null,
    profile.viewsGenerated !== "0" ? { target: storedViews, fallback: storedViews != null ? formatNumber(storedViews) : profile.viewsGenerated, label: content.aboutStatViewsLabel } : null,
  ].filter((stat): stat is { target: number | null; fallback: string; label: string } => stat !== null);

  return (
    <section className="overflow-hidden border-y border-white/10 bg-[var(--surface-primary)] py-16 md:py-20 lg:py-24 2xl:py-28">
      <div className="mx-auto grid w-full max-w-[1480px] items-center gap-9 px-5 sm:px-8 md:gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16 lg:px-12 2xl:gap-24 2xl:px-16">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[470px] overflow-hidden rounded-[10px] border border-white/10 bg-[var(--surface-elevated)] transition-transform duration-300 motion-safe:hover:-translate-y-1 lg:mx-0">
          {profile.profileImageUrl ? (
            <Image src={profile.profileImageUrl} alt={content.aboutProfileImageAlt || profile.name} fill sizes="(max-width: 1023px) min(100vw - 40px, 470px), 470px" className="object-cover object-center grayscale-[15%]" />
          ) : (
            <div className="relative flex h-full items-end bg-[radial-gradient(circle_at_62%_32%,var(--accent-glow),transparent_38%),linear-gradient(145deg,var(--surface-elevated)_0%,var(--background-primary)_78%)] p-7 sm:p-9">
              <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:64px_64px]" aria-hidden />
              <span className="absolute left-6 top-6 h-8 w-8 border-l border-t border-[var(--accent-primary)]/65" aria-hidden />
              <span className="absolute bottom-6 right-6 h-8 w-8 border-b border-r border-white/20" aria-hidden />
              <div className="relative">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">{content.aboutPortraitFallbackLabel}</p>
                <p className="mt-3 max-w-[12ch] font-display text-3xl font-semibold leading-tight tracking-[-0.04em] text-[var(--text-primary)]">{profile.name}</p>
                <span className="mt-5 block h-px w-20 bg-[var(--accent-primary)]/70" aria-hidden />
              </div>
            </div>
          )}
          <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)]/80 to-transparent" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">{content.aboutEyebrow}</p>
          <h2 className="mt-5 max-w-2xl text-[2.25rem] font-semibold leading-[1] tracking-[-0.045em] text-[var(--text-primary)] sm:text-4xl lg:text-5xl">{profile.headline ?? profile.name}</h2>
          {profile.biography && <p className="mt-6 max-w-[620px] text-base leading-7 text-[var(--text-secondary)] sm:text-[1.0625rem]">{profile.biography}</p>}
          {stats.length > 0 && <dl className="mt-8 grid grid-cols-2 border-y border-white/12 sm:grid-cols-4">{stats.map((stat) => <CountUpStat key={stat.label} target={stat.target} fallback={stat.fallback} label={stat.label} />)}</dl>}
          <Link href={content.aboutCtaUrl} className="group relative mt-9 inline-flex items-center gap-2 pb-1 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)] transition-colors hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--surface-primary)] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-[var(--accent-primary)] after:transition-transform after:duration-300 hover:after:scale-x-100"><span>{content.aboutCtaLabel}</span><span className="text-base leading-none transition-transform duration-300 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" aria-hidden>↗</span></Link>
        </div>
      </div>
    </section>
  );
}
