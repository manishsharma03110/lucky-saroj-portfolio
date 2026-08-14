"use client";

import { useActionState } from "react";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormCard, FieldError, CheckboxField } from "@/components/admin/FormParts";
import { createExperience } from "@/lib/actions/experience";
import type { ActionState } from "@/lib/actions/portfolio";

const initialState: ActionState = { status: "idle" };

export function ExperienceForm() {
  const [state, formAction, pending] = useActionState(createExperience, initialState);

  return (
    <FormCard title="Add Experience">
      <form action={formAction} className="space-y-4" key={state.status === "success" ? Date.now() : "form"}>
        <div>
          <Label htmlFor="role">Role</Label>
          <Input id="role" name="role" placeholder="e.g. Freelance Video Editor" required />
          <FieldError message={state.fieldErrors?.role} />
        </div>
        <div>
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" placeholder="e.g. Self-employed" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start</Label>
            <Input id="startDate" name="startDate" placeholder="2023" required />
          </div>
          <div>
            <Label htmlFor="endDate">End</Label>
            <Input id="endDate" name="endDate" placeholder="2024" />
          </div>
        </div>
        <CheckboxField name="isCurrent" label="This is my current role" />
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" placeholder="Remote" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} />
        </div>
        {state.status === "error" && state.message && <p className="text-sm text-red-600">{state.message}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Adding..." : "Add Experience"}
        </Button>
      </form>
    </FormCard>
  );
}
