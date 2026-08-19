"use client";

import { useActionState } from "react";
import { Label, Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FormCard, CheckboxField } from "@/components/admin/FormParts";
import { upsertShowreel } from "@/lib/actions/showreel";
import { FileUpload } from "@/components/admin/FileUpload";
import type { ActionState } from "@/lib/actions/portfolio";
import type { schema } from "@/lib/db";

type Showreel = typeof schema.showreels.$inferSelect;

const initialState: ActionState = { status: "idle" };

export function ShowreelForm({ showreel }: { showreel?: Showreel }) {
  const [state, formAction, pending] = useActionState(upsertShowreel, initialState);

  return (
    <form action={formAction}>
      <FormCard title="Showreel Details">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={showreel?.title ?? "Showreel"} required />
        </div>
                <FileUpload name="thumbnailUrl" label="Showreel Thumbnail" kind="image" defaultValue={showreel?.thumbnailUrl} />
        <FileUpload name="videoUrl" label="Showreel Video" kind="video" defaultValue={showreel?.videoUrl} />
        <div>
          <Label htmlFor="externalVideoUrl">Or paste a YouTube / Vimeo link</Label>
          <Input
            id="externalVideoUrl"
            name="externalVideoUrl"
            placeholder="https://youtube.com/watch?v=..."
            defaultValue={showreel?.videoUrl?.startsWith("http") && !showreel.videoUrl.includes("blob.vercel-storage.com") ? showreel.videoUrl : ""}
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input id="duration" name="duration" placeholder="1:32" defaultValue={showreel?.duration ?? ""} />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={showreel?.status ?? "published"}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
        </div>
        <CheckboxField name="isFeatured" label="Featured on homepage" defaultChecked={showreel?.isFeatured ?? true} />

        {state.status === "error" && state.message && <p className="text-sm text-red-600">{state.message}</p>}
        {state.status === "success" && state.message && <p className="text-sm text-emerald-600">{state.message}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Saving..." : "Save Showreel"}
        </Button>
      </FormCard>
    </form>
  );
}
