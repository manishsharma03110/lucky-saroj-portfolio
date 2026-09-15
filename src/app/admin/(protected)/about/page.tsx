import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db,schema } from "@/lib/db";
import { and,eq,sql } from "drizzle-orm";
import { ABOUT_ID } from "@/lib/db/about-service";
import { SITE_SETTINGS_ID } from "@/lib/db/site-media-slot-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AboutForm } from "@/components/admin/AboutForm";
import { PageContentForm } from "@/components/admin/PageContentForm";
import { PageSeoForm } from "@/components/admin/PageSeoForm";
import { PageEditorTabs } from "@/components/admin/PageEditorTabs";
import { getPageContent } from "@/lib/db/page-content-service";
import { getPageSeo } from "@/lib/db/page-seo-service";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import styles from "@/components/admin/AdminEditorial.module.css";
export const metadata:Metadata={title:"Edit About"};
export default async function AdminAboutPage(){await requirePermission("about.read").catch(e=>{if(e instanceof AuthorizationError)notFound();throw e;});const rows=await db.select().from(schema.aboutProfile).where(eq(schema.aboutProfile.id,ABOUT_ID));const profile=rows[0];if(!profile)notFound();const[skills,tools,refs,page,seo]=await Promise.all([db.select().from(schema.aboutSkills).orderBy(schema.aboutSkills.displayOrder),db.select().from(schema.aboutTools).orderBy(schema.aboutTools.displayOrder),db.select({assetId:schema.mediaAssetReferences.assetId}).from(schema.mediaAssetReferences).where(and(eq(schema.mediaAssetReferences.ownerType,"site_settings"),eq(schema.mediaAssetReferences.siteSettingsId,SITE_SETTINGS_ID),sql`${schema.mediaAssetReferences.slot}='about_profile_image'`)),getPageContent("about"),getPageSeo("about")]);const content=<div className={styles.singleColumn}><PageContentForm pageKey="about" content={page.content} revision={page.revision}/><AboutForm profile={profile} skills={skills} tools={tools} profileImageAssetId={refs[0]?.assetId??null}/></div>;return <div><AdminPageHeader eyebrow="Page editor" title="Edit About" description="About page copy, profile content and SEO settings are organized in one place."/><PageEditorTabs content={content} seo={<PageSeoForm seo={seo}/>}/></div>}
