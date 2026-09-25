import { cache } from "react";
import { db, schema } from "./index";
import { and, desc, eq, sql } from "drizzle-orm";
import { normalizeVideoOrientation, type VideoOrientation } from "@/lib/media/video";

export type ProjectMediaWithSeo = { id: string; projectId: string; url: string; type: "image" | "video"; displayOrder: number; altText: string | null; title: string | null; description: string | null };
export type PortfolioProjectWithVideo = typeof schema.portfolioProjects.$inferSelect & { videoOrientation: VideoOrientation };

export const getSiteSettings = cache(async function getSiteSettings() { const rows = await db.select().from(schema.siteSettings); return rows[0]; });
export async function getSiteBranding() { const rows = await db.select({ logoImageUrl: sql<string | null>`logo_image_url` }).from(schema.siteSettings); return rows[0] ?? { logoImageUrl: null }; }
export async function getAboutProfile() { const rows = await db.select().from(schema.aboutProfile); return rows[0]; }
export async function getAboutSkills() { return db.select().from(schema.aboutSkills).orderBy(schema.aboutSkills.displayOrder); }
export async function getAboutTools() { return db.select().from(schema.aboutTools).orderBy(schema.aboutTools.displayOrder); }
export async function getExperiences() { return db.select().from(schema.experiences).orderBy(schema.experiences.displayOrder); }
export async function getServices(featuredOnly = false) { return db.select().from(schema.services).where(featuredOnly ? and(eq(schema.services.isActive, true), eq(schema.services.isFeatured, true)) : eq(schema.services.isActive, true)).orderBy(schema.services.displayOrder); }
export async function getCategories() { return db.select().from(schema.portfolioCategories).orderBy(schema.portfolioCategories.displayOrder); }

export async function getPublishedProjects(opts?: { featuredOnly?: boolean; categorySlug?: string; limit?: number }) {
  const rows = await db.select({
    project: schema.portfolioProjects,
    category: schema.portfolioCategories,
    videoOrientation: sql<VideoOrientation>`portfolio_projects.video_orientation`,
  }).from(schema.portfolioProjects)
    .leftJoin(schema.portfolioCategories, eq(schema.portfolioProjects.categoryId, schema.portfolioCategories.id))
    .where(eq(schema.portfolioProjects.status, "published"))
    .orderBy(schema.portfolioProjects.displayOrder, desc(schema.portfolioProjects.year));
  let filtered = rows.map((row) => ({
    project: { ...row.project, videoOrientation: normalizeVideoOrientation(row.videoOrientation) } as PortfolioProjectWithVideo,
    category: row.category,
  }));
  if (opts?.featuredOnly) filtered = filtered.filter((r) => r.project.isFeatured);
  if (opts?.categorySlug && opts.categorySlug !== "all") filtered = filtered.filter((r) => r.category?.slug === opts.categorySlug);
  if (opts?.limit) filtered = filtered.slice(0, opts.limit);
  return filtered;
}

export async function getRelatedProjects(projectId: string, categoryId: string | null, limit = 3) { const published = await getPublishedProjects(); const byId = new Map(published.map((entry) => [entry.project.id, entry])); const manualRows = await db.execute<{ relatedProjectId: string }>(sql`SELECT related_project_id AS "relatedProjectId" FROM project_related_projects WHERE project_id=${projectId} ORDER BY display_order`); const manual = manualRows.rows.map((row) => byId.get(row.relatedProjectId)).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)).slice(0, limit); if (manual.length) return manual; const sameCategory = categoryId ? published.filter((entry) => entry.project.id !== projectId && entry.project.categoryId === categoryId) : []; const fallback = published.filter((entry) => entry.project.id !== projectId && !sameCategory.some((candidate) => candidate.project.id === entry.project.id)); return [...sameCategory, ...fallback].slice(0, limit); }

export const getProjectBySlug = cache(async function getProjectBySlug(slug: string) {
  const [projectRows, orientationRows] = await Promise.all([
    db.select().from(schema.portfolioProjects).where(eq(schema.portfolioProjects.slug, slug)),
    db.execute<{ videoOrientation: VideoOrientation }>(sql`SELECT video_orientation AS "videoOrientation" FROM portfolio_projects WHERE slug=${slug}`),
  ]);
  const base = projectRows[0];
  if (!base) return null;
  const project = { ...base, videoOrientation: normalizeVideoOrientation(orientationRows.rows[0]?.videoOrientation) } as PortfolioProjectWithVideo;
  const category = project.categoryId ? (await db.select().from(schema.portfolioCategories).where(eq(schema.portfolioCategories.id, project.categoryId)))[0] ?? null : null;
  const [tools, mediaRows] = await Promise.all([
    db.select().from(schema.projectTools).where(eq(schema.projectTools.projectId, project.id)),
    db.execute<ProjectMediaWithSeo>(sql`SELECT id,project_id AS "projectId",url,type,display_order AS "displayOrder",alt_text AS "altText",title,description FROM project_media WHERE project_id=${project.id} ORDER BY display_order`),
  ]);
  return { project, category, tools, media: mediaRows.rows };
});

export async function getAdjacentProjects(currentSlug: string) { const published = await db.select().from(schema.portfolioProjects).where(eq(schema.portfolioProjects.status, "published")).orderBy(schema.portfolioProjects.displayOrder); const idx = published.findIndex((p) => p.slug === currentSlug); if (idx === -1) return { prev: null, next: null }; const prev = idx > 0 ? published[idx - 1] : published[published.length - 1]; const next = idx < published.length - 1 ? published[idx + 1] : published[0]; return { prev, next }; }
export async function getFeaturedShowreel() { const rows = await db.select().from(schema.showreels).where(and(eq(schema.showreels.isFeatured, true), eq(schema.showreels.status, "published"))); return rows[0]; }
export async function getPublishedTestimonials(featuredOnly = false) { return db.select().from(schema.testimonials).where(featuredOnly ? and(eq(schema.testimonials.status, "published"), eq(schema.testimonials.isFeatured, true)) : eq(schema.testimonials.status, "published")).orderBy(desc(schema.testimonials.createdAt)); }

