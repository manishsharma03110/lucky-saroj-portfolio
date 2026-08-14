import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { getPublishedProjects } from "@/lib/db/queries";

export async function SelectedWork() {
  const projects = await getPublishedProjects({ featuredOnly: true, limit: 4 });

  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="timecode mb-3">00:01:24:10 — SELECTED WORK</p>
            <h2 className="font-display text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
              Some of my recent projects
            </h2>
          </div>
          <Button href="/portfolio" variant="secondary">
            View All Projects
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map(({ project, category }) => (
            <ProjectCard key={project.id} project={project} categoryName={category?.name} />
          ))}
        </div>

        {projects.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]">
            No featured projects yet —{" "}
            <Link href="/admin/portfolio/new" className="underline">
              add one from the CMS
            </Link>
            .
          </p>
        )}
      </Container>
    </section>
  );
}
