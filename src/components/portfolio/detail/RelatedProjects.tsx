import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";
import type { schema } from "@/lib/db";
import type { PortfolioProjectWithVideo } from "@/lib/db/queries";
import { canUseOptimizedImage } from "@/lib/media/image-source";
import { getVideoSource } from "@/lib/media/video";

type Project = PortfolioProjectWithVideo;
type Category = typeof schema.portfolioCategories.$inferSelect;
type Entry = { project: Project; category: Category | null };

export function RelatedProjects({ projects }: { projects: Entry[] }) {
  if (projects.length === 0) return null;

  return (
    <section className="border-t border-white/10 bg-[var(--background-primary)] py-14 sm:py-16 lg:py-24" aria-labelledby="related-projects-heading">
      <div className="mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12 2xl:px-16">
        <div className="flex items-end justify-between gap-6 border-b border-white/10 pb-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">More work</p>
            <h2 id="related-projects-heading" className="mt-3 font-display text-[clamp(2rem,3.2vw,3.25rem)] font-semibold leading-none tracking-[-0.045em] text-[var(--text-primary)]">Related Projects</h2>
          </div>
          <Link href="/portfolio" className="hidden items-center gap-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--accent-hover)] sm:inline-flex">View all work <ArrowUpRight size={16} aria-hidden /></Link>
        </div>

        <div className="mt-8 grid gap-7 md:grid-cols-3">
          {projects.map(({ project, category }) => {
            const imageUrl = project.thumbnailUrl || project.posterUrl;
            const alt = project.thumbnailAlt || `${project.title} — video thumbnail by Lucky Saroj`;
            const portrait = project.videoOrientation === "portrait";
            const playable = Boolean(project.videoUrl && getVideoSource(project.videoUrl));
            const banner = (
              <div className="relative aspect-video w-full overflow-hidden rounded-[10px] border border-white/10 bg-[var(--surface-primary)]">
                {imageUrl ? (
                  canUseOptimizedImage(imageUrl) ? (
                    <>
                      {portrait ? <Image src={imageUrl} alt="" aria-hidden fill sizes="(max-width: 767px) 100vw, 33vw" className="scale-110 object-cover object-center opacity-45 blur-xl" /> : null}
                      <Image src={imageUrl} alt={alt} fill sizes="(max-width: 767px) 100vw, 33vw" className={`${portrait ? "object-contain" : "object-cover"} object-center transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.01]`} />
                    </>
                  ) : (
                    <>
                      {portrait ? <div aria-hidden className="absolute -inset-4 scale-110 bg-cover bg-center bg-no-repeat opacity-45 blur-xl" style={{ backgroundImage: `url('${imageUrl}')` }} /> : null}
                      <div role="img" aria-label={alt} className={`absolute inset-0 bg-center bg-no-repeat transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.01] ${portrait ? "bg-contain" : "bg-cover"}`} style={{ backgroundImage: `url('${imageUrl}')` }} />
                    </>
                  )
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,var(--accent-glow),transparent_34%),linear-gradient(145deg,var(--surface-elevated),var(--background-primary))]" aria-hidden />
                )}
                {playable && <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/65 text-white shadow-lg backdrop-blur-sm"><Play size={18} fill="currentColor" className="ml-0.5" /></span>}
              </div>
            );

            return (
              <article key={project.id} className="group min-w-0">
                <Link href={`/portfolio/${project.slug}`} className="group block rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]" aria-label={playable ? `Open ${project.title} project and video` : `Open ${project.title} project`}>
                  {banner}
                </Link>
                <Link href={`/portfolio/${project.slug}`} className="flex items-start justify-between gap-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]">
                  <div className="min-w-0">
                    {category?.name && <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent-primary)]">{category.name}</p>}
                    <h3 className="mt-2 break-words font-display text-xl font-semibold tracking-[-0.03em] text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-hover)]">{project.title}</h3>
                  </div>
                  <ArrowUpRight size={18} aria-hidden className="mt-1 shrink-0 text-[var(--accent-primary)] transition-transform duration-300 motion-reduce:transition-none group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
