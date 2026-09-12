import type { schema } from "@/lib/db";

type Project = typeof schema.portfolioProjects.$inferSelect;
type Tool = typeof schema.projectTools.$inferSelect;

type DetailCopy = Readonly<{
  overviewEyebrow?: string;
  clientLabel?: string;
  categoryLabel?: string;
  yearLabel?: string;
  caseStudyEyebrow?: string;
  challengeLabel?: string;
  approachLabel?: string;
  resultLabel?: string;
  toolsEyebrow?: string;
  toolsHeading?: string;
  toolsAriaLabel?: string;
}>;

export function ProjectOverview({ project, categoryName, copy = {} }: { project: Project; categoryName?: string; copy?: DetailCopy }) {
  const metadata = [
    { label: copy.clientLabel || "Client", value: project.clientName },
    { label: copy.categoryLabel || "Category", value: categoryName },
    { label: copy.yearLabel || "Year", value: project.year ? String(project.year) : null },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));
  if (!project.description && metadata.length === 0) return null;
  return <section className="border-y border-white/10 bg-[var(--surface-primary)] py-12 sm:py-16 lg:py-20"><div className="mx-auto grid w-full max-w-[1480px] gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.5fr)] lg:gap-20 lg:px-12 2xl:px-16"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">{copy.overviewEyebrow || "Project overview"}</p>{project.description && <p className="mt-5 max-w-[760px] whitespace-pre-line text-lg leading-8 text-[var(--text-secondary)]">{project.description}</p>}</div>{metadata.length > 0 && <dl className="border-t border-white/10">{metadata.map((item) => <div key={item.label} className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 border-b border-white/10 py-4 text-sm"><dt className="uppercase tracking-[0.16em] text-[var(--text-secondary)]">{item.label}</dt><dd className="break-words text-[var(--text-primary)]">{item.value}</dd></div>)}</dl>}</div></section>;
}

export function CaseStudy({ project, copy = {} }: { project: Project; copy?: DetailCopy }) {
  const sections = [
    { label: copy.challengeLabel || "Challenge", content: project.challenge },
    { label: copy.approachLabel || "Approach", content: project.approach },
    { label: copy.resultLabel || "Result", content: project.result },
  ].filter((item): item is { label: string; content: string } => Boolean(item.content));
  if (sections.length === 0) return null;
  return <section className="bg-[var(--background-primary)] py-12 sm:py-16 lg:py-20 2xl:py-24"><div className="mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12 2xl:px-16"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">{copy.caseStudyEyebrow || "Case study"}</p><div className="mt-7 border-t border-white/10">{sections.map((section, index) => <article key={section.label} className="grid gap-4 border-b border-white/10 py-8 sm:py-10 lg:grid-cols-[4rem_15rem_minmax(0,1fr)] lg:gap-10 2xl:grid-cols-[5rem_18rem_minmax(0,1fr)]"><span className="text-xs tabular-nums text-[var(--accent-primary)]">{String(index + 1).padStart(2, "0")}</span><h2 className="font-display text-2xl font-semibold tracking-[-0.035em] text-[var(--text-primary)] sm:text-3xl lg:text-4xl">{section.label}</h2><p className="max-w-[760px] whitespace-pre-line text-base leading-7 text-[var(--text-secondary)] lg:text-[1.0625rem] lg:leading-8">{section.content}</p></article>)}</div></div></section>;
}

function toolMonogram(name: string) { const words = name.trim().split(/\s+/); return (words.length > 1 ? words.map((word) => word[0]).join("") : name.slice(0, 2)).slice(0, 2).toUpperCase(); }
export function ProjectTools({ tools, copy = {} }: { tools: Tool[]; copy?: DetailCopy }) {
  if (tools.length === 0) return null;
  return <section className="border-t border-white/10 bg-[var(--surface-primary)] py-10 sm:py-12"><div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12 2xl:px-16"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">{copy.toolsEyebrow || "Tools"}</p><h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.035em] text-[var(--text-primary)]">{copy.toolsHeading || "Project toolkit."}</h2></div><ul className="flex flex-wrap gap-2.5" aria-label={copy.toolsAriaLabel || "Tools used"}>{tools.map((tool) => <li key={tool.id} className="flex items-center gap-2.5 rounded-md border border-white/10 bg-[var(--background-primary)] px-3 py-2 text-sm text-[var(--text-secondary)]"><span className="flex h-7 w-7 items-center justify-center rounded border border-[var(--accent-primary)]/35 text-[0.6rem] font-bold text-[var(--accent-primary)]" aria-hidden>{toolMonogram(tool.name)}</span>{tool.name}</li>)}</ul></div></section>;
}
