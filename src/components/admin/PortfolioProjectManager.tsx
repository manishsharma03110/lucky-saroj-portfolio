"use client";

import Link from "next/link";
import { ExternalLink, GripVertical, Pencil, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { PortfolioRowActions, DeleteProjectButton } from "@/components/admin/PortfolioRowActions";
import { reorderPortfolioProjects } from "@/lib/actions/portfolio-order";
import styles from "@/components/admin/AdminContent.module.css";

type Row={project:{id:string;title:string;slug:string;year:number|null;status:string;isFeatured:boolean;revision:number};category:{name:string}|null};

export function PortfolioProjectManager({initialRows}:{initialRows:Row[]}){
  const [rows,setRows]=useState(initialRows); const [dragged,setDragged]=useState<string|null>(null); const [pending,startTransition]=useTransition(); const [message,setMessage]=useState("");
  function persist(next:Row[]){setRows(next);setMessage("");startTransition(async()=>{try{await reorderPortfolioProjects(next.map(r=>r.project.id));setMessage("Project order saved.");}catch{setRows(rows);setMessage("Could not save order. Reload and try again.");}});}
  function move(id:string,delta:number){const from=rows.findIndex(r=>r.project.id===id),to=from+delta;if(from<0||to<0||to>=rows.length)return;const next=[...rows];const [item]=next.splice(from,1);next.splice(to,0,item);persist(next);}
  function drop(target:string){if(!dragged||dragged===target)return;const from=rows.findIndex(r=>r.project.id===dragged),to=rows.findIndex(r=>r.project.id===target);if(from<0||to<0)return;const next=[...rows];const [item]=next.splice(from,1);next.splice(to,0,item);setDragged(null);persist(next);}
  return <section className={styles.tableCard} aria-labelledby="portfolio-projects-heading">
    <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 id="portfolio-projects-heading" className="text-lg font-semibold text-[var(--text-primary)]">Portfolio Projects</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Drag projects to reorder, or use the accessible move buttons. Add, edit, publish, feature or remove projects.</p></div><Link href="/admin/portfolio/new" className={styles.primaryAction}><Plus size={16}/><span>Add New Project</span></Link></div>
    <table className={styles.table}><thead><tr><th>Order</th><th>Project Name / Category</th><th>Published</th><th>Featured</th><th style={{textAlign:"right"}}>Edit / Delete</th></tr></thead><tbody>{rows.map(({project,category},index)=><tr key={project.id} draggable={!pending} onDragStart={()=>setDragged(project.id)} onDragOver={e=>e.preventDefault()} onDrop={()=>drop(project.id)} className={dragged===project.id?"opacity-50":undefined}>
      <td data-label="Order"><div className="flex items-center gap-1"><GripVertical size={17} aria-hidden/><button type="button" disabled={pending||index===0} onClick={()=>move(project.id,-1)} aria-label={`Move ${project.title} up`} className={styles.iconAction}>↑</button><button type="button" disabled={pending||index===rows.length-1} onClick={()=>move(project.id,1)} aria-label={`Move ${project.title} down`} className={styles.iconAction}>↓</button></div></td>
      <td data-label="Project" className={styles.tableTitle}><div>{project.title}</div><div className="text-xs font-normal text-[var(--text-muted)]">{category?.name??"Uncategorized"}{project.year?` · ${project.year}`:""}</div></td>
      <td data-label="Published"><span className={project.status==="published"?styles.statusPublished:styles.statusDraft}>{project.status==="published"?"Published":"Draft"}</span></td>
      <td data-label="Featured"><PortfolioRowActions id={project.id} isFeatured={project.isFeatured} revision={project.revision}/></td>
      <td data-label="Actions"><div className={styles.actionGroup}><Link href={`/portfolio/${project.slug}`} target="_blank" className={styles.iconAction} aria-label={`View ${project.title} live`}><ExternalLink size={15}/></Link><Link href={`/admin/portfolio/${project.id}/edit`} className={styles.iconAction} aria-label={`Edit ${project.title}`}><Pencil size={15}/></Link><DeleteProjectButton id={project.id} title={project.title}/></div></td>
    </tr>)}</tbody></table>
    {rows.length===0&&<div className={styles.emptyState}>No projects yet. Add your first project to get started.</div>}
    {(pending||message)&&<p className="px-5 py-3 text-sm text-[var(--text-secondary)]" aria-live="polite">{pending?"Saving project order...":message}</p>}
  </section>;
}
