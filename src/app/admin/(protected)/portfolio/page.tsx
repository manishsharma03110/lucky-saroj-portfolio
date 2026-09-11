import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PortfolioRowActions, DeleteProjectButton } from "@/components/admin/PortfolioRowActions";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import styles from "@/components/admin/AdminContent.module.css";

export const metadata: Metadata = { title: "Manage Portfolio" };

export default async function AdminPortfolioListPage() {
  await requirePermission("portfolio.read").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });

  const rows = await db
    .select({ project: schema.portfolioProjects, category: schema.portfolioCategories })
    .from(schema.portfolioProjects)
    .leftJoin(schema.portfolioCategories, eq(schema.portfolioProjects.categoryId, schema.portfolioCategories.id))
    .orderBy(schema.portfolioProjects.displayOrder);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Portfolio"
        title="All Projects"
        description={`${rows.length} project${rows.length === 1 ? "" : "s"} in your portfolio`}
        action={
          <Link href="/admin/portfolio/new" className={styles.primaryAction}>
            <Plus size={16} />
            <span>Add project</span>
          </Link>
        }
      />

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Year</th>
              <th>Status</th>
              <th>Featured</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ project, category }) => (
              <tr key={project.id}>
                <td data-label="Title" className={styles.tableTitle}>{project.title}</td>
                <td data-label="Category">{category?.name ?? "—"}</td>
                <td data-label="Year">{project.year ?? "—"}</td>
                <td data-label="Status">
                  <span className={project.status === "published" ? styles.statusPublished : styles.statusDraft}>
                    {project.status === "published" ? "Published" : "Draft"}
                  </span>
                </td>
                <td data-label="Featured">
                  <PortfolioRowActions id={project.id} isFeatured={project.isFeatured} revision={project.revision} />
                </td>
                <td data-label="Actions">
                  <div className={styles.actionGroup}>
                    <Link
                      href={`/portfolio/${project.slug}`}
                      target="_blank"
                      className={styles.iconAction}
                      aria-label="View live"
                    >
                      <ExternalLink size={15} />
                    </Link>
                    <Link
                      href={`/admin/portfolio/${project.id}/edit`}
                      className={styles.iconAction}
                      aria-label="Edit"
                    >
                      <Pencil size={15} />
                    </Link>
                    <DeleteProjectButton id={project.id} title={project.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className={styles.emptyState}>No projects yet. Add your first project to get started.</div>
        )}
      </div>
    </div>
  );
}
