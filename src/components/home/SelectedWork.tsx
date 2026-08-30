import { Button } from "@/components/ui/Button";
import { WorkCard } from "@/components/home/WorkCard";
import { getPublishedProjects } from "@/lib/db/queries";

export async function SelectedWork() {
  const featuredProjects = await getPublishedProjects({ featuredOnly: true, limit: 3 });
  const projects = featuredProjects.length > 0
    ? featuredProjects
    : await getPublishedProjects({ limit: 3 });
  const [featured, ...secondary] = projects;

  if (!featured) return null;

  return (
    <section className="bg-[var(--background-primary)] py-16 md:py-20 lg:py-28">
      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
        <div className="mb-10 flex flex-col items-start gap-7 border-b border-white/10 pb-8 sm:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">Selected work</p>
            <h2 className="max-w-3xl font-display text-[clamp(2.25rem,4.5vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--text-primary)]">
              Work built to be watched.
            </h2>
          </div>
          <Button href="/portfolio" variant="cine-outline" withArrow className="!rounded-md !border-white/20 !px-7 !py-3.5 !text-[var(--text-primary)] hover:!border-[var(--accent-primary)] hover:!text-[var(--accent-hover)]">
            View All Work
          </Button>
        </div>

        <WorkCard project={featured.project} categoryName={featured.category?.name} size="large" />

        {secondary.length > 0 && (
          <div className="mt-12 grid grid-cols-1 gap-12 md:mt-16 md:grid-cols-2 md:gap-8 lg:gap-12">
            {secondary.map(({ project, category }, index) => (
              <div key={project.id} className={index === 1 ? "md:pt-12" : undefined}>
                <WorkCard project={project} categoryName={category?.name} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
