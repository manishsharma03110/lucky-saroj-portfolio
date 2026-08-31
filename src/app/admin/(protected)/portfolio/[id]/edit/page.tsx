import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";

export const metadata: Metadata = { title: "Edit Project" };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("portfolio.update").catch((error) => { if (error instanceof AuthorizationError) notFound(); throw error; });
  const { id } = await params;
  const projectRows = await db.select().from(schema.portfolioProjects).where(eq(schema.portfolioProjects.id, id));
  const project = projectRows[0];
  if (!project) notFound();

  const tools = await db.select().from(schema.projectTools).where(eq(schema.projectTools.projectId, id));
  const categories = await db.select().from(schema.portfolioCategories).orderBy(schema.portfolioCategories.displayOrder);

  return (
    <div>
      <AdminPageHeader title="Edit Project" description={project.title} />
      <ProjectForm project={project} tools={tools} categories={categories} />
    </div>
  );
}
