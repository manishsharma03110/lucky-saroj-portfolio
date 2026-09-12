import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import styles from "@/components/admin/AdminContent.module.css";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await requirePermission("categories.read").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });

  const categories = await db.select().from(schema.portfolioCategories).orderBy(schema.portfolioCategories.displayOrder);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Portfolio"
        title="Portfolio Categories"
        description="Organize projects with a clear, reusable category structure."
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,0.9fr)]">
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <colgroup>
              <col className="w-[38%]" />
              <col className="w-[42%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td data-label="Name" className={styles.tableTitle}>{category.name}</td>
                  <td data-label="Slug"><span className={styles.slug}>{category.slug}</span></td>
                  <td data-label="Actions">
                    <div className={styles.actionGroup}>
                      <DeleteCategoryButton id={category.id} name={category.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {categories.length === 0 && (
            <div className={styles.emptyState}>No categories yet. Create one to organize your portfolio.</div>
          )}
        </div>

        <div className="w-full xl:max-w-[420px] xl:justify-self-end">
          <CategoryForm />
        </div>
      </div>
    </div>
  );
}
