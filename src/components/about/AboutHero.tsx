import { ArrowDownRight, MapPin } from "lucide-react";
import Link from "next/link";

export function AboutHero({
  name,
  headline,
  biography,
  profileImageUrl,
  location,
  availability,
  eyebrow = "About the editor",
  primaryLabel = "View portfolio",
  primaryUrl = "/portfolio",
  secondaryLabel = "Start a conversation",
  secondaryUrl = "/contact",
}: {
  name: string;
  headline?: string | null;
  biography?: string | null;
  profileImageUrl?: string | null;
  location?: string | null;
  availability?: string | null;
  eyebrow?: string;
  primaryLabel?: string;
  primaryUrl?: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
}) {
  const heroImageUrl = profileImageUrl || "/uploads/About/about-hero-editor.png";

  return (
    <section className="relative overflow-hidden border-b border-white/10 py-14 sm:py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_48%,var(--accent-glow),transparent_32%)] opacity-55" aria-hidden />
      <div className="relative mx-auto grid w-full max-w-[1480px] items-center gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(28rem,1.14fr)] lg:gap-16 lg:px-12 2xl:gap-20 2xl:px-16">
        <div>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]"><span className="h-px w-10 bg-current" aria-hidden />{eyebrow}</p>
          {name && <p className="mt-7 text-sm font-medium uppercase tracking-[0.16em] text-[var(--text-secondary)]">{name}</p>}
          {headline && <h1 className="mt-4 max-w-[13ch] text-balance font-display text-[clamp(2.75rem,5vw,5.25rem)] font-semibold leading-[0.96] tracking-[-0.052em] text-[var(--text-primary)]">{headline}</h1>}
          {biography && <p className="mt-7 max-w-[38rem] whitespace-pre-line text-base leading-8 text-[var(--text-secondary)] sm:text-lg">{biography}</p>}

          {(location || availability) && (
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 border-y border-white/10 py-4 text-sm text-[var(--text-secondary)]">
              {location && <span className="flex items-center gap-2"><MapPin size={14} className="text-[var(--accent-primary)]" aria-hidden />{location}</span>}
              {availability && <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" aria-hidden />{availability}</span>}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={primaryUrl} className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[var(--accent-primary)] px-7 py-3.5 text-sm font-semibold text-[var(--background-primary)] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background-primary)]">{primaryLabel} <ArrowDownRight size={16} aria-hidden /></Link>
            <Link href={secondaryUrl} className="inline-flex min-h-12 items-center rounded-md border border-white/20 px-7 py-3.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--accent-primary)] hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background-primary)]">{secondaryLabel}</Link>
          </div>
        </div>

        <div className="mx-auto w-full lg:mx-0">
          <div className="relative aspect-[16/11] overflow-hidden rounded-md border border-white/10 bg-[var(--surface-primary)] sm:aspect-[16/10] lg:aspect-[16/11]">
            <div className="h-full w-full bg-cover bg-[position:52%_center] transition-transform duration-700 hover:scale-[1.02] motion-reduce:transition-none" style={{ backgroundImage: `url('${heroImageUrl}')` }} role="img" aria-label={name ? `${name}, video editor` : "Video editor working at a computer"} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--background-primary)]/35 via-transparent to-transparent" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
