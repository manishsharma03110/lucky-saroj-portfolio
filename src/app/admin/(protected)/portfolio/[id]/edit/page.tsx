import type { Metadata } from "next";
import { eq, ne, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ProjectMediaSeoForm, type ProjectMediaSeoItem } from "@/components/admin/ProjectMediaSeoForm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import styles from "@/components/admin/AdminEditorial.module.css";

export const metadata: Metadata = { title: "Edit Project" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("portfolio.update").catch((error) => { if (error instanceof AuthorizationError) notFound(); throw error; });
  const { id } = await params;
  const projectRows = await db.select().from(schema.portfolioProjects).where(eq(schema.portfolioProjects.id, id));
  const project = projectRows[0]; if (!project) notFound();
  const [tools, categories, availableProjects, relatedRows, mediaReferences, mediaRows] = await Promise.all([
    db.select().from(schema.projectTools).where(eq(schema.projectTools.projectId, id)),
    db.select().from(schema.portfolioCategories).orderBy(schema.portfolioCategories.displayOrder),
    db.select({ id: schema.portfolioProjects.id, title: schema.portfolioProjects.title, status: schema.portfolioProjects.status }).from(schema.portfolioProjects).where(ne(schema.portfolioProjects.id, id)).orderBy(schema.portfolioProjects.title),
    db.execute<{ relatedProjectId: string }>(sql`SELECT related_project_id AS "relatedProjectId" FROM project_related_projects WHERE project_id=${id} ORDER BY display_order`),
    db.select({ slot: schema.mediaAssetReferences.slot, assetId: schema.mediaAssetReferences.assetId }).from(schema.mediaAssetReferences).where(eq(schema.mediaAssetReferences.portfolioProjectId, id)),
    db.execute<ProjectMediaSeoItem>(sql`SELECT id,url,type,display_order AS "displayOrder",alt_text AS "altText",title,description FROM project_media WHERE project_id=${id} ORDER BY display_order`),
  ]);
  const mediaAssetIds = Object.fromEntries(mediaReferences.map((reference) => [reference.slot, reference.assetId]));
  const relatedProjectIds = relatedRows.rows.map((row) => row.relatedProjectId);
  return <div><AdminPageHeader eyebrow="Portfolio" title="Edit Project" description={project.title} /><div className={styles.singleColumn}><ProjectForm project={project} tools={tools} categories={categories} mediaAssetIds={mediaAssetIds} availableProjects={availableProjects} relatedProjectIds={relatedProjectIds} /><ProjectMediaSeoForm projectId={project.id} projectSlug={project.slug} media={mediaRows.rows} /></div></div>;
}
