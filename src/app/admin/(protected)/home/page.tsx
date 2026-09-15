import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HomeContentForm } from "@/components/admin/HomeContentForm";
import { PageSeoForm } from "@/components/admin/PageSeoForm";
import { PageEditorTabs } from "@/components/admin/PageEditorTabs";
import { getHomePageContent } from "@/lib/db/home-content-service";
import { getPageSeo } from "@/lib/db/page-seo-service";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
export const metadata:Metadata={title:"Edit Homepage"};
export default async function AdminHomePage(){await requirePermission("settings.read").catch(e=>{if(e instanceof AuthorizationError)notFound();throw e;});const[content,seo]=await Promise.all([getHomePageContent(),getPageSeo("home")]);return <div><AdminPageHeader eyebrow="Page editor" title="Edit Homepage" description="Visible homepage content and page-specific SEO in one place. Public layout and design stay unchanged."/><PageEditorTabs content={<HomeContentForm content={content}/>} seo={<PageSeoForm seo={seo}/>}/></div>}
