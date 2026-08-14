import { db, schema } from "./index";
import { and, desc, eq } from "drizzle-orm";

export async function getSiteSettings() {
  const rows = await db.select().from(schema.siteSettings);
  return rows[0];
}

export async function getAboutProfile() {
  const rows = await db.select().from(schema.aboutProfile);
  return rows[0];
}

export async function getAboutSkills() {
  return db
    .select()
    .from(schema.aboutSkills)
    .orderBy(schema.aboutSkills.displayOrder);
}

export async function getAboutTools() {
  return db
    .select()
    .from(schema.aboutTools)
    .orderBy(schema.aboutTools.displayOrder);
}

export async function getExperiences() {
  return db
    .select()
    .from(schema.experiences)
    .orderBy(schema.experiences.displayOrder);
}

export async function getServices(featuredOnly = false) {
  return db
    .select()
    .from(schema.services)
    .where(
      featuredOnly
        ? and(eq(schema.services.isActive, true), eq(schema.services.isFeatured, true))
        : eq(schema.services.isActive, true)
    )
    .orderBy(schema.services.displayOrder);
}

export async function getCategories() {
  return db
    .select()
    .from(schema.portfolioCategories)
    .orderBy(schema.portfolioCategories.displayOrder);
}

export async function getPublishedProjects(opts?: { featuredOnly?: boolean; categorySlug?: string; limit?: number }) {
  const rows = await db
    .select({
      project: schema.portfolioProjects,
      category: schema.portfolioCategories,
    })
    .from(schema.portfolioProjects)
    .leftJoin(schema.portfolioCategories, eq(schema.portfolioProjects.categoryId, schema.portfolioCategories.id))
    .where(eq(schema.portfolioProjects.status, "published"))
    .orderBy(schema.portfolioProjects.displayOrder, desc(schema.portfolioProjects.year));

  let filtered = rows;
  if (opts?.featuredOnly) filtered = filtered.filter((r) => r.project.isFeatured);
  if (opts?.categorySlug && opts.categorySlug !== "all") {
    filtered = filtered.filter((r) => r.category?.slug === opts.categorySlug);
  }
  if (opts?.limit) filtered = filtered.slice(0, opts.limit);
  return filtered;
}

export async function getProjectBySlug(slug: string) {
  const projectRows = await db
    .select()
    .from(schema.portfolioProjects)
    .where(eq(schema.portfolioProjects.slug, slug));
  const project = projectRows[0];
  if (!project) return null;

  const category = project.categoryId
    ? (await db.select().from(schema.portfolioCategories).where(eq(schema.portfolioCategories.id, project.categoryId)))[0] ?? null
    : null;

  const tools = await db
    .select()
    .from(schema.projectTools)
    .where(eq(schema.projectTools.projectId, project.id));

  const media = await db
    .select()
    .from(schema.projectMedia)
    .where(eq(schema.projectMedia.projectId, project.id))
    .orderBy(schema.projectMedia.displayOrder);

  return { project, category, tools, media };
}

export async function getAdjacentProjects(currentSlug: string) {
  const published = await db
    .select()
    .from(schema.portfolioProjects)
    .where(eq(schema.portfolioProjects.status, "published"))
    .orderBy(schema.portfolioProjects.displayOrder);
  const idx = published.findIndex((p) => p.slug === currentSlug);
  if (idx === -1) return { prev: null, next: null };
  const prev = idx > 0 ? published[idx - 1] : published[published.length - 1];
  const next = idx < published.length - 1 ? published[idx + 1] : published[0];
  return { prev, next };
}

export async function getFeaturedShowreel() {
  const rows = await db
    .select()
    .from(schema.showreels)
    .where(and(eq(schema.showreels.isFeatured, true), eq(schema.showreels.status, "published")));
  return rows[0];
}

export async function getPublishedTestimonials(featuredOnly = false) {
  return db
    .select()
    .from(schema.testimonials)
    .where(
      featuredOnly
        ? and(eq(schema.testimonials.status, "published"), eq(schema.testimonials.isFeatured, true))
        : eq(schema.testimonials.status, "published")
    )
    .orderBy(desc(schema.testimonials.createdAt));
}
