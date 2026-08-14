"use client";

import { useActionState } from "react";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormCard, FieldError, CheckboxField } from "@/components/admin/FormParts";
import { createService } from "@/lib/actions/services";
import type { ActionState } from "@/lib/actions/portfolio";

const initialState: ActionState = { status: "idle" };

const ICON_OPTIONS = [
  "Film", "Sparkles", "Palette", "AudioWaveform", "MonitorPlay",
  "Clapperboard", "Camera", "Video", "Wand2", "Layers",
];

export function ServiceForm() {
  const [state, formAction, pending] = useActionState(createService, initialState);

  return (
    <FormCard title="Add Service">
      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="name">Service Name</Label>
          <Input id="name" name="name" placeholder="e.g. Color Grading" required />
          <FieldError message={state.fieldErrors?.name} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={2} />
        </div>
        <div>
          <Label htmlFor="icon">Icon</Label>
          <select
            id="icon"
            name="icon"
            defaultValue="Clapperboard"
            className="w-full rounded-lg border border-[var(--color-line)] bg-white px-4 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none"
          >
            {ICON_OPTIONS.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
        </div>
        <CheckboxField name="isFeatured" label="Show on homepage" defaultChecked />
        <CheckboxField name="isActive" label="Active" defaultChecked />
        {state.status === "error" && state.message && <p className="text-sm text-red-600">{state.message}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Adding..." : "Add Service"}
        </Button>
      </form>
    </FormCard>
  );
}
