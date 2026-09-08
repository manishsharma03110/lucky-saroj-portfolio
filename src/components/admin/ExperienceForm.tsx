"use client";

import { useActionState } from "react";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormCard, FieldError, CheckboxField } from "@/components/admin/FormParts";
import { createExperience, updateExperience } from "@/lib/actions/experience";
import type { ActionState } from "@/lib/actions/portfolio";
import type { schema } from "@/lib/db";

const initialState: ActionState = { status: "idle" };

type Experience = typeof schema.experiences.$inferSelect;

export function ExperienceForm({ experience }: { experience?: Experience }) {
  const action = experience ? updateExperience.bind(null, experience.id) : createExperience;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <FormCard title={experience ? "Edit Experience" : "Add Experience"}>
      <form action={formAction} className="space-y-4">
        {experience && <input type="hidden" name="revision" value={state.revision ?? experience.revision} />}
        <div>
          <Label htmlFor="role">Role</Label>
          <Input id="role" name="role" placeholder="e.g. Freelance Video Editor" defaultValue={experience?.role} required />
          <FieldError message={state.fieldErrors?.role} />
        </div>
        <div>
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" placeholder="e.g. Self-employed" defaultValue={experience?.company} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start</Label>
            <Input id="startDate" name="startDate" placeholder="2023" defaultValue={experience?.startDate} required />
          </div>
          <div>
            <Label htmlFor="endDate">End</Label>
            <Input id="endDate" name="endDate" placeholder="2024" defaultValue={experience?.endDate ?? ""} />
          </div>
        </div>
        <CheckboxField name="isCurrent" label="This is my current role" defaultChecked={experience?.isCurrent} />
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" placeholder="Remote" defaultValue={experience?.location ?? ""} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} defaultValue={experience?.description ?? ""} />
        </div>
        {state.status === "error" && state.message && <p className="text-sm text-red-600">{state.message}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Saving..." : experience ? "Save Experience" : "Add Experience"}
        </Button>
      </form>
    </FormCard>
  );
}
