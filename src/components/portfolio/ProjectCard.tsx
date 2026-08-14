import Link from "next/link";
import { Play } from "lucide-react";
import type { schema } from "@/lib/db";

type Project = typeof schema.portfolioProjects.$inferSelect;

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1533928298208-27ff66555d8d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=800&auto=format&fit=crop",
];

function fallbackImage(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PLACEHOLDER_IMAGES[hash % PLACEHOLDER_IMAGES.length];
}

export function ProjectCard({
  project,
  categoryName,
}: {
  project: Project;
  categoryName?: string;
}) {
  return (
    <Link href={`/portfolio/${project.slug}`} className="group block">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[var(--color-ink)]">
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url('${project.thumbnailUrl || fallbackImage(project.slug)}')` }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/30 group-hover:opacity-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--color-ink)]">
            <Play size={16} fill="currentColor" />
          </span>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-display text-base font-semibold text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-accent)]">
          {project.title}
        </h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {categoryName ?? "Project"}
          {project.year ? ` · ${project.year}` : ""}
        </p>
      </div>
    </Link>
  );
}
