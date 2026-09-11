import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PageContentForm } from "@/components/admin/PageContentForm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import { getAllPageContent } from "@/lib/db/page-content-service";

export const metadata: Metadata = { title: "Page Content" };

export default async function AdminPagesPage() {
  await requirePermission("settings.read").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });
  const pages = await getAllPageContent();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="Page Content"
        description="Edit visible page headings, descriptions and CTA labels without changing the approved public layout."
      />
      <div className="space-y-12">
        {pages.map((page) => <PageContentForm key={page.pageKey} pageKey={page.pageKey} content={page.content} revision={page.revision} />)}
      </div>
    </div>
  );
}
