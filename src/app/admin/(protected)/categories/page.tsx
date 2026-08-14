import type { Metadata } from "next";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await db.select().from(schema.portfolioCategories).orderBy(schema.portfolioCategories.displayOrder);

  return (
    <div>
      <AdminPageHeader title="Portfolio Categories" description="Organize your projects into categories" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-line)] bg-[var(--color-paper-dim)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3 font-medium text-[var(--color-ink)]">{c.name}</td>
                  <td className="px-5 py-3 text-[var(--color-muted)]">{c.slug}</td>
                  <td className="px-5 py-3 text-right">
                    <DeleteCategoryButton id={c.id} name={c.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-[var(--color-muted)]">No categories yet.</p>
          )}
        </div>

        <CategoryForm />
      </div>
    </div>
  );
}
