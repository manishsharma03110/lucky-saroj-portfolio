import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function AboutCTA({ eyebrow = "Next chapter", heading = "Bring the next story into focus.", description = "Explore the work or start a conversation about your project.", primaryLabel = "Start a conversation", primaryUrl = "/contact", secondaryLabel = "View portfolio", secondaryUrl = "/portfolio" }: { eyebrow?: string; heading?: string; description?: string; primaryLabel?: string; primaryUrl?: string; secondaryLabel?: string; secondaryUrl?: string }) {
  return (
    <section className="relative overflow-hidden bg-[var(--background-primary)] py-14 sm:py-16 lg:py-24">
      <div className="pointer-events-none absolute bottom-0 right-[8%] h-72 w-72 rounded-full bg-[var(--accent-primary)]/[0.06] blur-3xl" aria-hidden />
      <div className="relative mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12 2xl:px-16">
        <div className="grid items-end gap-8 border-l border-[var(--accent-primary)]/55 pl-6 sm:pl-9 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
          <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">{eyebrow}</p><h2 className="mt-4 max-w-[14ch] font-display text-[clamp(2.25rem,3.2vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-[var(--text-primary)]">{heading}</h2><p className="mt-5 max-w-[38rem] text-base leading-7 text-[var(--text-secondary)]">{description}</p></div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end"><Link href={primaryUrl} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[var(--accent-primary)] px-7 py-3.5 text-sm font-semibold text-[var(--background-primary)] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background-primary)]">{primaryLabel} <ArrowUpRight size={16} aria-hidden /></Link><Link href={secondaryUrl} className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/20 px-7 py-3.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--accent-primary)] hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]">{secondaryLabel}</Link></div>
        </div>
      </div>
    </section>
  );
}
