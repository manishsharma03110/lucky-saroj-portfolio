import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PageSeoForm } from "@/components/admin/PageSeoForm";
import { SeoGlobalSettingsForm } from "@/components/admin/SeoGlobalSettingsForm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import { db, schema } from "@/lib/db";
import { getAllPageSeo } from "@/lib/db/page-seo-service";
import { SETTINGS_ID } from "@/lib/db/singleton-content-service";

export const metadata: Metadata = { title: "SEO" };

export default async function AdminSeoPage() {
  await requirePermission("settings.read").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });

  const [pages, settingsRows, references] = await Promise.all([
    getAllPageSeo(),
    db.select().from(schema.siteSettings).where(eq(schema.siteSettings.id, SETTINGS_ID)),
    db
      .select({ assetId: schema.mediaAssetReferences.assetId, slot: schema.mediaAssetReferences.slot })
      .from(schema.mediaAssetReferences)
      .where(and(
        eq(schema.mediaAssetReferences.ownerType, "site_settings"),
        eq(schema.mediaAssetReferences.siteSettingsId, SETTINGS_ID)
      )),
  ]);
  const settings = settingsRows[0];
  if (!settings) notFound();
  const ogImageAssetId = references.find((reference) => reference.slot === "og_image")?.assetId ?? null;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Search & Sharing"
        title="SEO"
        description="Manage global search settings and page-specific metadata from one place. Existing website content and SEO data are preserved."
      />
      <div className="space-y-12">
        <section aria-labelledby="global-seo-heading">
          <h2 id="global-seo-heading" className="mb-5 font-display text-xl font-semibold text-[var(--text-primary)]">Global & Technical SEO</h2>
          <SeoGlobalSettingsForm settings={settings} ogImageAssetId={ogImageAssetId} />
        </section>

        <section aria-labelledby="page-seo-heading">
          <div className="mb-5">
            <h2 id="page-seo-heading" className="font-display text-xl font-semibold text-[var(--text-primary)]">Page SEO</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Titles, descriptions, canonicals, social metadata, keywords and indexability for each public page.</p>
          </div>
          <div className="space-y-8">
            {pages.map((seo) => <PageSeoForm key={seo.pageKey} seo={seo} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
