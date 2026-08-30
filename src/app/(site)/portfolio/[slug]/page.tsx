import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy, ProjectOverview, ProjectTools } from "@/components/portfolio/detail/CaseStudy";
import { ProjectCTA } from "@/components/portfolio/detail/ProjectCTA";
import { ProjectHero } from "@/components/portfolio/detail/ProjectHero";
import { ProjectGallery, ProjectMedia } from "@/components/portfolio/detail/ProjectMedia";
import { ProjectNavigation } from "@/components/portfolio/detail/ProjectNavigation";
import { getAdjacentProjects, getProjectBySlug } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProjectBySlug(slug);
  if (!data || data.project.status !== "published") return {};
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
  if (!data || data.project.status !== "published") notFound();

  const { project, category, tools, media } = data;
  const { prev, next } = await getAdjacentProjects(slug);

  return (
    <>
      <ProjectHero project={project} categoryName={category?.name} />
      <ProjectMedia project={project} categoryName={category?.name} media={media} />
      <ProjectOverview project={project} categoryName={category?.name} />
      <CaseStudy project={project} />
      <ProjectGallery project={project} media={media} />
      <ProjectTools tools={tools} />
      <ProjectNavigation previous={prev} next={next} />
      <ProjectCTA />
    </>
  );
}
