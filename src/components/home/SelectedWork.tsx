import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { WorkCard } from "@/components/home/WorkCard";
import { getPublishedProjects } from "@/lib/db/queries";

export async function SelectedWork() {
  const projects = await getPublishedProjects({ featuredOnly: true, limit: 5 });
  const [featured, ...rest] = projects;

  return (
    <Section spacing="lg" className="bg-[var(--cine-void)]">
      <Container>
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="00:01:24:10 — SELECTED WORK"
            title="Recent projects"
            className="mb-0"
          />
          <Button href="/portfolio" variant="cine-outline" withArrow className="!rounded-md">
            View All Work
          </Button>
        </div>

        {featured && (
          <div className="mb-12">
            <WorkCard project={featured.project} categoryName={featured.category?.name} size="large" />
          </div>
        )}

        {rest.length > 0 && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {rest.map(({ project, category }) => (
              <WorkCard key={project.id} project={project} categoryName={category?.name} />
            ))}
          </div>
        )}

        {projects.length === 0 && (
          <p className="cine-body text-sm">
            No featured projects yet —{" "}
            <Link href="/admin/portfolio/new" className="underline">
              add one from the CMS
            </Link>
            .
          </p>
        )}
      </Container>
    </Section>
  );
}
