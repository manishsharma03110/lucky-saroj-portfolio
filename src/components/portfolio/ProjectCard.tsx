import { ArrowUpRight, Play } from "lucide-react";
import Link from "next/link";
import { VideoLaunchSurface } from "@/components/ui/VideoLaunchSurface";
import type { PortfolioProjectWithVideo } from "@/lib/db/queries";
import { getVideoSource } from "@/lib/media/video";

type Project = PortfolioProjectWithVideo;
type Layout = "featured" | "wide" | "standard";
type CardCopy = { previewAltSuffix: string; fallbackCategoryLabel: string; featuredLabel: string; viewLabel: string };

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

function ProjectVisual({
  project,
  categoryName,
  mediaUrl,
  layout,
  copy,
}: {
  project: Project;
  categoryName?: string;
  mediaUrl?: string | null;
  layout: Layout;
  copy: CardCopy;
}) {
  const visualUrl = hasUsableVisual(project.thumbnailUrl)
    ? project.thumbnailUrl
    : hasUsableVisual(project.posterUrl)
      ? project.posterUrl
      : hasUsableVisual(mediaUrl)
        ? mediaUrl
        : null;
  const visualAlt = project.thumbnailAlt?.trim() || `${project.title} ${copy.previewAltSuffix}`;
  const fallbackVariant = project.title.split("").reduce((total, character) => total + character.charCodeAt(0), 0) % 3;
  const portrait = project.videoOrientation === "portrait";
  const playable = Boolean(project.videoUrl && getVideoSource(project.videoUrl));
  const featured = layout === "featured";

  const visual = (
    <div className={`relative aspect-video w-full overflow-hidden rounded-[12px] border border-white/10 bg-[var(--surface-primary)] shadow-[0_22px_70px_rgba(0,0,0,0.2)] transition-[border-color,box-shadow] duration-500 motion-reduce:transition-none group-hover:border-[var(--accent-border)] group-hover:shadow-[0_28px_90px_rgba(0,0,0,0.34)] ${featured ? "" : "bg-[var(--background-secondary)]"}`}>
      {visualUrl ? (
        <>
          {portrait ? (
            <div
              className="absolute -inset-4 scale-110 bg-cover bg-center bg-no-repeat opacity-45 blur-xl"
              style={{ backgroundImage: `url('${visualUrl}')` }}
              aria-hidden
            />
          ) : null}
          <div
            className={`absolute inset-0 bg-center bg-no-repeat transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.01] ${portrait ? "bg-contain" : "bg-cover"}`}
            style={{ backgroundImage: `url('${visualUrl}')` }}
            role="img"
            aria-label={visualAlt}
          />
        </>
      ) : (
        <div className={`absolute inset-0 ${fallbackVariant === 0 ? "bg-[radial-gradient(circle_at_78%_25%,rgba(59,130,246,0.12),transparent_32%),linear-gradient(145deg,var(--surface-elevated)_0%,var(--background-primary)_76%)]" : fallbackVariant === 1 ? "bg-[radial-gradient(circle_at_20%_78%,rgba(59,130,246,0.10),transparent_30%),linear-gradient(125deg,var(--background-primary)_0%,var(--surface-elevated)_100%)]" : "bg-[linear-gradient(155deg,var(--surface-elevated)_0%,var(--surface-primary)_48%,var(--background-primary)_100%)]"}`}>
          <span className={`absolute select-none font-display text-[clamp(5rem,12vw,10rem)] leading-none text-white/[0.055] ${fallbackVariant === 1 ? "-left-2 bottom-0" : "right-5 top-2"}`} aria-hidden>
            {initials(project.title)}
          </span>
          <div className="absolute inset-x-5 bottom-5 max-w-[80%] sm:inset-x-7 sm:bottom-7">
            <span className="block h-px w-14 bg-[var(--accent-primary)]" aria-hidden />
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--accent-primary)]">{categoryName ?? copy.fallbackCategoryLabel}</p>
            <p className="mt-2 line-clamp-2 font-display text-xl font-semibold tracking-[-0.03em] text-[var(--text-primary)] sm:text-2xl">{project.title}</p>
          </div>
        </div>
      )}
      {playable && (
        <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--accent-primary)]/55 bg-black/65 text-[var(--accent-hover)] shadow-[0_8px_28px_rgba(0,0,0,.4)] backdrop-blur-sm sm:right-4 sm:top-4" aria-hidden>
          <Play size={14} fill="currentColor" />
        </span>
      )}
      {playable && (
        <span className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/90 backdrop-blur-md sm:bottom-5 sm:left-5">
          Play video
        </span>
      )}
    </div>
  );

  if (playable && project.videoUrl) {
    return (
      <VideoLaunchSurface
        videoUrl={project.videoUrl}
        title={project.title}
        posterUrl={visualUrl}
        orientation={project.videoOrientation}
        className="group w-full"
      >
        {visual}
      </VideoLaunchSurface>
    );
  }

  return (
    <Link href={`/portfolio/${project.slug}`} className="group block rounded-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]">
      {visual}
    </Link>
  );
}

function ProjectDetailsLink({ project, metadata, copy, featured }: { project: Project; metadata: string; copy: CardCopy; featured: boolean }) {
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      className={featured ? "group min-w-0 rounded-[12px] lg:pr-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]" : "group flex min-w-0 items-start justify-between gap-5 border-b border-white/10 py-5 sm:py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"}
    >
      <div className="min-w-0">
        {featured && <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">{copy.featuredLabel}</p>}
        <h2 className={featured ? "mt-4 break-words font-display text-[clamp(2.25rem,3.6vw,3.5rem)] font-semibold leading-none tracking-[-0.045em] text-[var(--text-primary)]" : "break-words font-display text-2xl font-semibold tracking-[-0.035em] text-[var(--text-primary)] sm:text-3xl"}>
          {project.title}
        </h2>
        {metadata && <p className={`${featured ? "mt-4" : "mt-2"} break-words text-sm text-[var(--text-muted)]`}>{metadata}</p>}
        {featured && project.description && <p className="mt-6 line-clamp-4 text-base leading-7 text-[var(--text-secondary)]">{project.description}</p>}
        {featured && <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-hover)]">{copy.viewLabel} <ArrowUpRight size={17} aria-hidden /></span>}
      </div>
      {!featured && <ArrowUpRight size={20} className="mt-1 shrink-0 text-[var(--accent-primary)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />}
    </Link>
  );
}

export function ProjectCard({ project, categoryName, mediaUrl, layout = "standard", copy }: { project: Project; categoryName?: string; mediaUrl?: string | null; layout?: Layout; copy: CardCopy }) {
  const featured = layout === "featured";
  const metadata = [categoryName, project.clientName, project.year].filter(Boolean).join(" · ");

  if (featured) {
    return (
      <article className="border-b border-white/10 pb-12 sm:pb-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(20rem,0.68fr)] lg:items-center lg:gap-12 2xl:gap-16">
          <ProjectVisual project={project} categoryName={categoryName} mediaUrl={mediaUrl} layout="featured" copy={copy} />
          <ProjectDetailsLink project={project} metadata={metadata} copy={copy} featured />
        </div>
      </article>
    );
  }

  return (
    <article className="min-w-0">
      <ProjectVisual project={project} categoryName={categoryName} mediaUrl={mediaUrl} layout={layout} copy={copy} />
      <ProjectDetailsLink project={project} metadata={metadata} copy={copy} featured={false} />
    </article>
  );
}
