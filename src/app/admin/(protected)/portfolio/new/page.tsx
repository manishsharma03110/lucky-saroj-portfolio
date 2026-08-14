import type { Metadata } from "next";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const metadata: Metadata = { title: "Add New Project" };

export default async function NewProjectPage() {
  const categories = await db.select().from(schema.portfolioCategories).orderBy(schema.portfolioCategories.displayOrder);

  return (
    <div>
      <AdminPageHeader title="Add New Project" description="Create a new portfolio project" />
      <ProjectForm categories={categories} />
    </div>
  );
}
