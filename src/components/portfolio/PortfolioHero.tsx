import { FolderOpen, LayoutGrid } from "lucide-react";

export function PortfolioHero({ projectCount, categoryName }: { projectCount: number; categoryName?: string }) {
  const currentFilter = categoryName ?? "All Work";

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[var(--background-primary)] py-14 sm:py-20 lg:flex lg:min-h-[35rem] lg:items-center lg:py-24 xl:min-h-[37rem] xl:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:76px_76px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_56%,rgba(59,130,246,0.25),transparent_30%),linear-gradient(90deg,rgba(8,9,11,0.08),rgba(8,9,11,0.72)_42%,rgba(8,9,11,0.96)_100%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute left-5 top-8 h-9 w-9 border-l border-t border-[var(--accent-primary)]/80 sm:left-8 sm:top-10 lg:left-12" aria-hidden />
      <div className="pointer-events-none absolute bottom-8 right-5 h-9 w-9 border-b border-r border-[var(--accent-primary)]/80 sm:bottom-10 sm:right-8 lg:right-12" aria-hidden />

      <div className="relative mx-auto grid w-full max-w-[1280px] gap-12 px-5 sm:px-8 md:grid-cols-[minmax(0,1.5fr)_minmax(16rem,1fr)] md:items-center md:gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(20rem,1fr)] lg:gap-16 lg:px-12 xl:gap-20">
        <div>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">
            <span className="h-px w-10 bg-current" aria-hidden />
            Selected work
          </p>
          <h1 className="mt-7 max-w-[12ch] font-display text-[clamp(2.5rem,5.4vw,5rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-[var(--text-primary)] sm:mt-8">
            Stories shaped to<br className="hidden lg:block" /> hold attention.
          </h1>
        </div>

        <div className="border-l border-[var(--accent-primary)]/70 pl-5 sm:pl-7 lg:pl-10">
          <p className="max-w-sm text-base leading-7 text-[var(--text-secondary)] lg:text-lg lg:leading-8">
            Editing work across formats, built around clarity, pacing, and the moments that make a story land.
          </p>
          <dl className="mt-9 grid max-w-sm grid-cols-2 divide-x divide-white/10">
            <div className="flex min-w-0 items-center gap-4 pr-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-white/5 bg-white/[0.055] text-[var(--accent-primary)]">
                <FolderOpen size={22} strokeWidth={1.7} aria-hidden />
              </span>
              <div className="min-w-0">
                <dd className="font-display text-2xl font-semibold leading-none text-[var(--text-primary)]">{projectCount}</dd>
                <dt className="mt-2 text-sm text-[var(--text-secondary)]">{projectCount === 1 ? "Project" : "Projects"}</dt>
              </div>
            </div>
            <div className="flex min-w-0 items-center gap-4 pl-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-white/5 bg-white/[0.055] text-[var(--accent-primary)]">
                <LayoutGrid size={21} strokeWidth={1.7} aria-hidden />
              </span>
              <div className="min-w-0">
                <dd className="truncate font-display text-xl font-semibold leading-none text-[var(--text-primary)]">{categoryName ?? "All"}</dd>
                <dt className="mt-2 text-sm text-[var(--text-secondary)]">Categories</dt>
              </div>
            </div>
          </dl>
          <div className="mt-9 max-w-sm border-t border-white/10 pt-7">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent-primary)]">Current filter</p>
            <p className="mt-3 flex items-center gap-3 text-base font-medium text-[var(--text-primary)]">
              {currentFilter}
              <span className="size-1.5 rounded-full bg-[var(--accent-primary)]" aria-hidden />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
