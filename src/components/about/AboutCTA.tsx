import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function AboutCTA() {
  return (
    <section className="relative overflow-hidden bg-[var(--background-primary)] py-12 sm:py-14 lg:py-14">
      <div className="pointer-events-none absolute bottom-0 right-[8%] h-72 w-72 rounded-full bg-[var(--accent-primary)]/[0.06] blur-3xl" aria-hidden />
      <div className="relative mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12">
        <div className="grid items-end gap-8 border-l border-[var(--accent-primary)]/55 pl-6 sm:pl-9 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
          <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">Next chapter</p><h2 className="mt-5 max-w-3xl font-display text-[clamp(2rem,3vw,3.4rem)] font-semibold leading-[1] tracking-[-0.045em] text-[var(--text-primary)]">Bring the next story into focus.</h2><p className="mt-5 max-w-xl text-base leading-7 text-[var(--text-secondary)]">Explore the work or start a conversation about your project.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end"><Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[var(--accent-primary)] px-6 py-3 text-sm font-semibold text-[var(--background-primary)] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background-primary)]">Start a conversation <ArrowUpRight size={16} aria-hidden /></Link><Link href="/portfolio" className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/20 px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--accent-primary)] hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]">View portfolio</Link></div>
        </div>
      </div>
    </section>
  );
}
