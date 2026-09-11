import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sql } from "drizzle-orm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PageContentForm } from "@/components/admin/PageContentForm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import { db } from "@/lib/db";
import { getAllPageContent } from "@/lib/db/page-content-service";

export const metadata: Metadata = { title: "Page Content" };

const SLOT_FOR_PAGE: Record<string, string> = {
  services: "services_hero_image",
  experience: "experience_hero_image",
  contact: "contact_hero_image",
};

async function getPageHeroReferences() {
  try {
    const result = await db.execute<{ assetId: string; slot: string }>(sql`
      SELECT asset_id AS "assetId", slot
      FROM media_asset_references
      WHERE owner_type='site_settings'
        AND site_settings_id='singleton:settings'
        AND slot IN ('services_hero_image','experience_hero_image','contact_hero_image')
    `);
    return result.rows;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && (error as { code?: unknown }).code === "42P01") return [];
    throw error;
  }
}

export default async function AdminPagesPage() {
  await requirePermission("settings.read").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });
  const [pages, referenceRows] = await Promise.all([getAllPageContent(), getPageHeroReferences()]);
  const assetForPage = (pageKey: string) => {
    const slot = SLOT_FOR_PAGE[pageKey];
    return slot ? referenceRows.find((row) => row.slot === slot)?.assetId ?? null : null;
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="Page Content"
        description="Edit visible page headings, images, alt text, descriptions and CTA labels without changing the approved public layout."
      />
      <div className="space-y-12">
        {pages.map((page) => (
          <PageContentForm
            key={page.pageKey}
            pageKey={page.pageKey}
            content={page.content}
            revision={page.revision}
            heroImageAssetId={assetForPage(page.pageKey)}
          />
        ))}
      </div>
    </div>
  );
}
