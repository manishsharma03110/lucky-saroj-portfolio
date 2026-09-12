"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { FormCard } from "@/components/admin/FormParts";
import { updatePageSeoAction } from "@/lib/actions/page-seo";
import type { PageSeoRecord } from "@/lib/db/page-seo-service";
import { SEO_PAGE_DEFAULTS } from "@/lib/page-seo";
import type { ActionState } from "@/lib/actions/portfolio";
import styles from "./AdminEditorial.module.css";

const initialState: ActionState = { status: "idle" };

export function PageSeoForm({ seo }: { seo: PageSeoRecord }) {
  const [state, action, pending] = useActionState(updatePageSeoAction, initialState);
  const page = SEO_PAGE_DEFAULTS[seo.pageKey];

  return (
    <form action={action} className={styles.sectionStack}>
      <input type="hidden" name="pageKey" value={seo.pageKey} />
      <input type="hidden" name="revision" value={seo.revision} />
      <FormCard title={`${page.label} SEO`}>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <Label htmlFor={`${seo.pageKey}-metaTitle`}>Meta Title</Label>
            <Input id={`${seo.pageKey}-metaTitle`} name="metaTitle" maxLength={200} defaultValue={seo.metaTitle} />
          </div>
          <div className="lg:col-span-2">
            <Label htmlFor={`${seo.pageKey}-metaDescription`}>Meta Description</Label>
            <Textarea id={`${seo.pageKey}-metaDescription`} name="metaDescription" rows={3} maxLength={320} defaultValue={seo.metaDescription} />
          </div>
          <div>
            <Label htmlFor={`${seo.pageKey}-canonicalPath`}>Canonical URL / Path</Label>
            <Input id={`${seo.pageKey}-canonicalPath`} name="canonicalPath" maxLength={500} defaultValue={seo.canonicalPath} />
          </div>
          <div>
            <Label htmlFor={`${seo.pageKey}-keywords`}>Keywords</Label>
            <Input id={`${seo.pageKey}-keywords`} name="keywords" maxLength={500} defaultValue={seo.keywords} placeholder="video editor, documentary editor, reels editor" />
          </div>
          <div>
            <Label htmlFor={`${seo.pageKey}-ogTitle`}>Open Graph Title</Label>
            <Input id={`${seo.pageKey}-ogTitle`} name="ogTitle" maxLength={200} defaultValue={seo.ogTitle} />
          </div>
          <div>
            <Label htmlFor={`${seo.pageKey}-ogImageUrl`}>Open Graph Image URL</Label>
            <Input id={`${seo.pageKey}-ogImageUrl`} name="ogImageUrl" maxLength={2048} defaultValue={seo.ogImageUrl} placeholder="Leave blank to use the global social image" />
          </div>
          <div className="lg:col-span-2">
            <Label htmlFor={`${seo.pageKey}-ogDescription`}>Open Graph Description</Label>
            <Textarea id={`${seo.pageKey}-ogDescription`} name="ogDescription" rows={3} maxLength={320} defaultValue={seo.ogDescription} />
          </div>
          <label className="lg:col-span-2 flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-[var(--text-primary)]">
            <input name="robotsIndex" type="checkbox" defaultChecked={seo.robotsIndex} className="h-4 w-4 accent-[var(--accent-primary)]" />
            Allow search engines to index this page
          </label>
        </div>
        <p className={styles.helper}>Per-page OG image falls back to the global social image in Settings when left blank.</p>
      </FormCard>
      {state.status === "error" && state.message && <p className={styles.feedbackError}>{state.message}</p>}
      {state.status === "success" && state.message && <p className={styles.feedbackSuccess}>{state.message}</p>}
      <div className={styles.saveBar}><Button type="submit" disabled={pending}>{pending ? "Saving..." : `Save ${page.label} SEO`}</Button></div>
    </form>
  );
}
