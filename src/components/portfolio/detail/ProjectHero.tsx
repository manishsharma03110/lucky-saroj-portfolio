import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { schema } from "@/lib/db";

type Project = typeof schema.portfolioProjects.$inferSelect;

export function ProjectHero({ project, categoryName }: { project: Project; categoryName?: string }) {
  const metadata = [categoryName, project.clientName, project.year].filter(Boolean).join(" · ");

  return (
    <header className="relative overflow-hidden border-b border-white/10 bg-[var(--background-primary)] py-12 sm:py-16 lg:py-20 2xl:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_70%,var(--accent-glow),transparent_32%)] opacity-55" aria-hidden />
      <div className="relative mx-auto w-full max-w-[1560px] px-5 sm:px-8 lg:px-12 2xl:px-16">
        <Link href="/portfolio" className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"><ArrowLeft size={15} aria-hidden />Portfolio</Link>
        <div className="mt-8 grid gap-7 md:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)] lg:items-end lg:gap-16 2xl:gap-24">
          <div className="min-w-0"><p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)] lg:text-[0.8rem]">{categoryName ?? "Selected project"}</p><h1 className="mt-5 max-w-[16ch] break-words text-balance font-display text-[clamp(2.65rem,5.2vw,5.75rem)] font-semibold leading-[0.95] tracking-[-0.052em] text-[var(--text-primary)]">{project.title}</h1></div>
          <div className="border-l border-[var(--accent-primary)]/45 pl-5 lg:mb-1 lg:pl-7">{metadata && <p className="text-sm leading-6 text-[var(--text-secondary)]">{metadata}</p>}{project.description && <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--text-muted)]">{project.description}</p>}</div>
        </div>
      </div>
    </header>
  );
}
