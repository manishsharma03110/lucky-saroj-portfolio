export function PortfolioHero({ projectCount, categoryName, eyebrow = "Selected work", heading = "Stories shaped to hold attention.", description = "Editing work across formats, built around clarity, pacing, and the moments that make a story land." }: { projectCount: number; categoryName?: string; eyebrow?: string; heading?: string; description?: string }) {
  const currentFilter = categoryName ?? "All Work";

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[var(--background-primary)] py-14 sm:py-16 lg:flex lg:min-h-[30rem] lg:items-center lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_48%,var(--accent-glow),transparent_34%)] opacity-70" aria-hidden />

      <div className="relative mx-auto grid w-full max-w-[1480px] gap-10 px-5 sm:px-8 md:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.75fr)] md:items-end md:gap-12 lg:px-12 xl:gap-16 2xl:px-16">
        <div>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]"><span className="h-px w-10 bg-current" aria-hidden />{eyebrow}</p>
          <h1 className="mt-6 max-w-[13ch] text-balance font-display text-[clamp(2.75rem,5vw,5.25rem)] font-semibold leading-[0.96] tracking-[-0.052em] text-[var(--text-primary)]">{heading}</h1>
        </div>

        <div className="border-l border-[var(--accent-primary)]/55 pl-5 sm:pl-7 lg:pl-9">
          <p className="max-w-[38rem] text-base leading-8 text-[var(--text-secondary)] sm:text-lg">{description}</p>
          <dl className="mt-7 grid max-w-md grid-cols-2 gap-6 border-t border-white/10 pt-6">
            <div className="min-w-0"><dd className="font-display text-2xl font-semibold leading-none text-[var(--text-primary)]">{projectCount}</dd><dt className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">{projectCount === 1 ? "Project" : "Projects"}</dt></div>
            <div className="min-w-0 border-l border-white/10 pl-6"><dd className="break-words font-display text-xl font-semibold leading-none text-[var(--text-primary)]">{currentFilter}</dd><dt className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">Current filter</dt></div>
          </dl>
        </div>
      </div>
    </section>
  );
}
