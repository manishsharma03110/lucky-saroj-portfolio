"use client";

import { useActionState } from "react";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormCard, FieldError } from "@/components/admin/FormParts";
import { updateAboutProfile } from "@/lib/actions/about";
import type { ActionState } from "@/lib/actions/portfolio";
import type { schema } from "@/lib/db";
import { MediaForm } from "@/components/admin/MediaForm";
import { FileUpload } from "@/components/admin/FileUpload";
import styles from "./AdminEditorial.module.css";

type Profile = typeof schema.aboutProfile.$inferSelect;
type Skill = typeof schema.aboutSkills.$inferSelect;
type Tool = typeof schema.aboutTools.$inferSelect;

const initialState: ActionState = { status: "idle" };

export function AboutForm({
  profile,
  skills,
  tools,
  profileImageAssetId,
}: {
  profile: Profile;
  skills: Skill[];
  tools: Tool[];
  profileImageAssetId?: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateAboutProfile, initialState);

  return (
    <MediaForm action={formAction} className={styles.sectionStack}>
      <input type="hidden" name="revision" value={profile.revision} />

      <FormCard title="Profile">
        <FileUpload
          name="profileImageUrl"
          assetIdName="profileImageAssetId"
          label="Profile Image"
          kind="image"
          defaultValue={profile.profileImageUrl}
          defaultAssetId={profileImageAssetId}
        />
        <p className={styles.helper}>Upload, replace, or remove the profile image used on the About page.</p>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={profile.name ?? "Lucky Saroj"} required />
          <FieldError message={state.fieldErrors?.name} />
        </div>
        <div>
          <Label htmlFor="headline">Headline</Label>
          <Input id="headline" name="headline" defaultValue={profile.headline ?? ""} />
        </div>
        <div>
          <Label htmlFor="biography">Biography</Label>
          <Textarea id="biography" name="biography" rows={6} defaultValue={profile.biography ?? ""} />
        </div>
      </FormCard>

      <FormCard title="Stats">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="yearsExperience">Years of Experience</Label>
            <Input id="yearsExperience" name="yearsExperience" type="number" min={0} defaultValue={profile.yearsExperience ?? 0} />
          </div>
          <div>
            <Label htmlFor="projectsCompleted">Projects Completed</Label>
            <Input id="projectsCompleted" name="projectsCompleted" type="number" min={0} defaultValue={profile.projectsCompleted ?? 0} />
          </div>
          <div>
            <Label htmlFor="clientCount">Happy Clients</Label>
            <Input id="clientCount" name="clientCount" type="number" min={0} defaultValue={profile.clientCount ?? 0} />
          </div>
          <div>
            <Label htmlFor="viewsGenerated">Views Generated</Label>
            <Input id="viewsGenerated" name="viewsGenerated" defaultValue={profile.viewsGenerated ?? "0"} />
          </div>
        </div>
      </FormCard>

      <FormCard title="Skills & Tools">
        <div>
          <Label htmlFor="skills">Skills</Label>
          <Input id="skills" name="skills" defaultValue={skills.map((skill) => skill.name).join(", ")} placeholder="Storytelling, Pacing, Sound Design" />
          <p className={styles.helper}>Use commas to separate individual skills.</p>
        </div>
        <div>
          <Label htmlFor="tools">Tools / Software</Label>
          <Input id="tools" name="tools" defaultValue={tools.map((tool) => tool.name).join(", ")} placeholder="Premiere Pro, After Effects" />
          <p className={styles.helper}>Use commas to separate individual tools.</p>
        </div>
      </FormCard>

      {state.status === "error" && state.message && <p className={styles.feedbackError}>{state.message}</p>}
      {state.status === "success" && state.message && <p className={styles.feedbackSuccess}>{state.message}</p>}

      <div className={styles.saveBar}>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </MediaForm>
  );
}
