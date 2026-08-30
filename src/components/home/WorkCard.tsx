import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";
import type { schema } from "@/lib/db";

type Project = typeof schema.portfolioProjects.$inferSelect;

function initials(title: string) {
  return title.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function usableVisual(url: string | null | undefined) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const drivePage = parsed.hostname === "drive.google.com" && parsed.pathname.startsWith("/file/");
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && !drivePage;
  } catch {
    return url.startsWith("/");
  }
}

export function WorkCard({
  project,
  categoryName,
  size = "default",
}: {
  project: Project;
  categoryName?: string;
  size?: "default" | "large";
}) {
  const visualUrl = usableVisual(project.thumbnailUrl)
    ? project.thumbnailUrl
    : usableVisual(project.posterUrl)
      ? project.posterUrl
      : null;
  const large = size === "large";
  const metadata = [categoryName, project.year].filter(Boolean).join(" · ");

  return (
    <article>
      <Link
        href={`/portfolio/${project.slug}`}
        className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-primary)]"
      >
        <div className={`relative overflow-hidden rounded-[10px] border border-white/10 bg-[var(--surface-primary)] ${large ? "aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2.35/1]" : "aspect-[4/3] sm:aspect-[16/10]"}`}>
          {visualUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-[var(--cine-ease)] motion-reduce:transition-none group-hover:scale-[1.025]"
              style={{ backgroundImage: `url('${visualUrl}')` }}
              role="img"
              aria-label={project.title}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(145deg,var(--surface-elevated)_0%,var(--background-secondary)_68%)]">
              <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:72px_72px]" aria-hidden />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_67%_38%,rgba(59,130,246,0.14),transparent_35%)]" aria-hidden />
              <span className="absolute right-[5%] top-1/2 -translate-y-1/2 select-none font-display text-[clamp(5rem,16vw,13rem)] font-semibold text-[var(--text-primary)] opacity-[0.055]" aria-hidden="true">
                {initials(project.title)}
              </span>
              <div className="absolute inset-x-6 bottom-6 sm:inset-x-8 sm:bottom-8">
                {categoryName && <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent-primary)]">{categoryName}</p>}
                <p className="mt-2 max-w-[75%] font-display text-xl font-semibold tracking-[-0.03em] text-[var(--text-primary)] sm:text-2xl">{project.title}</p>
                <span className="mt-4 block h-px bg-gradient-to-r from-[var(--accent-primary)]/70 to-transparent" aria-hidden />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/10 opacity-75 transition-opacity duration-300 group-hover:opacity-90" aria-hidden="true" />
          <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-4 sm:inset-x-7 sm:top-7">
            {categoryName ? (
              <span className="border border-white/20 bg-black/35 px-3 py-1.5 text-xs text-white/85 backdrop-blur-sm">{categoryName}</span>
            ) : <span />}
            {project.videoUrl && (
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-black/30 text-white backdrop-blur-sm" aria-hidden="true">
                <Play size={16} fill="currentColor" />
              </span>
            )}
          </div>
          <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 sm:inset-x-7 sm:bottom-7">
            <span className="text-sm font-medium text-white">View project</span>
            <ArrowUpRight size={20} className="text-[var(--accent-hover)] transition-transform duration-300 motion-reduce:transition-none group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </div>
        </div>

        <div className={`grid gap-3 border-b border-white/[0.09] py-5 ${large ? "md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-10" : ""}`}>
          <div className="min-w-0">
            {project.clientName && <p className="mb-2 break-words text-sm text-[var(--accent-primary)]">{project.clientName}</p>}
            <h3 className={`break-words font-display font-semibold leading-tight tracking-[-0.03em] text-[var(--text-primary)] ${large ? "text-[1.75rem] sm:text-3xl lg:text-4xl" : "text-2xl sm:text-[1.75rem]"}`}>
              {project.title}
            </h3>
          </div>
          {metadata && <p className="text-sm text-[var(--text-muted)] md:text-right">{metadata}</p>}
        </div>
      </Link>
    </article>
  );
}
