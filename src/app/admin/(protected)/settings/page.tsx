import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import { and, eq, sql } from "drizzle-orm";
import { SETTINGS_ID } from "@/lib/db/singleton-content-service";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await requirePermission("settings.read").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });

  const rows = await db.select().from(schema.siteSettings).where(eq(schema.siteSettings.id, SETTINGS_ID));
  const settings = rows[0];
  if (!settings) notFound();

  const [brandingRows, references] = await Promise.all([
    db
      .select({ logoImageUrl: sql<string | null>`logo_image_url` })
      .from(schema.siteSettings)
      .where(eq(schema.siteSettings.id, SETTINGS_ID)),
    db
      .select({
        assetId: schema.mediaAssetReferences.assetId,
        slot: sql<string>`${schema.mediaAssetReferences.slot}`,
      })
      .from(schema.mediaAssetReferences)
      .where(and(
        eq(schema.mediaAssetReferences.ownerType, "site_settings"),
        eq(schema.mediaAssetReferences.siteSettingsId, SETTINGS_ID),
        sql`${schema.mediaAssetReferences.slot} IN ('hero_image','logo_image','favicon','og_image')`
      )),
  ]);

  const assetFor = (slot: string) => references.find((reference) => reference.slot === slot)?.assetId ?? null;

  return (
    <div>
      <AdminPageHeader
        eyebrow="System"
        title="Site Settings"
        description="Manage site identity, contact details, homepage content, social links, media, and default SEO metadata."
      />
      <SettingsForm
        settings={settings}
        logoImageUrl={brandingRows[0]?.logoImageUrl ?? null}
        heroImageAssetId={assetFor("hero_image")}
        logoImageAssetId={assetFor("logo_image")}
        faviconAssetId={assetFor("favicon")}
        ogImageAssetId={assetFor("og_image")}
      />
    </div>
  );
}
