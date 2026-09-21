import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { eq, sql } from "drizzle-orm";
import { db,schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PageContentForm } from "@/components/admin/PageContentForm";
import { PageSeoForm } from "@/components/admin/PageSeoForm";
import { PageEditorTabs } from "@/components/admin/PageEditorTabs";
import { PortfolioProjectManager } from "@/components/admin/PortfolioProjectManager";
import { getPageContent } from "@/lib/db/page-content-service";
import { getPageSeo } from "@/lib/db/page-seo-service";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import styles from "@/components/admin/AdminContent.module.css";

export const metadata:Metadata={title:"Complete Portfolio Page CMS & Project Manager"};
const SETTING_KEYS=["projectsPerPage","defaultSorting","showCategoryFilter","featuredBehavior"] as const;
export default async function AdminPortfolioPage(){
  await requirePermission("portfolio.read").catch(error=>{if(error instanceof AuthorizationError)notFound();throw error;});
  const [rows,page,seo]=await Promise.all([
    db.select({project:schema.portfolioProjects,category:schema.portfolioCategories,videoOrientation:sql<"auto"|"portrait"|"landscape">`portfolio_projects.video_orientation`}).from(schema.portfolioProjects).leftJoin(schema.portfolioCategories,eq(schema.portfolioProjects.categoryId,schema.portfolioCategories.id)).orderBy(schema.portfolioProjects.displayOrder),
    getPageContent("portfolio"),
    getPageSeo("portfolio")
  ]);
  const contentKeys=Object.keys(page.content).filter(key=>!SETTING_KEYS.includes(key as typeof SETTING_KEYS[number]));
  return <div><AdminPageHeader eyebrow="Page editor" title="Edit Portfolio" description="Manage Portfolio content, projects, display settings and page-specific SEO in one place. Public design stays unchanged." action={<Link href="/portfolio" target="_blank" className={styles.primaryAction}><ExternalLink size={16}/><span>View Portfolio Page</span></Link>}/>
    <PageEditorTabs
      content={<PageContentForm pageKey="portfolio" content={page.content} revision={page.revision} includeKeys={contentKeys} title="Portfolio Page Content & Hero"/>}
      projects={<PortfolioProjectManager initialRows={rows}/>} 
      settings={<PageContentForm pageKey="portfolio" content={page.content} revision={page.revision} includeKeys={SETTING_KEYS} title="Portfolio Settings"/>}
      seo={<PageSeoForm seo={seo}/>} />
  </div>;
}
