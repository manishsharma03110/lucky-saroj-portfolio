import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CategoryFilter } from "@/components/portfolio/CategoryFilter";
import { PortfolioCTA } from "@/components/portfolio/PortfolioCTA";
import { PortfolioHero } from "@/components/portfolio/PortfolioHero";
import { hasUsableVisual, ProjectCard } from "@/components/portfolio/ProjectCard";
import { getCategories, getProjectBySlug, getPublishedProjects } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Portfolio" };

const COLLECTION_LAYOUTS = ["lg:col-span-7", "lg:col-span-5 lg:pt-20", "lg:col-span-5", "lg:col-span-7 lg:pt-14"] as const;

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [categories, projects] = await Promise.all([getCategories(), getPublishedProjects({ categorySlug: category })]);
  const activeCategory = categories.find((item) => item.slug === category);
  const projectsWithMedia = await Promise.all(projects.map(async (entry) => {
    const detail = await getProjectBySlug(entry.project.slug);
    const galleryImage = detail?.media.find((item) => item.type === "image" && hasUsableVisual(item.url));
    return { ...entry, galleryImageUrl: galleryImage?.url ?? null };
  }));
  const featuredIndex = projectsWithMedia.findIndex(({ project }) => project.isFeatured);
  const featured = projectsWithMedia[featuredIndex >= 0 ? featuredIndex : 0];
  const collection = featured ? projectsWithMedia.filter(({ project }) => project.id !== featured.project.id) : [];
  const hasCaseStudy = Boolean(featured?.project.description && (featured.project.challenge || featured.project.approach || featured.project.result));

  return (
    <main className="overflow-hidden bg-[var(--background-primary)] text-[var(--text-primary)]">
      <PortfolioHero projectCount={projects.length} categoryName={activeCategory?.name} />

      <section className="border-b border-white/10 bg-[var(--background-primary)] py-5 sm:py-6">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12">
          <Suspense fallback={null}><CategoryFilter categories={categories} /></Suspense>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12">
          {featured ? (
            <>
              <ProjectCard project={featured.project} categoryName={featured.category?.name} mediaUrl={featured.galleryImageUrl} layout="featured" />

              {collection.length > 0 && (
                <div className="pt-16 sm:pt-20 lg:pt-24">
                  <div className="flex items-end justify-between gap-6 border-b border-white/10 pb-6"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">Project collection</p><h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] sm:text-4xl">More selected work.</h2></div><p className="hidden text-sm text-[var(--text-muted)] sm:block">{collection.length} {collection.length === 1 ? "project" : "projects"}</p></div>
                  <div className="grid grid-cols-1 gap-x-8 gap-y-11 pt-10 sm:gap-y-13 lg:grid-cols-12">
                    {collection.map(({ project, category: projectCategory }, index) => {
                      const wide = index % 4 === 0 || index % 4 === 3;
                      return <div key={project.id} className={COLLECTION_LAYOUTS[index % COLLECTION_LAYOUTS.length]}><ProjectCard project={project} categoryName={projectCategory?.name} mediaUrl={collection[index].galleryImageUrl} layout={wide ? "wide" : "standard"} /></div>;
                    })}
                  </div>
                </div>
              )}

              {hasCaseStudy && (
                <aside className="mt-16 border-y border-white/10 bg-[var(--surface-primary)] px-6 py-9 sm:mt-20 sm:px-8 sm:py-11 lg:mt-24 lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] lg:items-end lg:gap-12 lg:px-10">
                  <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">Featured case study</p><p className="mt-3 text-sm text-[var(--text-muted)]">{[featured.category?.name, featured.project.clientName, featured.project.year].filter(Boolean).join(" · ")}</p></div>
                  <div className="mt-6 lg:mt-0"><h2 className="font-display text-3xl font-semibold leading-none tracking-[-0.04em] text-[var(--text-primary)] sm:text-4xl">{featured.project.title}</h2><p className="mt-4 line-clamp-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{featured.project.description}</p></div>
                  <Link href={`/portfolio/${featured.project.slug}`} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] lg:mt-0">View case study <ArrowUpRight size={17} aria-hidden /></Link>
                </aside>
              )}
            </>
          ) : (
            <div className="border-b border-white/10 py-12 sm:py-16"><h2 className="font-display text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] sm:text-4xl">No projects here yet.</h2><p className="mt-4 max-w-lg text-base leading-7 text-[var(--text-secondary)]">{category ? "No published work matches this category at the moment." : "Published work will appear here when it is available."}</p></div>
          )}
        </div>
      </section>

      <PortfolioCTA />
    </main>
  );
}
