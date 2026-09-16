import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HomeContentForm } from "@/components/admin/HomeContentForm";
import { HomepageSiteSettingsForm } from "@/components/admin/HomepageSiteSettingsForm";
import { PageSeoForm } from "@/components/admin/PageSeoForm";
import { PageEditorTabs } from "@/components/admin/PageEditorTabs";
import { getHomePageContent } from "@/lib/db/home-content-service";
import { getPageSeo } from "@/lib/db/page-seo-service";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import { db, schema } from "@/lib/db";
import { SETTINGS_ID } from "@/lib/db/singleton-content-service";

export const metadata: Metadata = { title: "Edit Homepage" };

export default async function AdminHomePage() {
  await requirePermission("settings.read").catch((error) => { if (error instanceof AuthorizationError) notFound(); throw error; });
  const [content, seo, settingsRows, seoExtra, refs] = await Promise.all([
    getHomePageContent(),
    getPageSeo("home"),
    db.select().from(schema.siteSettings).where(eq(schema.siteSettings.id, SETTINGS_ID)),
    db.execute<{ twitterCardType: "summary" | "summary_large_image"; twitterSiteUsername: string | null; robotsTxt: string }>(sql`
      SELECT twitter_card_type AS "twitterCardType", twitter_site_username AS "twitterSiteUsername", robots_txt AS "robotsTxt"
      FROM site_settings WHERE id=${SETTINGS_ID}
    `),
    db.select({ slot: schema.mediaAssetReferences.slot, assetId: schema.mediaAssetReferences.assetId })
      .from(schema.mediaAssetReferences)
      .where(and(eq(schema.mediaAssetReferences.ownerType, "site_settings"), eq(schema.mediaAssetReferences.siteSettingsId, SETTINGS_ID))),
  ]);
  const settings = settingsRows[0];
  const extra = seoExtra.rows[0];
  if (!settings || !extra) notFound();
  const assetIds = Object.fromEntries(refs.map((ref) => [ref.slot, ref.assetId]));
  const contentEditor = <div className="space-y-12"><HomepageSiteSettingsForm settings={{ ...settings, ...extra }} assetIds={assetIds} /><HomeContentForm content={content} /></div>;
  return <div><AdminPageHeader eyebrow="Page editor" title="Edit Homepage" description="All visible homepage content and page-specific SEO in one place. Public layout and design stay unchanged."/><PageEditorTabs content={contentEditor} seo={<PageSeoForm seo={seo}/>}/></div>;
}
