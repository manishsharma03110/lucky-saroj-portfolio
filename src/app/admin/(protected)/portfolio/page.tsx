import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PortfolioRowActions, DeleteProjectButton } from "@/components/admin/PortfolioRowActions";
import { PageContentForm } from "@/components/admin/PageContentForm";
import { PageSeoForm } from "@/components/admin/PageSeoForm";
import { PageEditorTabs } from "@/components/admin/PageEditorTabs";
import { getPageContent } from "@/lib/db/page-content-service";
import { getPageSeo } from "@/lib/db/page-seo-service";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import styles from "@/components/admin/AdminContent.module.css";
import editorialStyles from "@/components/admin/AdminEditorial.module.css";

export const metadata: Metadata = { title: "Complete Portfolio Page CMS & Project Manager" };

export default async function AdminPortfolioPage() {
  await requirePermission("portfolio.read").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });

  const [rows, page, seo] = await Promise.all([
    db
      .select({ project: schema.portfolioProjects, category: schema.portfolioCategories })
      .from(schema.portfolioProjects)
      .leftJoin(schema.portfolioCategories, eq(schema.portfolioProjects.categoryId, schema.portfolioCategories.id))
      .orderBy(schema.portfolioProjects.displayOrder),
    getPageContent("portfolio"),
    getPageSeo("portfolio"),
  ]);

  const content = (
    <div className={editorialStyles.singleColumn}>
      <PageContentForm pageKey="portfolio" content={page.content} revision={page.revision} />
      <section className={styles.tableCard} aria-labelledby="portfolio-projects-heading">
        <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="portfolio-projects-heading" className="text-lg font-semibold text-[var(--text-primary)]">Portfolio Projects</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Add, edit, publish, feature or remove portfolio projects. Existing project data is preserved during edits.</p>
          </div>
          <Link href="/admin/portfolio/new" className={styles.primaryAction}><Plus size={16} /><span>Add New Project</span></Link>
        </div>
        <table className={styles.table}>
          <thead><tr><th>Title</th><th>Category</th><th>Year</th><th>Status</th><th>Featured</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
          <tbody>
            {rows.map(({ project, category }) => (
              <tr key={project.id}>
                <td data-label="Title" className={styles.tableTitle}>{project.title}</td>
                <td data-label="Category">{category?.name ?? "—"}</td>
                <td data-label="Year">{project.year ?? "—"}</td>
                <td data-label="Status"><span className={project.status === "published" ? styles.statusPublished : styles.statusDraft}>{project.status === "published" ? "Published" : "Draft"}</span></td>
                <td data-label="Featured"><PortfolioRowActions id={project.id} isFeatured={project.isFeatured} revision={project.revision} /></td>
                <td data-label="Actions"><div className={styles.actionGroup}>
                  <Link href={`/portfolio/${project.slug}`} target="_blank" className={styles.iconAction} aria-label={`View ${project.title} live`}><ExternalLink size={15} /></Link>
                  <Link href={`/admin/portfolio/${project.id}/edit`} className={styles.iconAction} aria-label={`Edit ${project.title}`}><Pencil size={15} /></Link>
                  <DeleteProjectButton id={project.id} title={project.title} />
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className={styles.emptyState}>No projects yet. Add your first project to get started.</div>}
      </section>
    </div>
  );

  return (
    <div>
      <AdminPageHeader
        eyebrow="Page editor"
        title="Edit Portfolio"
        description="Manage Portfolio page content, projects and page-specific SEO in one place. Public layout and design stay unchanged."
        action={<Link href="/portfolio" target="_blank" className={styles.primaryAction}><ExternalLink size={16} /><span>View Portfolio Page</span></Link>}
      />
      <PageEditorTabs content={content} seo={<PageSeoForm seo={seo} />} />
    </div>
  );
}
