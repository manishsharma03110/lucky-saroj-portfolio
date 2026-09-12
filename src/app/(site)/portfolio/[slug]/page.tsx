import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy, ProjectOverview, ProjectTools } from "@/components/portfolio/detail/CaseStudy";
import { ProjectCTA } from "@/components/portfolio/detail/ProjectCTA";
import { ProjectHero } from "@/components/portfolio/detail/ProjectHero";
import { ProjectGallery, ProjectMedia } from "@/components/portfolio/detail/ProjectMedia";
import { ProjectNavigation } from "@/components/portfolio/detail/ProjectNavigation";
import { PageMotionBoundary } from "@/components/ui/PageMotionBoundary";
import { getAdjacentProjects, getProjectBySlug, getSiteSettings } from "@/lib/db/queries";
import { getPageContent } from "@/lib/db/page-content-service";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [data, settings] = await Promise.all([getProjectBySlug(slug), getSiteSettings()]);
  if (!data || data.project.status !== "published") return { robots: { index: false, follow: false } };

  const title = data.project.seoTitle ?? data.project.title;
  const description = data.project.seoDescription ?? data.project.description ?? `Watch ${data.project.title}, a video editing project by Lucky Saroj.`;
  const keywords = [data.project.title, data.category?.name, data.project.clientName, data.project.year ? String(data.project.year) : null, "video editing", "Lucky Saroj"].filter((value): value is string => Boolean(value));
  return createPageMetadata({ title, description, path: `/portfolio/${data.project.slug}`, image: data.project.thumbnailUrl ?? data.project.posterUrl ?? settings?.ogImageUrl, keywords, robotsIndex: true });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [data, portfolioPage] = await Promise.all([getProjectBySlug(slug), getPageContent("portfolio")]);
  if (!data || data.project.status !== "published") notFound();

  const { project, category, tools, media } = data;
  const { prev, next } = await getAdjacentProjects(slug);
  const copy = portfolioPage.content;
  const detailCopy = { overviewEyebrow: copy.detailOverviewEyebrow, clientLabel: copy.detailClientLabel, categoryLabel: copy.detailCategoryLabel, yearLabel: copy.detailYearLabel, caseStudyEyebrow: copy.detailCaseStudyEyebrow, challengeLabel: copy.detailChallengeLabel, approachLabel: copy.detailApproachLabel, resultLabel: copy.detailResultLabel, toolsEyebrow: copy.detailToolsEyebrow, toolsHeading: copy.detailToolsHeading, toolsAriaLabel: copy.detailToolsAriaLabel };
  const mediaCopy = { selectedProjectLabel: copy.detailSelectedProjectLabel, mediaEyebrow: copy.detailMediaEyebrow, mediaHeading: copy.detailMediaHeading, previewAltSuffix: copy.detailPreviewAltSuffix, mediaAltSuffix: copy.detailMediaAltSuffix };

  return (
    <PageMotionBoundary className="bg-[var(--background-primary)] text-[var(--text-primary)]">
      <ProjectHero project={project} categoryName={category?.name} />
      <ProjectMedia project={project} categoryName={category?.name} media={media} copy={mediaCopy} />
      <ProjectOverview project={project} categoryName={category?.name} copy={detailCopy} />
      <CaseStudy project={project} copy={detailCopy} />
      <ProjectGallery project={project} media={media} copy={mediaCopy} />
      <ProjectTools tools={tools} copy={detailCopy} />
      <ProjectNavigation previous={prev} next={next} ariaLabel={copy.detailNavigationAriaLabel} previousLabel={copy.detailPreviousLabel} nextLabel={copy.detailNextLabel} />
      <ProjectCTA eyebrow={copy.detailCtaEyebrow} heading={copy.detailCtaHeading} description={copy.detailCtaDescription} primaryLabel={copy.detailCtaPrimaryLabel} primaryUrl={copy.detailCtaPrimaryUrl} secondaryLabel={copy.detailCtaSecondaryLabel} secondaryUrl={copy.detailCtaSecondaryUrl} />
    </PageMotionBoundary>
  );
}
