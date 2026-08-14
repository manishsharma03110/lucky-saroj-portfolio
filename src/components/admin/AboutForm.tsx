"use client";

import { useActionState } from "react";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormCard, FieldError } from "@/components/admin/FormParts";
import { updateAboutProfile } from "@/lib/actions/about";
import type { ActionState } from "@/lib/actions/portfolio";
import type { schema } from "@/lib/db";

type Profile = typeof schema.aboutProfile.$inferSelect;
type Skill = typeof schema.aboutSkills.$inferSelect;
type Tool = typeof schema.aboutTools.$inferSelect;

const initialState: ActionState = { status: "idle" };

export function AboutForm({
  profile,
  skills,
  tools,
}: {
  profile?: Profile;
  skills: Skill[];
  tools: Tool[];
}) {
  const [state, formAction, pending] = useActionState(updateAboutProfile, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <FormCard title="Profile">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={profile?.name ?? "Lucky Saroj"} required />
          <FieldError message={state.fieldErrors?.name} />
        </div>
        <div>
          <Label htmlFor="headline">Headline</Label>
          <Input id="headline" name="headline" defaultValue={profile?.headline ?? ""} />
        </div>
        <div>
          <Label htmlFor="biography">Biography</Label>
          <Textarea id="biography" name="biography" rows={5} defaultValue={profile?.biography ?? ""} />
        </div>
      </FormCard>

      <FormCard title="Stats">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="yearsExperience">Years of Experience</Label>
            <Input id="yearsExperience" name="yearsExperience" type="number" min={0} defaultValue={profile?.yearsExperience ?? 0} />
          </div>
          <div>
            <Label htmlFor="projectsCompleted">Projects Completed</Label>
            <Input id="projectsCompleted" name="projectsCompleted" type="number" min={0} defaultValue={profile?.projectsCompleted ?? 0} />
          </div>
          <div>
            <Label htmlFor="clientCount">Happy Clients</Label>
            <Input id="clientCount" name="clientCount" type="number" min={0} defaultValue={profile?.clientCount ?? 0} />
          </div>
          <div>
            <Label htmlFor="viewsGenerated">Views Generated</Label>
            <Input id="viewsGenerated" name="viewsGenerated" defaultValue={profile?.viewsGenerated ?? "0"} />
          </div>
        </div>
      </FormCard>

      <FormCard title="Skills & Tools">
        <div>
          <Label htmlFor="skills">Skills</Label>
          <Input id="skills" name="skills" defaultValue={skills.map((s) => s.name).join(", ")} placeholder="Storytelling, Pacing, Sound Design" />
          <p className="mt-1 text-xs text-[var(--color-muted)]">Comma-separated</p>
        </div>
        <div>
          <Label htmlFor="tools">Tools / Software</Label>
          <Input id="tools" name="tools" defaultValue={tools.map((t) => t.name).join(", ")} placeholder="Premiere Pro, After Effects" />
          <p className="mt-1 text-xs text-[var(--color-muted)]">Comma-separated</p>
        </div>
      </FormCard>

      {state.status === "error" && state.message && <p className="text-sm text-red-600">{state.message}</p>}
      {state.status === "success" && state.message && <p className="text-sm text-emerald-600">{state.message}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
