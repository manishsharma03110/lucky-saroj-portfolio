import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { schema } from "@/lib/db";

type Project = typeof schema.portfolioProjects.$inferSelect;
export function ProjectNavigation({ previous, next }: { previous: Project | null; next: Project | null }) {
  if (!previous && !next) return null;
  return <nav className="border-y border-white/10 bg-[var(--background-primary)]" aria-label="Project navigation"><div className="mx-auto grid w-full max-w-[1280px] px-5 sm:px-8 md:grid-cols-2 lg:px-12">{previous ? <Link href={`/portfolio/${previous.slug}`} className="group border-b border-white/10 py-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] md:border-b-0 md:border-r md:pr-10"><span className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]"><ArrowLeft size={14} aria-hidden />Previous project</span><span className="mt-3 block break-words font-display text-xl font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-hover)] sm:text-2xl">{previous.title}</span></Link> : <span className="hidden md:block" />}{next && <Link href={`/portfolio/${next.slug}`} className="group py-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] md:pl-10 md:text-right"><span className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)] md:justify-end">Next project<ArrowRight size={14} aria-hidden /></span><span className="mt-3 block break-words font-display text-xl font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-hover)] sm:text-2xl">{next.title}</span></Link>}</div></nav>;
}
