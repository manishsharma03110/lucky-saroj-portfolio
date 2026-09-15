import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db,schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExperienceForm } from "@/components/admin/ExperienceForm";
import { ExperienceListItem } from "@/components/admin/ExperienceListItem";
import { PageContentForm } from "@/components/admin/PageContentForm";
import { PageSeoForm } from "@/components/admin/PageSeoForm";
import { PageEditorTabs } from "@/components/admin/PageEditorTabs";
import { getPageContent } from "@/lib/db/page-content-service";
import { getPageSeo } from "@/lib/db/page-seo-service";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import styles from "@/components/admin/AdminContent.module.css";
export const metadata:Metadata={title:"Edit Experience"};
export default async function AdminExperiencePage(){await requirePermission("experience.read").catch(e=>{if(e instanceof AuthorizationError)notFound();throw e;});const[items,page,seo]=await Promise.all([db.select().from(schema.experiences).orderBy(schema.experiences.displayOrder),getPageContent("experience"),getPageSeo("experience")]);const content=<div className="space-y-8"><PageContentForm pageKey="experience" content={page.content} revision={page.revision}/><div className={styles.twoColumnWide}><div className={styles.listStack}>{items.map(x=><ExperienceListItem key={x.id} experience={x}/>)}{items.length===0&&<div className={styles.emptyState}>No experience entries yet.</div>}</div><ExperienceForm/></div></div>;return <div><AdminPageHeader eyebrow="Page editor" title="Edit Experience" description="Visible page copy, experience entries and SEO settings are organized in one editor."/><PageEditorTabs content={content} seo={<PageSeoForm seo={seo}/>}/></div>}
