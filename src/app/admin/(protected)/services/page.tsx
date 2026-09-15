import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db,schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { ServiceListItem } from "@/components/admin/ServiceListItem";
import { PageContentForm } from "@/components/admin/PageContentForm";
import { PageSeoForm } from "@/components/admin/PageSeoForm";
import { PageEditorTabs } from "@/components/admin/PageEditorTabs";
import { getPageContent } from "@/lib/db/page-content-service";
import { getPageSeo } from "@/lib/db/page-seo-service";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import styles from "@/components/admin/AdminContent.module.css";
export const metadata:Metadata={title:"Edit Services"};
export default async function AdminServicesPage(){await requirePermission("services.read").catch(e=>{if(e instanceof AuthorizationError)notFound();throw e;});const[services,page,seo]=await Promise.all([db.select().from(schema.services).orderBy(schema.services.displayOrder),getPageContent("services"),getPageSeo("services")]);const manager=<div className="space-y-8"><PageContentForm pageKey="services" content={page.content} revision={page.revision}/><div className={styles.twoColumn}><div className={styles.listStack}>{services.map(s=><ServiceListItem key={s.id} service={s}/>)}{services.length===0&&<div className={styles.emptyState}>No services yet.</div>}</div><ServiceForm/></div></div>;return <div><AdminPageHeader eyebrow="Page editor" title="Edit Services" description="Visible page copy, service entries and SEO settings are organized here without changing the public design."/><PageEditorTabs content={manager} seo={<PageSeoForm seo={seo}/>}/></div>}
