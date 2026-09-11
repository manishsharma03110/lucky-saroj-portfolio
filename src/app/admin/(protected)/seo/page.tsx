import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PageSeoForm } from "@/components/admin/PageSeoForm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import { getAllPageSeo } from "@/lib/db/page-seo-service";

export const metadata: Metadata = { title: "SEO" };

export default async function AdminSeoPage() {
  await requirePermission("settings.read").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });

  const pages = await getAllPageSeo();
  return (
    <div>
      <AdminPageHeader
        eyebrow="Search & Sharing"
        title="On-Page SEO"
        description="Control page titles, descriptions, canonicals, social metadata, keywords and indexability without changing the public design."
      />
      <div className="space-y-12">
        {pages.map((seo) => <PageSeoForm key={seo.pageKey} seo={seo} />)}
      </div>
    </div>
  );
}
