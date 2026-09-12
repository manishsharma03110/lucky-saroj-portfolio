import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HomeContentForm } from "@/components/admin/HomeContentForm";
import { getHomePageContent } from "@/lib/db/home-content-service";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";

export const metadata: Metadata = { title: "Homepage Content" };

export default async function AdminHomePage() {
  await requirePermission("settings.read").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });
  const content = await getHomePageContent();
  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="Homepage Content"
        description="Edit homepage section headings, descriptions and CTA labels without changing the approved public design."
      />
      <HomeContentForm content={content} />
    </div>
  );
}
