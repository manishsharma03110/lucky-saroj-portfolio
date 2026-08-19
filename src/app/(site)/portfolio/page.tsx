import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { CategoryFilter } from "@/components/portfolio/CategoryFilter";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { CTA } from "@/components/home/CTA";
import { getCategories, getPublishedProjects } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Portfolio" };

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const categories = await getCategories();
  const projects = await getPublishedProjects({ categorySlug: category });

  return (
    <>
      <section className="py-16 md:py-20">
        <Container>
          <p className="timecode mb-4">MY WORK</p>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h1 className="font-display text-4xl font-bold text-[var(--color-ink)] sm:text-5xl">
              Featured Projects
            </h1>
            <Suspense fallback={null}>
              <CategoryFilter categories={categories} />
            </Suspense>
          </div>
        </Container>
      </section>

      <section className="pb-20 md:pb-28">
        <Container>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map(({ project, category: cat }) => (
                <ProjectCard key={project.id} project={project} categoryName={cat?.name} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">No projects in this category yet.</p>
          )}
        </Container>
      </section>

      <CTA />
    </>
  );
}
