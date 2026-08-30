import type { schema } from "@/lib/db";

type Project = typeof schema.portfolioProjects.$inferSelect;
type Tool = typeof schema.projectTools.$inferSelect;

export function ProjectOverview({ project, categoryName }: { project: Project; categoryName?: string }) {
  const metadata = [{ label: "Client", value: project.clientName }, { label: "Category", value: categoryName }, { label: "Year", value: project.year ? String(project.year) : null }].filter((item): item is { label: string; value: string } => Boolean(item.value));
  if (!project.description && metadata.length === 0) return null;
  return <section className="border-y border-white/10 bg-[var(--surface-primary)] py-12 sm:py-16 lg:py-20"><div className="mx-auto grid w-full max-w-[1280px] gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.55fr)] lg:gap-16 lg:px-12"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">Project overview</p>{project.description && <p className="mt-5 max-w-[740px] whitespace-pre-line text-lg leading-8 text-[var(--text-secondary)]">{project.description}</p>}</div>{metadata.length > 0 && <dl className="border-t border-white/10">{metadata.map((item) => <div key={item.label} className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 border-b border-white/10 py-4 text-sm"><dt className="uppercase tracking-[0.16em] text-[var(--text-muted)]">{item.label}</dt><dd className="break-words text-[var(--text-primary)]">{item.value}</dd></div>)}</dl>}</div></section>;
}

export function CaseStudy({ project }: { project: Project }) {
  const sections = [{ label: "Challenge", content: project.challenge }, { label: "Approach", content: project.approach }, { label: "Result", content: project.result }].filter((item): item is { label: string; content: string } => Boolean(item.content));
  if (sections.length === 0) return null;
  return <section className="bg-[var(--background-primary)] py-12 sm:py-16 lg:py-20"><div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">Case study</p><div className="mt-7 border-t border-white/10">{sections.map((section, index) => <article key={section.label} className="grid gap-4 border-b border-white/10 py-8 sm:py-10 lg:grid-cols-[4rem_15rem_minmax(0,1fr)] lg:gap-8"><span className="text-xs tabular-nums text-[var(--accent-primary)]">{String(index + 1).padStart(2, "0")}</span><h2 className="font-display text-2xl font-semibold tracking-[-0.035em] text-[var(--text-primary)] sm:text-3xl">{section.label}</h2><p className="max-w-[740px] whitespace-pre-line text-base leading-7 text-[var(--text-secondary)]">{section.content}</p></article>)}</div></div></section>;
}

function toolMonogram(name: string) { const words = name.trim().split(/\s+/); return (words.length > 1 ? words.map((word) => word[0]).join("") : name.slice(0, 2)).slice(0, 2).toUpperCase(); }
export function ProjectTools({ tools }: { tools: Tool[] }) {
  if (tools.length === 0) return null;
  return <section className="border-t border-white/10 bg-[var(--surface-primary)] py-10 sm:py-12"><div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">Tools</p><h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.035em] text-[var(--text-primary)]">Project toolkit.</h2></div><ul className="flex flex-wrap gap-2.5" aria-label="Tools used">{tools.map((tool) => <li key={tool.id} className="flex items-center gap-2.5 rounded-md border border-white/10 bg-[var(--background-primary)] px-3 py-2 text-sm text-[var(--text-secondary)]"><span className="flex h-7 w-7 items-center justify-center rounded border border-[var(--accent-primary)]/35 text-[0.6rem] font-bold text-[var(--accent-primary)]" aria-hidden>{toolMonogram(tool.name)}</span>{tool.name}</li>)}</ul></div></section>;
}
