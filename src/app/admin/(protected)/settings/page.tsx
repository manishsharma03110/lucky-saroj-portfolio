import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import { SETTINGS_ID } from "@/lib/db/singleton-content-service";

export const metadata: Metadata = { title: "Global Settings" };

export default async function AdminSettingsPage() {
  await requirePermission("settings.read").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });

  const [rows, seoExtra, brandingRows, references] = await Promise.all([
    db.select().from(schema.siteSettings).where(eq(schema.siteSettings.id, SETTINGS_ID)),
    db.execute<{ twitterCardType: "summary" | "summary_large_image"; twitterSiteUsername: string | null; robotsTxt: string }>(sql`
      SELECT twitter_card_type AS "twitterCardType",
             twitter_site_username AS "twitterSiteUsername",
             robots_txt AS "robotsTxt"
      FROM site_settings WHERE id=${SETTINGS_ID}
    `),
    db.select({ logoImageUrl: sql<string | null>`logo_image_url` }).from(schema.siteSettings).where(eq(schema.siteSettings.id, SETTINGS_ID)),
    db.select({ assetId: schema.mediaAssetReferences.assetId, slot: sql<string>`${schema.mediaAssetReferences.slot}` })
      .from(schema.mediaAssetReferences)
      .where(and(
        eq(schema.mediaAssetReferences.ownerType, "site_settings"),
        eq(schema.mediaAssetReferences.siteSettingsId, SETTINGS_ID),
        sql`${schema.mediaAssetReferences.slot} IN ('hero_image','logo_image','favicon','og_image')`
      )),
  ]);

  const settings = rows[0];
  const extra = seoExtra.rows[0];
  if (!settings || !extra) notFound();
  const assetFor = (slot: string) => references.find((reference) => reference.slot === slot)?.assetId ?? null;

  return (
    <div>
      <AdminPageHeader
        eyebrow="System"
        title="Global Settings"
        description="Single authoritative place for site-wide identity, contact details, verification, analytics and technical SEO defaults. Page-specific SEO stays inside each page editor; navigation and social profile URLs stay in Navigation & Social."
      />
      <SettingsForm
        settings={{ ...settings, ...extra }}
        logoImageUrl={brandingRows[0]?.logoImageUrl ?? null}
        heroImageAssetId={assetFor("hero_image")}
        logoImageAssetId={assetFor("logo_image")}
        faviconAssetId={assetFor("favicon")}
        ogImageAssetId={assetFor("og_image")}
      />
    </div>
  );
}
