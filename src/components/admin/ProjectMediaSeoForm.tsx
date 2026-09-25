"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { FormCard } from "@/components/admin/FormParts";
import { updateProjectMediaSeo, type MediaSeoState } from "@/lib/actions/media-seo";
import styles from "./AdminEditorial.module.css";

export type ProjectMediaSeoItem = { id: string; url: string; type: "image" | "video"; displayOrder: number; altText: string | null; title: string | null; description: string | null };
const initial: MediaSeoState = { status: "idle" };

export function ProjectMediaSeoForm({ projectId, projectSlug, media }: { projectId: string; projectSlug: string; media: ProjectMediaSeoItem[] }) {
  const action = updateProjectMediaSeo.bind(null, projectId, projectSlug);
  const [state, formAction, pending] = useActionState(action, initial);
  if (!media.length) return null;
  return <form action={formAction} className={styles.sectionStack}><FormCard title="Gallery Media SEO"><p className={styles.helper}>Add descriptive metadata to existing project gallery media. Alt text is used for image accessibility; title and description provide reusable editorial metadata.</p>{media.map((item, index) => <fieldset key={item.id} className="space-y-4 rounded-lg border border-white/10 p-4"><input type="hidden" name="mediaId" value={item.id} /><legend className="px-2 text-sm font-semibold text-[var(--text-primary)]">{item.type === "image" ? "Image" : "Video"} {index + 1}</legend><p className="truncate text-xs text-[var(--text-readable, var(--text-muted))]" title={item.url}>{item.url}</p><div><Label htmlFor={`alt-${item.id}`}>Alt Text</Label><Input id={`alt-${item.id}`} name="altText" maxLength={300} defaultValue={item.altText ?? ""} placeholder={item.type === "image" ? "Describe what is visible in this project image" : "Optional for video media"} /></div><div><Label htmlFor={`title-${item.id}`}>Media Title</Label><Input id={`title-${item.id}`} name="mediaTitle" maxLength={200} defaultValue={item.title ?? ""} /></div><div><Label htmlFor={`description-${item.id}`}>Description</Label><Textarea id={`description-${item.id}`} name="mediaDescription" rows={2} maxLength={600} defaultValue={item.description ?? ""} /></div></fieldset>)}</FormCard>{state.message && <p className={state.status === "error" ? styles.feedbackError : styles.feedbackSuccess}>{state.message}</p>}<div className={styles.saveBar}><Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Media SEO"}</Button></div></form>;
}
