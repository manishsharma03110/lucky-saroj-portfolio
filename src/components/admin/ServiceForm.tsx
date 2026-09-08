"use client";

import { useActionState } from "react";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormCard, FieldError, CheckboxField } from "@/components/admin/FormParts";
import { createService, updateService } from "@/lib/actions/services";
import type { ActionState } from "@/lib/actions/portfolio";
import type { schema } from "@/lib/db";

const initialState: ActionState = { status: "idle" };

const ICON_OPTIONS = [
  "Film", "Sparkles", "Palette", "AudioWaveform", "MonitorPlay",
  "Clapperboard", "Camera", "Video", "Wand2", "Layers",
];

type Service = typeof schema.services.$inferSelect;

export function ServiceForm({ service }: { service?: Service }) {
  const action = service ? updateService.bind(null, service.id) : createService;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <FormCard title={service ? "Edit Service" : "Add Service"}>
      <form action={formAction} className="space-y-4">
        {service && <input type="hidden" name="revision" value={state.revision ?? service.revision} />}
        <div>
          <Label htmlFor="name">Service Name</Label>
          <Input id="name" name="name" placeholder="e.g. Color Grading" defaultValue={service?.name} required />
          <FieldError message={state.fieldErrors?.name} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={2} defaultValue={service?.description ?? ""} />
        </div>
        <div>
          <Label htmlFor="icon">Icon</Label>
          <select
            id="icon"
            name="icon"
            defaultValue={service?.icon ?? "Clapperboard"}
            className="w-full rounded-lg border border-[var(--color-line)] bg-white px-4 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none"
          >
            {ICON_OPTIONS.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
        </div>
        <CheckboxField name="isFeatured" label="Show on homepage" defaultChecked={service?.isFeatured ?? true} />
        <CheckboxField name="isActive" label="Active" defaultChecked={service?.isActive ?? true} />
        {state.status === "error" && state.message && <p className="text-sm text-red-600">{state.message}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Saving..." : service ? "Save Service" : "Add Service"}
        </Button>
      </form>
    </FormCard>
  );
}
