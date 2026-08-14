import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/home/CTA";
import { getAdjacentProjects, getProjectBySlug } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProjectBySlug(slug);
  if (!data) return {};
  return {
    title: data.project.seoTitle ?? data.project.title,
    description: data.project.seoDescription ?? data.project.description ?? undefined,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProjectBySlug(slug);
  if (!data) notFound();

  const { project, category, tools } = data;
  const { prev, next } = await getAdjacentProjects(slug);

  return (
    <>
      <section className="py-10">
        <Container>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-accent)]"
          >
            <ArrowLeft size={15} /> Back to Portfolio
          </Link>
        </Container>
      </section>

      <section className="pb-16">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-[var(--color-ink)]">
            <div
              className="h-full w-full bg-cover bg-center opacity-90"
              style={{
                backgroundImage: `url('${project.thumbnailUrl || "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1200&auto=format&fit=crop"}')`,
              }}
              role="img"
              aria-label={project.title}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-[var(--color-ink)]">
                <Play size={20} fill="currentColor" />
              </span>
            </div>
          </div>

          <aside className="space-y-6">
            <div>
              <p className="timecode mb-1">CLIENT</p>
              <p className="text-sm text-[var(--color-ink)]">{project.clientName ?? "—"}</p>
            </div>
            <div>
              <p className="timecode mb-1">CATEGORY</p>
              <p className="text-sm text-[var(--color-ink)]">{category?.name ?? "—"}</p>
            </div>
            <div>
              <p className="timecode mb-1">YEAR</p>
              <p className="text-sm text-[var(--color-ink)]">{project.year ?? "—"}</p>
            </div>
            {tools.length > 0 && (
              <div>
                <p className="timecode mb-2">TOOLS USED</p>
                <div className="flex flex-wrap gap-2">
                  {tools.map((t) => (
                    <span
                      key={t.id}
                      className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-medium text-[var(--color-accent)]"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          <h1 className="mb-4 font-display text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
            {project.title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--color-ink-soft)]">
            {project.description}
          </p>

          {(project.challenge || project.approach || project.result) && (
            <div className="mt-12 grid grid-cols-1 gap-8 border-t border-[var(--color-line)] pt-10 sm:grid-cols-3">
              {project.challenge && (
                <div>
                  <p className="timecode mb-2">THE CHALLENGE</p>
                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                    {project.challenge}
                  </p>
                </div>
              )}
              {project.approach && (
                <div>
                  <p className="timecode mb-2">MY APPROACH</p>
                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                    {project.approach}
                  </p>
                </div>
              )}
              {project.result && (
                <div>
                  <p className="timecode mb-2">THE RESULT</p>
                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                    {project.result}
                  </p>
                </div>
              )}
            </div>
          )}
        </Container>
      </section>

      <section className="border-t border-[var(--color-line)] py-8">
        <Container className="flex items-center justify-between">
          {prev ? (
            <Link
              href={`/portfolio/${prev.slug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-accent)]"
            >
              <ArrowLeft size={15} /> Previous Project
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/portfolio/${next.slug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-accent)]"
            >
              Next Project <ArrowRight size={15} />
            </Link>
          )}
        </Container>
      </section>

      <CTA />
    </>
  );
}
