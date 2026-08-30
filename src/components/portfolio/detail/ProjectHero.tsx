import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { schema } from "@/lib/db";

type Project = typeof schema.portfolioProjects.$inferSelect;

export function ProjectHero({ project, categoryName }: { project: Project; categoryName?: string }) {
  const metadata = [categoryName, project.clientName, project.year].filter(Boolean).join(" · ");

  return (
    <header className="relative overflow-hidden border-b border-white/10 bg-[var(--background-primary)] py-12 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:88px_88px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" aria-hidden />
      <div className="relative mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12">
        <Link href="/portfolio" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)] transition-colors hover:text-[var(--accent-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"><ArrowLeft size={15} aria-hidden />Portfolio</Link>
        <div className="mt-10 grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)] lg:items-end lg:gap-16">
          <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">{categoryName ?? "Selected project"}</p><h1 className="mt-5 max-w-[16ch] break-words font-display text-[clamp(2.5rem,5.2vw,5rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-[var(--text-primary)]">{project.title}</h1></div>
          <div className="border-l border-[var(--accent-primary)]/45 pl-5 lg:mb-1 lg:pl-7">{metadata && <p className="text-sm leading-6 text-[var(--text-secondary)]">{metadata}</p>}{project.description && <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--text-muted)]">{project.description}</p>}</div>
        </div>
      </div>
    </header>
  );
}
