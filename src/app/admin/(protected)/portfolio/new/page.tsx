import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";

export const metadata: Metadata = { title: "Add New Project" };

export default async function NewProjectPage() {
  await requirePermission("portfolio.create").catch((error) => { if (error instanceof AuthorizationError) notFound(); throw error; });
  const categories = await db.select().from(schema.portfolioCategories).orderBy(schema.portfolioCategories.displayOrder);

  return (
    <div>
      <AdminPageHeader title="Add New Project" description="Create a new portfolio project" />
      <ProjectForm categories={categories} />
    </div>
  );
}
