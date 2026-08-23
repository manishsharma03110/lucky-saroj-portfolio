import Link from "next/link";
import { ArrowUpRight, Film } from "lucide-react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { schema } from "@/lib/db";

type Project = typeof schema.portfolioProjects.$inferSelect;

export function WorkCard({
  project,
  categoryName,
  size = "default",
}: {
  project: Project;
  categoryName?: string;
  size?: "default" | "large";
}) {
  return (
    <Link href={`/portfolio/${project.slug}`} className="group block">
      <MediaFrame aspect={size === "large" ? "aspect-[16/10]" : "aspect-[4/3]"}>
        {project.thumbnailUrl ? (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url('${project.thumbnailUrl}')` }}
            role="img"
            aria-label={project.title}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[var(--cine-surface)] text-[var(--cine-text-tertiary)]">
            <Film size={size === "large" ? 40 : 28} strokeWidth={1.25} />
            <span className="cine-eyebrow !text-[var(--cine-text-tertiary)]">
              {categoryName ?? "PROJECT"}
            </span>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100">
          <span className="cine-eyebrow flex items-center gap-1.5 rounded-full border border-white/30 px-4 py-2 !text-white">
            WATCH <ArrowUpRight size={14} />
          </span>
        </div>
      </MediaFrame>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="cine-display text-lg text-[var(--cine-text-primary)] transition-colors group-hover:text-[var(--cine-accent)] sm:text-xl">
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
    </Link>
  );
}
