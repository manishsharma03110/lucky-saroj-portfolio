import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SeoGlobalSettingsForm } from "@/components/admin/SeoGlobalSettingsForm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import { db, schema } from "@/lib/db";
import { SETTINGS_ID } from "@/lib/db/singleton-content-service";
export const metadata:Metadata={title:"Global SEO"};
export default async function AdminSeoPage(){await requirePermission("settings.read").catch(e=>{if(e instanceof AuthorizationError)notFound();throw e;});const[rows,extra,refs]=await Promise.all([db.select().from(schema.siteSettings).where(eq(schema.siteSettings.id,SETTINGS_ID)),db.execute<{twitterCardType:"summary"|"summary_large_image";twitterSiteUsername:string|null;robotsTxt:string}>(sql`SELECT twitter_card_type AS "twitterCardType",twitter_site_username AS "twitterSiteUsername",robots_txt AS "robotsTxt" FROM site_settings WHERE id=${SETTINGS_ID}`),db.select({assetId:schema.mediaAssetReferences.assetId,slot:schema.mediaAssetReferences.slot}).from(schema.mediaAssetReferences).where(and(eq(schema.mediaAssetReferences.ownerType,"site_settings"),eq(schema.mediaAssetReferences.siteSettingsId,SETTINGS_ID)))]);const settings=rows[0],seoExtra=extra.rows[0];if(!settings||!seoExtra)notFound();const assetFor=(slot:string)=>refs.find(r=>r.slot===slot)?.assetId??null;return <div><AdminPageHeader eyebrow="Search & Sharing" title="Global & Technical SEO" description="Site-wide defaults, verification, robots and social settings. Page-specific SEO stays inside each page editor."/><SeoGlobalSettingsForm settings={{...settings,...seoExtra}} assets={{logoImageAssetId:assetFor("logo_image"),heroImageAssetId:assetFor("hero_image"),faviconAssetId:assetFor("favicon"),ogImageAssetId:assetFor("og_image")}}/></div>}
