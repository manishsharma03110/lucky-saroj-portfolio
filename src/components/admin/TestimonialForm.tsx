"use client";

import { useActionState } from "react";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FormCard, FieldError, CheckboxField } from "@/components/admin/FormParts";
import { createTestimonial } from "@/lib/actions/testimonials";
import type { ActionState } from "@/lib/actions/portfolio";

const initialState: ActionState = { status: "idle" };

export function TestimonialForm() {
  const [state, formAction, pending] = useActionState(createTestimonial, initialState);

  return (
    <FormCard title="Add Testimonial">
      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="clientName">Client Name</Label>
          <Input id="clientName" name="clientName" required />
          <FieldError message={state.fieldErrors?.clientName} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="designation">Designation</Label>
            <Input id="designation" name="designation" placeholder="Content Creator" />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" />
          </div>
        </div>
        <div>
          <Label htmlFor="testimonialText">Testimonial</Label>
          <Textarea id="testimonialText" name="testimonialText" rows={4} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rating">Rating</Label>
            <Select id="rating" name="rating" defaultValue="5">
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} star{r === 1 ? "" : "s"}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue="published">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </div>
        </div>
        <CheckboxField name="isFeatured" label="Featured on homepage" />
        {state.status === "error" && state.message && <p className="text-sm text-red-600">{state.message}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Adding..." : "Add Testimonial"}
        </Button>
      </form>
    </FormCard>
  );
}
