"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FormCard, FieldError, CheckboxField } from "@/components/admin/FormParts";
import { createProject, updateProject, type ActionState } from "@/lib/actions/portfolio";
import { MediaForm } from "@/components/admin/MediaForm";
import { FileUpload } from "@/components/admin/FileUpload";
import type { schema } from "@/lib/db";
import type { VideoOrientation } from "@/lib/media/video";
import styles from "@/components/admin/AdminEditorial.module.css";

type BaseProject = typeof schema.portfolioProjects.$inferSelect;
type Project = BaseProject & {
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImageUrl?: string | null;
  videoOrientation?: VideoOrientation;
};
type Tool = typeof schema.projectTools.$inferSelect;
type Category = typeof schema.portfolioCategories.$inferSelect;
type Option = Pick<BaseProject, "id" | "title" | "status">;

type TextFields = {
  title: string;
  clientName: string;
  thumbnailAlt: string;
  tools: string;
  description: string;
  challenge: string;
  approach: string;
  result: string;
  seoTitle: string;
  seoDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImageUrl: string;
};

const initialState: ActionState = { status: "idle" };

function slugify(value: string) {
  return value
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
  mediaAssetIds,
  availableProjects = [],
  relatedProjectIds = [],
}: {
  project?: Project;
  tools?: Tool[];
  categories: Category[];
  mediaAssetIds?: Partial<Record<"thumbnail" | "video", string>>;
  availableProjects?: Option[];
  relatedProjectIds?: string[];
}) {
  const router = useRouter();
  const action = project ? updateProject.bind(null, project.id) : createProject;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [autoSlug, setAutoSlug] = useState(!project);
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [videoOrientation, setVideoOrientation] = useState<VideoOrientation>(project?.videoOrientation ?? "auto");
  const [fields, setFields] = useState<TextFields>(() => ({
    title: project?.title ?? "",
    clientName: project?.clientName ?? "",
    thumbnailAlt: project?.thumbnailAlt ?? "",
    tools: tools?.map((tool) => tool.name).join(", ") ?? "",
    description: project?.description ?? "",
    challenge: project?.challenge ?? "",
    approach: project?.approach ?? "",
    result: project?.result ?? "",
    seoTitle: project?.seoTitle ?? "",
    seoDescription: project?.seoDescription ?? "",
    ogTitle: project?.ogTitle ?? "",
    ogDescription: project?.ogDescription ?? "",
    ogImageUrl: project?.ogImageUrl ?? "",
    twitterTitle: project?.twitterTitle ?? "",
    twitterDescription: project?.twitterDescription ?? "",
    twitterImageUrl: project?.twitterImageUrl ?? "",
  }));

  const setField = (name: keyof TextFields, value: string) => {
    setFields((current) => (current[name] === value ? current : { ...current, [name]: value }));
  };

  const bindInput = (name: keyof TextFields) => ({
    value: fields[name],
    onChange: (event: ChangeEvent<HTMLInputElement>) => setField(name, event.target.value),
  });

  const bindTextarea = (name: keyof TextFields) => ({
    value: fields[name],
    onChange: (event: ChangeEvent<HTMLTextAreaElement>) => setField(name, event.target.value),
  });

  const bannerRatio =
    videoOrientation === "portrait"
      ? { width: 9, height: 16, label: "9:16", recommended: "1080×1920 px" }
      : { width: 16, height: 9, label: "16:9", recommended: "1920×1080 px" };

  return (
    <MediaForm action={formAction} className={styles.formGrid} autoComplete="off">
      {project && <input type="hidden" name="revision" value={project.revision} />}

      <FormCard title="Project Details">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              name="title"
              required
              autoComplete="off"
              value={fields.title}
              onChange={(event) => {
                const value = event.target.value;
                setField("title", value);
                if (autoSlug) setSlug(slugify(value));
              }}
            />
            <FieldError message={state.fieldErrors?.title} />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={slug}
              autoComplete="off"
              onChange={(event) => {
                setAutoSlug(false);
                setSlug(slugify(event.target.value));
              }}
              required
            />
          </div>
          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input id="clientName" name="clientName" autoComplete="off" {...bindInput("clientName")} />
          </div>
          <div>
            <Label htmlFor="year">Year</Label>
            <Input id="year" name="year" type="number" min={1990} max={2100} defaultValue={project?.year ?? new Date().getFullYear()} />
          </div>
          <div>
            <Label htmlFor="categoryId">Category</Label>
            <Select id="categoryId" name="categoryId" defaultValue={project?.categoryId ?? ""}>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
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
          <FileUpload
            name="videoUrl"
            assetIdName="videoAssetId"
            label="Upload Project Video — MP4/WebM"
            kind="video"
            defaultValue={project?.videoUrl}
            defaultAssetId={mediaAssetIds?.video}
            onDetectedVideoOrientation={(orientation) => setVideoOrientation(orientation)}
          />
          <div className="mt-4">
            <Label htmlFor="videoOrientation">Video Orientation</Label>
            <Select
              id="videoOrientation"
              name="videoOrientation"
              value={videoOrientation}
              onChange={(event) => setVideoOrientation(event.target.value as VideoOrientation)}
            >
              <option value="auto">Auto detect uploaded/direct video</option>
              <option value="landscape">Landscape — 16:9</option>
              <option value="portrait">Portrait / Shorts — 9:16</option>
            </Select>
            <FieldError message={state.fieldErrors?.videoOrientation} />
          </div>
          <p className={styles.helper}>
            Uploaded MP4/WebM orientation is detected automatically. For Pinterest, YouTube, Google Drive, or another external URL, choose Portrait / Shorts manually when the source is vertical.
          </p>
          <FieldError message={state.fieldErrors?.videoUrl} />
        </div>

        <FileUpload
          name="thumbnailUrl"
          assetIdName="thumbnailAssetId"
          label={`Project Banner — ${bannerRatio.label}`}
          kind="image"
          defaultValue={project?.thumbnailUrl}
          defaultAssetId={mediaAssetIds?.thumbnail}
          requiredAspectRatio={bannerRatio}
        />
        <p className={styles.helper}>
          Banner ratio follows the selected video orientation. Portrait video requires a 9:16 banner; landscape requires 16:9. If no banner is uploaded, the website uses the existing dark/blue palette project slate automatically.
        </p>
        <div>
          <Label htmlFor="thumbnailAlt">Project Banner Alt Text</Label>
          <Input id="thumbnailAlt" name="thumbnailAlt" maxLength={300} autoComplete="off" {...bindInput("thumbnailAlt")} />
        </div>
        <div>
          <Label htmlFor="tools">Tools / Software</Label>
          <Input id="tools" name="tools" autoComplete="off" {...bindInput("tools")} />
        </div>
        <CheckboxField name="isFeatured" label="Featured project" defaultChecked={project?.isFeatured} />
      </FormCard>

      <FormCard title="Project Description">
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} {...bindTextarea("description")} />
        </div>
        <div>
          <Label htmlFor="challenge">Challenge</Label>
          <Textarea id="challenge" name="challenge" rows={2} {...bindTextarea("challenge")} />
        </div>
        <div>
          <Label htmlFor="approach">Approach</Label>
          <Textarea id="approach" name="approach" rows={2} {...bindTextarea("approach")} />
        </div>
        <div>
          <Label htmlFor="result">Result</Label>
          <Textarea id="result" name="result" rows={2} {...bindTextarea("result")} />
        </div>
      </FormCard>

      <FormCard title="Internal Linking">
        <Label htmlFor="relatedProjectIds">Related Projects</Label>
        <select
          id="relatedProjectIds"
          name="relatedProjectIds"
          multiple
          defaultValue={relatedProjectIds}
          className="min-h-36 w-full rounded-lg border border-[var(--color-line)] bg-white px-4 py-3 text-sm"
        >
          {availableProjects.map((option) => (
            <option key={option.id} value={option.id}>
              {option.title}{option.status === "draft" ? " (Draft)" : ""}
            </option>
          ))}
        </select>
        <p className={styles.helper}>Optional, up to 3. Automatic category fallback is used when empty.</p>
      </FormCard>

      <FormCard title="Project SEO">
        <div>
          <Label htmlFor="seoTitle">Meta Title</Label>
          <Input id="seoTitle" name="seoTitle" maxLength={200} autoComplete="off" {...bindInput("seoTitle")} />
        </div>
        <div>
          <Label htmlFor="seoDescription">Meta Description</Label>
          <Textarea id="seoDescription" name="seoDescription" rows={2} maxLength={320} {...bindTextarea("seoDescription")} />
        </div>
        <div>
          <Label htmlFor="ogTitle">OG Title — optional override</Label>
          <Input id="ogTitle" name="ogTitle" maxLength={200} autoComplete="off" {...bindInput("ogTitle")} />
        </div>
        <div>
          <Label htmlFor="ogDescription">OG Description — optional override</Label>
          <Textarea id="ogDescription" name="ogDescription" rows={2} maxLength={320} {...bindTextarea("ogDescription")} />
        </div>
        <div>
          <Label htmlFor="ogImageUrl">OG Image — optional override</Label>
          <Input id="ogImageUrl" name="ogImageUrl" autoComplete="off" {...bindInput("ogImageUrl")} />
          <p className={styles.helper}>Blank uses project banner.</p>
        </div>
        <div>
          <Label htmlFor="twitterTitle">Twitter Title — optional override</Label>
          <Input id="twitterTitle" name="twitterTitle" maxLength={200} autoComplete="off" {...bindInput("twitterTitle")} />
        </div>
        <div>
          <Label htmlFor="twitterDescription">Twitter Description</Label>
          <Textarea id="twitterDescription" name="twitterDescription" rows={2} maxLength={320} {...bindTextarea("twitterDescription")} />
        </div>
        <div>
          <Label htmlFor="twitterImageUrl">Twitter Image — optional override</Label>
          <Input id="twitterImageUrl" name="twitterImageUrl" autoComplete="off" {...bindInput("twitterImageUrl")} />
          <p className={styles.helper}>Fallback: Meta → Open Graph → Twitter. No raw schema/code required.</p>
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
