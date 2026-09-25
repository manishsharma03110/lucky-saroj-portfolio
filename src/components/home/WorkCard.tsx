"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { InteractiveWorkVisual } from "@/components/home/InteractiveWorkVisual";
import type { PortfolioProjectWithVideo } from "@/lib/db/queries";
import { getVideoSource } from "@/lib/media/video";

type Project = PortfolioProjectWithVideo;

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
  previewActive = false,
}: {
  project: Project;
  categoryName?: string;
  size?: "default" | "large";
  previewActive?: boolean;
}) {
  const visualUrl = usableVisual(project.thumbnailUrl)
    ? project.thumbnailUrl
    : usableVisual(project.posterUrl)
      ? project.posterUrl
      : null;
  const large = size === "large";
  const metadata = [categoryName, project.year].filter(Boolean).join(" · ");
  const playable = Boolean(project.videoUrl && getVideoSource(project.videoUrl));
  const projectHref = `/portfolio/${project.slug}`;

  const visual = (
    <div className="relative aspect-video w-full overflow-hidden rounded-[12px] border border-white/10 bg-[var(--background-secondary)] shadow-[var(--media-shadow)] transition-[border-color,box-shadow] duration-500 motion-reduce:transition-none group-hover:border-[var(--accent-border)] group-hover:shadow-[var(--media-shadow-hover)]">
      {visualUrl ? (
        <InteractiveWorkVisual
          title={project.title}
          visualUrl={visualUrl}
          videoUrl={project.videoUrl}
          large={large}
          categoryName={categoryName}
          orientation={project.videoOrientation}
          autoPreview={previewActive}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(145deg,var(--surface-elevated)_0%,var(--background-secondary)_68%)]">
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:72px_72px]" aria-hidden />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_67%_38%,var(--accent-glow),transparent_38%)]" aria-hidden />
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

      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-30 flex items-center justify-between gap-2 sm:inset-x-4 sm:bottom-4">
        <span className="rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md sm:text-xs">
          {playable ? "Open project" : "View project"}
        </span>
        <ArrowUpRight size={18} className="text-[var(--accent-hover)] transition-transform duration-300 motion-reduce:transition-none group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
    </div>
  );

  return (
    <article className="group/card min-w-0">
      <Link
        href={projectHref}
        className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-primary)]"
        aria-label={playable ? `Open ${project.title} project and video` : `Open ${project.title} project`}
      >
        {visual}
      </Link>

      <Link
        href={projectHref}
        className={`grid gap-3 border-b border-white/[0.09] py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${large ? "md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-10" : ""}`}
      >
        <div className="min-w-0">
          {project.clientName && <p className="mb-2 break-words text-sm text-[var(--accent-primary)]">{project.clientName}</p>}
          <h3 className={`break-words font-display font-semibold leading-tight tracking-[-0.03em] text-[var(--text-primary)] ${large ? "text-[1.45rem] min-[480px]:text-[1.75rem] sm:text-3xl lg:text-4xl" : "text-xl min-[480px]:text-2xl sm:text-[1.75rem]"}`}>
            {project.title}
          </h3>
        </div>
        {metadata && <p className="text-sm text-[var(--text-readable, var(--text-muted))] md:text-right">{metadata}</p>}
      </Link>
    </article>
  );
}
