import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { PortfolioRowActions, DeleteProjectButton } from "@/components/admin/PortfolioRowActions";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";

export const metadata: Metadata = { title: "Manage Portfolio" };

export default async function AdminPortfolioListPage() {
  await requirePermission("portfolio.read").catch((error) => { if (error instanceof AuthorizationError) notFound(); throw error; });
  const rows = await db
    .select({ project: schema.portfolioProjects, category: schema.portfolioCategories })
    .from(schema.portfolioProjects)
    .leftJoin(schema.portfolioCategories, eq(schema.portfolioProjects.categoryId, schema.portfolioCategories.id))
    .orderBy(schema.portfolioProjects.displayOrder);

  return (
    <div>
      <AdminPageHeader
        title="All Projects"
        description={`${rows.length} project${rows.length === 1 ? "" : "s"} in your portfolio`}
        action={
          <Button href="/admin/portfolio/new" className="gap-2">
            <Plus size={16} /> Add New Project
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--color-line)] bg-[var(--color-paper-dim)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
            <tr>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Year</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Featured</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {rows.map(({ project, category }) => (
              <tr key={project.id}>
                <td className="px-5 py-3 font-medium text-[var(--color-ink)]">{project.title}</td>
                <td className="px-5 py-3 text-[var(--color-muted)]">{category?.name ?? "—"}</td>
                <td className="px-5 py-3 text-[var(--color-muted)]">{project.year ?? "—"}</td>
                <td className="px-5 py-3">
                  <span
                    className={
                      "rounded-full px-2.5 py-1 text-xs font-medium " +
                      (project.status === "published"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-neutral-100 text-neutral-500")
                    }
                  >
                    {project.status === "published" ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <PortfolioRowActions id={project.id} isFeatured={project.isFeatured} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/portfolio/${project.slug}`}
                      target="_blank"
                      className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-paper-dim)]"
                      aria-label="View live"
                    >
                      <ExternalLink size={15} />
                    </Link>
                    <Link
                      href={`/admin/portfolio/${project.id}/edit`}
                      className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-paper-dim)]"
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
          <p className="px-5 py-8 text-center text-sm text-[var(--color-muted)]">
            No projects yet. Add your first project to get started.
          </p>
        )}
      </div>
    </div>
  );
}
