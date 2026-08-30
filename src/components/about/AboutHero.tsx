import { ArrowDownRight, MapPin } from "lucide-react";
import Link from "next/link";

export function AboutHero({
  name,
  headline,
  biography,
  profileImageUrl,
  location,
  availability,
}: {
  name: string;
  headline?: string | null;
  biography?: string | null;
  profileImageUrl?: string | null;
  location?: string | null;
  availability?: string | null;
}) {
  const heroImageUrl = profileImageUrl || "/uploads/About/about-hero-editor.png";

  return (
    <section className="relative border-b border-white/10 py-12 sm:py-14 lg:py-[4.5rem]">
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:88px_88px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" aria-hidden />
      <div className="relative mx-auto grid w-full max-w-[1280px] items-center gap-9 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(440px,1.12fr)] lg:gap-12 lg:px-12">
        <div>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]"><span className="h-px w-9 bg-current" aria-hidden />About the editor</p>
          {name && <p className="mt-8 text-sm font-medium uppercase tracking-[0.16em] text-[var(--text-secondary)]">{name}</p>}
          {headline && <h1 className="mt-4 max-w-[13ch] font-display text-[clamp(2.75rem,4.25vw,4.5rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-[var(--text-primary)]">{headline}</h1>}
          {biography && <p className="mt-7 max-w-[680px] text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">{biography}</p>}

          {(location || availability) && (
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 border-y border-white/10 py-4 text-sm text-[var(--text-secondary)]">
              {location && <span className="flex items-center gap-2"><MapPin size={14} className="text-[var(--accent-primary)]" aria-hidden />{location}</span>}
              {availability && <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" aria-hidden />{availability}</span>}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/portfolio" className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[var(--accent-primary)] px-6 py-3 text-sm font-semibold text-[var(--background-primary)] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background-primary)]">View portfolio <ArrowDownRight size={16} aria-hidden /></Link>
            <Link href="/contact" className="inline-flex min-h-12 items-center rounded-md border border-white/20 px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--accent-primary)] hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background-primary)]">Start a conversation</Link>
          </div>
        </div>

        <div className="mx-auto w-full lg:mx-0">
          <div className="relative aspect-[16/11] overflow-hidden rounded-[8px] border border-white/10 bg-[var(--surface-primary)] sm:aspect-[16/10] lg:aspect-[16/11]">
            <div className="h-full w-full bg-cover bg-[position:52%_center] transition-transform duration-700 hover:scale-[1.02] motion-reduce:transition-none" style={{ backgroundImage: `url('${heroImageUrl}')` }} role="img" aria-label="Video editor working at a computer" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--background-primary)]/35 via-transparent to-transparent" aria-hidden />
            <span className="absolute left-5 top-5 h-8 w-8 border-l border-t border-[var(--accent-primary)]/65" aria-hidden />
            <span className="absolute bottom-5 right-5 h-8 w-8 border-b border-r border-white/25" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
