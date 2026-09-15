import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { desc } from "drizzle-orm";
import { db,schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { TestimonialListItem } from "@/components/admin/TestimonialListItem";
import { PageSeoForm } from "@/components/admin/PageSeoForm";
import { PageEditorTabs } from "@/components/admin/PageEditorTabs";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import { getTestimonialProfileAssetIds } from "@/lib/db/testimonial-media-service";
import { getPageSeo } from "@/lib/db/page-seo-service";
import styles from "@/components/admin/AdminContent.module.css";
export const metadata:Metadata={title:"Edit Testimonials"};
export default async function AdminTestimonialsPage(){await requirePermission("testimonials.read").catch(e=>{if(e instanceof AuthorizationError)notFound();throw e;});const[items,assets,seo]=await Promise.all([db.select().from(schema.testimonials).orderBy(desc(schema.testimonials.createdAt)),getTestimonialProfileAssetIds(),getPageSeo("testimonials")]);const content=<div className={styles.twoColumnWide}><div className={styles.listStack}>{items.map(t=><TestimonialListItem key={t.id} testimonial={t} profileImageAssetId={assets[t.id]??null}/>)}{items.length===0&&<div className={styles.emptyState}>No testimonials yet.</div>}</div><TestimonialForm/></div>;return <div><AdminPageHeader eyebrow="Page editor" title="Edit Testimonials" description="Client testimonials and listing-page SEO are managed together."/><PageEditorTabs content={content} seo={<PageSeoForm seo={seo}/>}/></div>}
