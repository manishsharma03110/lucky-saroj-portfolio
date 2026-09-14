import Link from "next/link";
import type { schema } from "@/lib/db";
import { canUseOptimizedImage } from "@/lib/media/image-source";
import { InteractiveWorkMedia } from "@/components/home/InteractiveWorkMedia";

type Project = typeof schema.portfolioProjects.$inferSelect;

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

function directVideoPreview(url: string | null | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url, "https://portfolio.local");
    const direct = /\.(mp4|webm|m4v|ogv)(?:$|\?)/i.test(`${parsed.pathname}${parsed.search}`);
    return direct ? url : null;
  } catch {
    return /\.(mp4|webm|m4v|ogv)(?:$|\?)/i.test(url) ? url : null;
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
  const optimizedVisual = canUseOptimizedImage(visualUrl);
  const large = size === "large";
  const metadata = [categoryName, project.year].filter(Boolean).join(" · ");
  const previewVideoUrl = directVideoPreview(project.videoUrl);

  return (
    <article>
      <Link
        href={`/portfolio/${project.slug}`}
        className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-primary)]"
      >
        <InteractiveWorkMedia
          title={project.title}
          categoryName={categoryName}
          visualUrl={visualUrl}
          optimizedVisual={optimizedVisual}
          previewVideoUrl={previewVideoUrl}
          large={large}
        />

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
