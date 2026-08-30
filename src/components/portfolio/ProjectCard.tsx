import { ArrowUpRight, Play } from "lucide-react";
import Link from "next/link";
import type { schema } from "@/lib/db";

type Project = typeof schema.portfolioProjects.$inferSelect;
type Layout = "featured" | "wide" | "standard";

function initials(title: string) {
  return title.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

export function hasUsableVisual(url: string | null | undefined) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const googleDrivePage = parsed.hostname === "drive.google.com" && parsed.pathname.startsWith("/file/");
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && !googleDrivePage;
  } catch {
    return url.startsWith("/");
  }
}

function ProjectVisual({ project, categoryName, mediaUrl, layout }: { project: Project; categoryName?: string; mediaUrl?: string | null; layout: Layout }) {
  const visualUrl = hasUsableVisual(project.thumbnailUrl) ? project.thumbnailUrl : hasUsableVisual(project.posterUrl) ? project.posterUrl : hasUsableVisual(mediaUrl) ? mediaUrl : null;
  const featured = layout === "featured";
  const fallbackVariant = project.title.split("").reduce((total, character) => total + character.charCodeAt(0), 0) % 3;
  const aspect = visualUrl
    ? featured ? "aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/11]" : layout === "wide" ? "aspect-[4/3] sm:aspect-[16/10]" : "aspect-[4/3]"
    : featured ? "aspect-[16/10] sm:aspect-[16/9] lg:aspect-[2/1]" : "aspect-[16/10] sm:aspect-[16/9]";

  return (
    <div className={`relative overflow-hidden border border-white/10 bg-[var(--surface-primary)] ${aspect}`}>
      {visualUrl ? (
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.025]" style={{ backgroundImage: `url('${visualUrl}')` }} role="img" aria-label={`${project.title} project preview`} />
      ) : (
        <div className={`absolute inset-0 ${fallbackVariant === 0 ? "bg-[radial-gradient(circle_at_78%_25%,rgba(59,130,246,0.12),transparent_32%),linear-gradient(145deg,var(--surface-elevated)_0%,var(--background-primary)_76%)]" : fallbackVariant === 1 ? "bg-[radial-gradient(circle_at_20%_78%,rgba(59,130,246,0.10),transparent_30%),linear-gradient(125deg,var(--background-primary)_0%,var(--surface-elevated)_100%)]" : "bg-[linear-gradient(155deg,var(--surface-elevated)_0%,var(--surface-primary)_48%,var(--background-primary)_100%)]"}`}>
          <div className={`absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] ${fallbackVariant === 1 ? "[background-size:72px_72px]" : "[background-size:56px_56px]"}`} aria-hidden />
          <span className={`absolute select-none font-display text-[clamp(5rem,12vw,10rem)] leading-none text-white/[0.055] ${fallbackVariant === 1 ? "-left-2 bottom-0" : "right-5 top-2"}`} aria-hidden>{initials(project.title)}</span>
          <div className="absolute inset-x-5 bottom-5 max-w-[75%] sm:inset-x-7 sm:bottom-7"><span className="block h-px w-14 bg-[var(--accent-primary)]" aria-hidden /><p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--accent-primary)]">{categoryName ?? "Selected project"}</p><p className="mt-2 line-clamp-2 font-display text-xl font-semibold tracking-[-0.03em] text-[var(--text-primary)] sm:text-2xl">{project.title}</p></div>
          <span className="absolute left-4 top-4 h-7 w-7 border-l border-t border-[var(--accent-primary)]/50" aria-hidden />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/15 transition-colors duration-300 group-hover:from-black/75" aria-hidden />
      <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-4 sm:inset-x-5 sm:top-5">
        {categoryName ? <span className="border border-white/15 bg-black/45 px-3 py-1.5 text-xs text-white/85 backdrop-blur-sm">{categoryName}</span> : <span />}
        {project.videoUrl && <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--accent-primary)]/60 bg-black/45 text-[var(--accent-hover)] backdrop-blur-sm" aria-hidden><Play size={14} fill="currentColor" /></span>}
      </div>
      <span className="absolute bottom-4 right-4 h-7 w-7 border-b border-r border-[var(--accent-primary)]/60 opacity-70 transition-opacity group-hover:opacity-100" aria-hidden />
    </div>
  );
}

export function ProjectCard({ project, categoryName, mediaUrl, layout = "standard" }: { project: Project; categoryName?: string; mediaUrl?: string | null; layout?: Layout }) {
  const featured = layout === "featured";
  const metadata = [categoryName, project.clientName, project.year].filter(Boolean).join(" · ");

  if (featured) {
    return (
      <article className="border-b border-white/10 pb-12 sm:pb-14">
        <Link href={`/portfolio/${project.slug}`} className="group grid gap-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background-primary)] lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.72fr)] lg:items-center lg:gap-12">
          <ProjectVisual project={project} categoryName={categoryName} mediaUrl={mediaUrl} layout="featured" />
          <div className="min-w-0 lg:pr-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">Featured project</p>
            <h2 className="mt-4 break-words font-display text-[clamp(2.25rem,3.6vw,3.5rem)] font-semibold leading-none tracking-[-0.045em] text-[var(--text-primary)]">{project.title}</h2>
            {metadata && <p className="mt-4 break-words text-sm text-[var(--text-muted)]">{metadata}</p>}
            {project.description && <p className="mt-6 line-clamp-4 text-base leading-7 text-[var(--text-secondary)]">{project.description}</p>}
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-hover)]">View project <ArrowUpRight size={17} className="transition-transform duration-300 motion-reduce:transition-none group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden /></span>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article>
      <Link href={`/portfolio/${project.slug}`} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background-primary)]">
        <ProjectVisual project={project} categoryName={categoryName} mediaUrl={mediaUrl} layout={layout} />
        <div className="flex min-w-0 items-start justify-between gap-5 border-b border-white/10 py-5 sm:py-6">
          <div className="min-w-0"><h2 className="break-words font-display text-2xl font-semibold tracking-[-0.035em] text-[var(--text-primary)] sm:text-3xl">{project.title}</h2>{metadata && <p className="mt-2 break-words text-sm text-[var(--text-muted)]">{metadata}</p>}</div>
          <ArrowUpRight size={20} className="mt-1 shrink-0 text-[var(--accent-primary)] transition-transform duration-300 motion-reduce:transition-none group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </div>
      </Link>
    </article>
  );
}
