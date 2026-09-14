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

  const [categories, availableProjects] = await Promise.all([
    db.select().from(schema.portfolioCategories).orderBy(schema.portfolioCategories.displayOrder),
    db.select({ id: schema.portfolioProjects.id, title: schema.portfolioProjects.title, status: schema.portfolioProjects.status }).from(schema.portfolioProjects).orderBy(schema.portfolioProjects.title),
  ]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Portfolio"
        title="Add New Project"
        description="Create a new portfolio project with media, project details, internal links, and SEO metadata."
      />
      <div className={styles.singleColumn}>
        <ProjectForm categories={categories} availableProjects={availableProjects} />
      </div>
    </div>
  );
}
