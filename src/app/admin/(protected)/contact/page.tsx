import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PageContentForm } from "@/components/admin/PageContentForm";
import { PageSeoForm } from "@/components/admin/PageSeoForm";
import { PageEditorTabs } from "@/components/admin/PageEditorTabs";
import { getPageContent } from "@/lib/db/page-content-service";
import { getPageSeo } from "@/lib/db/page-seo-service";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
export const metadata:Metadata={title:"Edit Contact"};
export default async function AdminContactPage(){await requirePermission("settings.read").catch(e=>{if(e instanceof AuthorizationError)notFound();throw e;});const[page,seo]=await Promise.all([getPageContent("contact"),getPageSeo("contact")]);return <div><AdminPageHeader eyebrow="Page editor" title="Edit Contact" description="Contact page visible copy and page-specific SEO settings in one place."/><PageEditorTabs content={<PageContentForm pageKey="contact" content={page.content} revision={page.revision}/>} seo={<PageSeoForm seo={seo}/>}/></div>}
