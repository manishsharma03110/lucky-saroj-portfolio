import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PageContentForm } from "@/components/admin/PageContentForm";
import { SocialSettingsForm } from "@/components/admin/SocialSettingsForm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import { db, schema } from "@/lib/db";
import { getPageContent } from "@/lib/db/page-content-service";
import { SETTINGS_ID } from "@/lib/db/singleton-content-service";

export const metadata: Metadata = { title: "Navigation & Social" };

export default async function NavigationPage() {
  await requirePermission("settings.read").catch((error) => { if (error instanceof AuthorizationError) notFound(); throw error; });
  const [global, settingsRows, refs] = await Promise.all([
    getPageContent("global"),
    db.select().from(schema.siteSettings).where(eq(schema.siteSettings.id, SETTINGS_ID)),
    db.select({ slot: schema.mediaAssetReferences.slot, assetId: schema.mediaAssetReferences.assetId }).from(schema.mediaAssetReferences).where(and(eq(schema.mediaAssetReferences.ownerType, "site_settings"), eq(schema.mediaAssetReferences.siteSettingsId, SETTINGS_ID))),
  ]);
  const settings = settingsRows[0];
  if (!settings) notFound();
  const assetIds = Object.fromEntries(refs.map((ref) => [ref.slot, ref.assetId]));
  return <div>
    <AdminPageHeader eyebrow="Website" title="Navigation & Social" description="Manage header/footer navigation labels, CTA destinations and social profiles from one workspace." />
    <div className="space-y-12">
      <section><PageContentForm pageKey="global" content={global.content} revision={global.revision} /></section>
      <section><SocialSettingsForm settings={settings} assetIds={assetIds} /></section>
    </div>
  </div>;
}
