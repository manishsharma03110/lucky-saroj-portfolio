"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FormCard, FieldError, CheckboxField } from "@/components/admin/FormParts";
import { createProject, updateProject, type ActionState } from "@/lib/actions/portfolio";
import type { schema } from "@/lib/db";

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

export function ProjectForm({
  project,
  tools,
  categories,
}: {
  project?: Project;
  tools?: ProjectTool[];
  categories: Category[];
}) {
  const router = useRouter();
  const action = project ? updateProject.bind(null, project.id) : createProject;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [autoSlug, setAutoSlug] = useState(!project);
  const [slug, setSlug] = useState(project?.slug ?? "");

  return (
    <form action={formAction} className="space-y-6">
      <FormCard title="Project Details">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter project title"
              defaultValue={project?.title}
              required
              onChange={(e) => {
                if (autoSlug) setSlug(slugify(e.target.value));
              }}
            />
            <FieldError message={state.fieldErrors?.title} />
          </div>
          <div>
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              name="slug"
              placeholder="project-url-slug"
              value={slug}
              onChange={(e) => {
                setAutoSlug(false);
                setSlug(slugify(e.target.value));
              }}
              required
            />
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
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
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

        <div>
          <Label htmlFor="thumbnailUrl">Thumbnail Image URL</Label>
          <Input id="thumbnailUrl" name="thumbnailUrl" placeholder="https://..." defaultValue={project?.thumbnailUrl ?? ""} />
        </div>
        <div>
          <Label htmlFor="videoUrl">Project Video URL</Label>
          <Input id="videoUrl" name="videoUrl" placeholder="YouTube, Vimeo, or direct link" defaultValue={project?.videoUrl ?? ""} />
        </div>
        <div>
          <Label htmlFor="tools">Tools / Software Used</Label>
          <Input
            id="tools"
            name="tools"
            placeholder="Premiere Pro, After Effects, DaVinci Resolve"
            defaultValue={tools?.map((t) => t.name).join(", ") ?? ""}
          />
          <p className="mt-1 text-xs text-[var(--color-muted)]">Comma-separated</p>
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

      {state.status === "error" && state.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/portfolio")}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : project ? "Save Changes" : "Publish Project"}
        </Button>
      </div>
    </form>
  );
}
