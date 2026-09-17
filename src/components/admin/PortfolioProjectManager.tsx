"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { PortfolioRowActions, DeleteProjectButton } from "@/components/admin/PortfolioRowActions";
import styles from "@/components/admin/AdminContent.module.css";

type Row={project:{id:string;title:string;slug:string;year:number|null;status:string;isFeatured:boolean;revision:number;thumbnailUrl:string|null;thumbnailAlt:string|null;posterUrl:string|null};category:{name:string}|null};

export function PortfolioProjectManager({initialRows}:{initialRows:Row[]}){
  return <section className={styles.tableCard} aria-labelledby="portfolio-projects-heading">
    <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 id="portfolio-projects-heading" className="text-lg font-semibold text-[var(--text-primary)]">Portfolio Projects</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Manage your portfolio projects. One Project Banner is reused across the public portfolio in a consistent 16:9 frame.</p></div>
      <Link href="/admin/portfolio/new" className={styles.primaryAction}><Plus size={16}/><span>Add New Project</span></Link>
    </div>
    <table className={styles.table}>
      <thead><tr><th>Project Banner</th><th>Details</th><th>Published</th><th>Featured</th><th style={{textAlign:"right"}}>Actions</th></tr></thead>
      <tbody>{initialRows.map(({project,category})=>{
        const imageUrl=project.thumbnailUrl||project.posterUrl;
        return <tr key={project.id}>
          <td data-label="Project Banner"><div className="relative aspect-video w-[128px] overflow-hidden rounded-md border border-white/10 bg-black/35">{imageUrl?<Image src={imageUrl} alt={project.thumbnailAlt||project.title} fill sizes="128px" className="object-cover"/>:<div className="flex h-full items-center justify-center px-2 text-center text-[10px] uppercase tracking-[.14em] text-[var(--text-muted)]">No banner</div>}</div></td>
          <td data-label="Details" className={styles.tableTitle}><div>{project.title}</div><div className="text-xs font-normal text-[var(--text-muted)]">{category?.name??"Uncategorized"}{project.year?` · ${project.year}`:""}</div></td>
          <td data-label="Published"><span className={project.status==="published"?styles.statusPublished:styles.statusDraft}>{project.status==="published"?"Published":"Draft"}</span></td>
          <td data-label="Featured"><PortfolioRowActions id={project.id} isFeatured={project.isFeatured} revision={project.revision}/></td>
          <td data-label="Actions"><div className={styles.actionGroup}><Link href={`/portfolio/${project.slug}`} target="_blank" className={styles.iconAction} aria-label={`View ${project.title} live`}><ExternalLink size={15}/></Link><Link href={`/admin/portfolio/${project.id}/edit`} className={styles.iconAction} aria-label={`Edit ${project.title}`}><Pencil size={15}/></Link><DeleteProjectButton id={project.id} title={project.title}/></div></td>
        </tr>;
      })}</tbody>
    </table>
    {initialRows.length===0&&<div className={styles.emptyState}>No projects yet. Add your first project to get started.</div>}
  </section>;
}
