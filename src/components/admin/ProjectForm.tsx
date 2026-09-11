"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FormCard, FieldError, CheckboxField } from "@/components/admin/FormParts";
import { createProject, updateProject, type ActionState } from "@/lib/actions/portfolio";
import { MediaForm } from "@/components/admin/MediaForm";
import { FileUpload } from "@/components/admin/FileUpload";
import type { schema } from "@/lib/db";
import styles from "@/components/admin/AdminEditorial.module.css";

type Project = typeof schema.portfolioProjects.$inferSelect;
type ProjectTool = typeof schema.projectTools.$inferSelect;
type Category = typeof schema.portfolioCategories.$inferSelect;

const initialState: ActionState = { status: "idle" };

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function ProjectForm({ project, tools, categories, mediaAssetIds }: {
  project?: Project;
  tools?: ProjectTool[];
  categories: Category[];
  mediaAssetIds?: Partial<Record<"thumbnail" | "video", string>>;
}) {
  const router = useRouter();
  const action = project ? updateProject.bind(null, project.id) : createProject;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [autoSlug, setAutoSlug] = useState(!project);
  const [slug, setSlug] = useState(project?.slug ?? "");

  return (
    <MediaForm action={formAction} className={styles.formGrid}>
      {project && <input type="hidden" name="revision" value={project.revision} />}

      <FormCard title="Project Details">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="title">Project Title</Label>
            <Input id="title" name="title" placeholder="Enter project title" defaultValue={project?.title} required onChange={(event) => { if (autoSlug) setSlug(slugify(event.target.value)); }} />
            <FieldError message={state.fieldErrors?.title} />
          </div>
          <div>
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input id="slug" name="slug" placeholder="project-url-slug" value={slug} onChange={(event) => { setAutoSlug(false); setSlug(slugify(event.target.value)); }} required />
            <FieldError message={state.fieldErrors?.slug} />
          </div>
          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input id="clientName" name="clientName" placeholder="Enter client name" defaultValue={project?.clientName ?? ""} />
          </div>
          <div>
            <Label htmlFor="year">Project Year</Label>
            <Input id="year" name="year" type="number" min={1990} max={2100} defaultValue={project?.year ?? new Date().getFullYear()} />
          </div>
          <div>
            <Label htmlFor="categoryId">Category</Label>
            <Select id="categoryId" name="categoryId" defaultValue={project?.categoryId ?? ""}>
              <option value="">Select category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue={project?.status ?? "draft"}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </div>
        </div>

        <FileUpload name="thumbnailUrl" assetIdName="thumbnailAssetId" label="Thumbnail Image" kind="image" defaultValue={project?.thumbnailUrl} defaultAssetId={mediaAssetIds?.thumbnail} />
        <FileUpload name="videoUrl" assetIdName="videoAssetId" label="Project Video" kind="video" defaultValue={project?.videoUrl} defaultAssetId={mediaAssetIds?.video} />
        <p className={styles.helper}>Upload a video file or paste a YouTube/Vimeo link above.</p>

        <div>
          <Label htmlFor="tools">Tools / Software Used</Label>
          <Input id="tools" name="tools" placeholder="Premiere Pro, After Effects, DaVinci Resolve" defaultValue={tools?.map((tool) => tool.name).join(", ") ?? ""} />
          <p className={styles.helper}>Comma-separated</p>
        </div>

        <CheckboxField name="isFeatured" label="Featured project (shown on homepage)" defaultChecked={project?.isFeatured} />
      </FormCard>

      <FormCard title="Project Description">
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} defaultValue={project?.description ?? ""} />
        </div>
        <div>
          <Label htmlFor="challenge">The Challenge</Label>
          <Textarea id="challenge" name="challenge" rows={2} defaultValue={project?.challenge ?? ""} />
        </div>
        <div>
          <Label htmlFor="approach">My Approach</Label>
          <Textarea id="approach" name="approach" rows={2} defaultValue={project?.approach ?? ""} />
        </div>
        <div>
          <Label htmlFor="result">The Result</Label>
          <Textarea id="result" name="result" rows={2} defaultValue={project?.result ?? ""} />
        </div>
      </FormCard>

      <FormCard title="SEO Settings">
        <div>
          <Label htmlFor="seoTitle">Meta Title</Label>
          <Input id="seoTitle" name="seoTitle" defaultValue={project?.seoTitle ?? ""} />
        </div>
        <div>
          <Label htmlFor="seoDescription">Meta Description</Label>
          <Textarea id="seoDescription" name="seoDescription" rows={2} defaultValue={project?.seoDescription ?? ""} />
        </div>
      </FormCard>

      {state.status === "error" && state.message && <p className={styles.feedbackError}>{state.message}</p>}
      {state.status === "success" && state.message && <p className={styles.feedbackSuccess}>{state.message}</p>}

      <div className={styles.saveBar}>
        <div className="flex items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/portfolio")} disabled={pending}>Cancel</Button>
          <Button type="submit" disabled={pending}>{pending ? "Saving..." : project ? "Save Changes" : "Publish Project"}</Button>
        </div>
      </div>
    </MediaForm>
  );
}
