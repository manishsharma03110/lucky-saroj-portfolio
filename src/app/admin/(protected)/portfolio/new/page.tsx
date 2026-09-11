import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import styles from "@/components/admin/AdminEditorial.module.css";

export const metadata: Metadata = { title: "Add New Project" };

export default async function NewProjectPage() {
  await requirePermission("portfolio.create").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });

  const categories = await db.select().from(schema.portfolioCategories).orderBy(schema.portfolioCategories.displayOrder);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Portfolio"
        title="Add New Project"
        description="Create a new portfolio project with media, project details, and SEO metadata."
      />
      <div className={styles.singleColumn}>
        <ProjectForm categories={categories} />
      </div>
    </div>
  );
}
