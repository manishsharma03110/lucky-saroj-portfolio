import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { schema } from "@/lib/db";

type Project = typeof schema.portfolioProjects.$inferSelect;

/** First letters of each significant word — used for the title-card
 * treatment when a project has no thumbnail yet, so the placeholder reads
 * as an intentional editorial mark rather than a broken/empty box. */
function initials(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
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
  const hasMedia = !!project.thumbnailUrl;

  return (
    <Link href={`/portfolio/${project.slug}`} className="group block">
      <MediaFrame
        aspect={size === "large" ? "aspect-[16/9]" : "aspect-[4/3]"}
        overlay={
          <>
            {/* Category tag, always visible — anchors the card as a real
                catalogued piece of work rather than a generic image tile. */}
            {categoryName && (
              <span className="cine-eyebrow absolute left-4 top-4 rounded-sm border border-white/20 bg-black/40 px-2 py-1 !text-white backdrop-blur-sm">
                {categoryName}
              </span>
            )}

            {/* Large featured item: title overlaid directly on the media,
                poster-style, for maximum visual weight. */}
            {size === "large" && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-6 sm:p-8">
                <h3 className="cine-display text-2xl text-white sm:text-3xl lg:text-4xl">
                  {project.title}
                </h3>
                {project.year && (
                  <p className="mt-1 text-sm text-white/70">{project.year}</p>
                )}
              </div>
            )}

            {/* Hover watch affordance, on top of everything else, outside
                the zoom scale so it never stretches. */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/45 group-hover:opacity-100">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/40 text-white transition-transform duration-300 group-hover:scale-110">
                <Play size={18} fill="currentColor" />
              </span>
            </div>
          </>
        }
      >
        {hasMedia ? (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url('${project.thumbnailUrl}')` }}
            role="img"
            aria-label={project.title}
          />
        ) : (
          <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 bg-[linear-gradient(155deg,var(--cine-surface)_0%,var(--cine-surface-2)_100%)]">
            <span
              className="cine-display select-none leading-none text-[var(--cine-text-tertiary)]"
              style={{ fontSize: size === "large" ? "8rem" : "4.5rem" }}
              aria-hidden
            >
              {initials(project.title)}
            </span>
            <span className="h-px w-10 bg-[var(--cine-accent)]" aria-hidden />
          </div>
        )}
      </MediaFrame>

      {/* Below-media caption — always present for default cards (media
          alone doesn't carry the title there); omitted for the large card
          since the poster overlay already shows it. */}
      {size !== "large" && (
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="cine-display text-lg text-[var(--cine-text-primary)] transition-colors group-hover:text-[var(--cine-accent)]">
              {project.title}
            </h3>
            <p className="mt-1 text-sm text-[var(--cine-text-secondary)]">
              {categoryName ?? "Project"}
              {project.year ? ` · ${project.year}` : ""}
            </p>
          </div>
          <ArrowUpRight
            size={18}
            className="mt-1 shrink-0 text-[var(--cine-text-tertiary)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--cine-accent)]"
          />
        </div>
      )}
    </Link>
  );
}
