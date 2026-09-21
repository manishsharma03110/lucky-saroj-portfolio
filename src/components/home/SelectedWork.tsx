import { Button } from "@/components/ui/Button";
import { HomeSelectedWorkSlider } from "@/components/home/HomeSelectedWorkSlider";
import { getPublishedProjects } from "@/lib/db/queries";
import type { HomePageContent } from "@/lib/db/home-content-service";

export async function SelectedWork({ content }: { content: HomePageContent }) {
  const featuredProjects = await getPublishedProjects({ featuredOnly: true, limit: 6 });
  const projects = featuredProjects.length > 0
    ? featuredProjects
    : await getPublishedProjects({ limit: 6 });

  if (projects.length === 0) return null;

  const slides = projects.map(({ project, category }) => ({
    project,
    categoryName: category?.name,
  }));

  return (
    <section id="home-selected-work" className="relative scroll-mt-24 bg-[var(--background-primary)] py-14 min-[480px]:py-16 md:py-28 lg:py-32 2xl:py-36">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px max-w-[1360px] bg-gradient-to-r from-transparent via-white/12 to-transparent" aria-hidden />
      <div className="mx-auto w-full max-w-[1560px] px-[clamp(1rem,5vw,2rem)] sm:px-8 lg:px-12 2xl:px-16">
        <div className="mb-8 flex flex-col items-start gap-5 border-b border-white/10 pb-9 sm:mb-14 sm:gap-7 md:flex-row md:items-end md:justify-between lg:mb-16 2xl:mb-18">
          <div>
            <p className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)] lg:text-[0.8rem]">{content.selectedWorkEyebrow}</p>
            <h2 className="max-w-4xl font-display text-[clamp(2rem,10vw,3rem)] font-semibold leading-[0.94] tracking-[-0.052em] text-[var(--text-primary)] sm:text-[clamp(2.6rem,5vw,5.25rem)]">
              {content.selectedWorkHeading}
            </h2>
          </div>
          <Button href={content.selectedWorkCtaUrl} variant="cine-outline" withArrow className="!rounded-md !border-white/20 !px-7 !py-3.5 !text-[var(--text-primary)] hover:!border-[var(--accent-primary)] hover:!text-[var(--accent-hover)]">
            {content.selectedWorkCtaLabel}
          </Button>
        </div>

        <HomeSelectedWorkSlider slides={slides} />
      </div>
    </section>
  );
}
