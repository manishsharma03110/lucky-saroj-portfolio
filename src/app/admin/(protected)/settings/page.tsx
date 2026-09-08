import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import { and, eq } from "drizzle-orm";
import { SETTINGS_ID } from "@/lib/db/singleton-content-service";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await requirePermission("settings.read").catch((error) => { if (error instanceof AuthorizationError) notFound(); throw error; });
  const rows = await db.select().from(schema.siteSettings).where(eq(schema.siteSettings.id, SETTINGS_ID));
  const settings = rows[0];
  if (!settings) notFound();
  const references = await db.select({ assetId: schema.mediaAssetReferences.assetId })
    .from(schema.mediaAssetReferences)
    .where(and(
      eq(schema.mediaAssetReferences.ownerType, "site_settings"),
      eq(schema.mediaAssetReferences.siteSettingsId, SETTINGS_ID),
      eq(schema.mediaAssetReferences.slot, "hero_image")
    ));
  const heroImageAssetId = references[0]?.assetId ?? null;

  return (
    <div>
      <AdminPageHeader title="Site Settings" description="Manage site-wide information" />
      <SettingsForm settings={settings} heroImageAssetId={heroImageAssetId} />
    </div>
  );
}
