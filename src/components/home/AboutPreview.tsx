import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getAboutProfile } from "@/lib/db/queries";
import type { HomePageContent } from "@/lib/db/home-content-service";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatStoredMetric(value: string) {
  const numeric = Number(value.replace(/,/g, ""));
  return Number.isFinite(numeric) ? formatNumber(numeric) : value;
}

export async function AboutPreview({ content }: { content: HomePageContent }) {
  const profile = await getAboutProfile();
  if (!profile) return null;

  const stats = [
    { value: profile.yearsExperience > 0 ? formatNumber(profile.yearsExperience) : null, label: content.aboutStatYearsLabel },
    { value: profile.projectsCompleted > 0 ? formatNumber(profile.projectsCompleted) : null, label: content.aboutStatProjectsLabel },
    { value: profile.clientCount > 0 ? formatNumber(profile.clientCount) : null, label: content.aboutStatClientsLabel },
    { value: profile.viewsGenerated !== "0" ? formatStoredMetric(profile.viewsGenerated) : null, label: content.aboutStatViewsLabel },
  ].filter((stat): stat is { value: string; label: string } => Boolean(stat.value));

  return (
    <section className="overflow-hidden border-y border-white/10 bg-[var(--surface-primary)] py-16 md:py-20 lg:py-24 2xl:py-28">
      <div className="mx-auto grid w-full max-w-[1480px] items-center gap-9 px-5 sm:px-8 md:gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16 lg:px-12 2xl:gap-24 2xl:px-16">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[470px] overflow-hidden rounded-[10px] border border-white/10 bg-[var(--surface-elevated)] lg:mx-0">
          {profile.profileImageUrl ? (
            <div className="h-full w-full bg-cover bg-center grayscale-[15%]" style={{ backgroundImage: `url('${profile.profileImageUrl}')` }} role="img" aria-label={content.aboutProfileImageAlt || profile.name} />
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
          {profile.biography && <p className="mt-6 max-w-[620px] text-base leading-7 text-white/58 sm:text-[1.0625rem]">{profile.biography}</p>}
          {stats.length > 0 && <dl className="mt-8 grid grid-cols-2 border-y border-white/12 sm:grid-cols-4">{stats.map((stat) => <div key={stat.label} className="border-white/10 py-4 odd:border-r sm:border-r sm:px-5 sm:py-5 sm:first:pl-0 sm:last:border-r-0"><dd className="text-[1.75rem] font-semibold tracking-[-0.04em] text-[var(--accent-primary)] lg:text-3xl">{stat.value}</dd><dt className="mt-1 text-[0.7rem] uppercase tracking-[0.16em] text-[var(--text-secondary)]">{stat.label}</dt></div>)}</dl>}
          <Link href={content.aboutCtaUrl} className="mt-9 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)] transition-colors hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--surface-primary)]">{content.aboutCtaLabel}<ArrowUpRight size={17} aria-hidden /></Link>
        </div>
      </div>
    </section>
  );
}
