"use client";

import { useActionState } from "react";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FormCard, FieldError, CheckboxField } from "@/components/admin/FormParts";
import { createTestimonial, updateTestimonial } from "@/lib/actions/testimonials";
import type { ActionState } from "@/lib/actions/portfolio";
import type { schema } from "@/lib/db";
import { MediaForm } from "@/components/admin/MediaForm";
import { FileUpload } from "@/components/admin/FileUpload";
import styles from "@/components/admin/AdminEditorial.module.css";

const initialState: ActionState = { status: "idle" };

type Testimonial = typeof schema.testimonials.$inferSelect;

export function TestimonialForm({ testimonial, profileImageAssetId }: { testimonial?: Testimonial; profileImageAssetId?: string | null }) {
  const action = testimonial ? updateTestimonial.bind(null, testimonial.id) : createTestimonial;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <FormCard title={testimonial ? "Edit Testimonial" : "Add Testimonial"}>
      <MediaForm action={formAction} className="space-y-4">
        {testimonial && <input type="hidden" name="revision" value={state.revision ?? testimonial.revision} />}
        <FileUpload
          name="profileImageUrl"
          assetIdName="profileImageAssetId"
          label="Client Profile Image"
          kind="image"
          defaultValue={testimonial?.profileImageUrl}
          defaultAssetId={profileImageAssetId}
        />
        <p className={styles.helper}>Optional. Upload, replace, or remove the client image shown with published testimonials.</p>
        <div>
          <Label htmlFor={`clientName-${testimonial?.id ?? "new"}`}>Client Name</Label>
          <Input id={`clientName-${testimonial?.id ?? "new"}`} name="clientName" defaultValue={testimonial?.clientName} required />
          <FieldError message={state.fieldErrors?.clientName} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`designation-${testimonial?.id ?? "new"}`}>Designation</Label>
            <Input id={`designation-${testimonial?.id ?? "new"}`} name="designation" placeholder="Content Creator" defaultValue={testimonial?.designation ?? ""} />
          </div>
          <div>
            <Label htmlFor={`company-${testimonial?.id ?? "new"}`}>Company</Label>
            <Input id={`company-${testimonial?.id ?? "new"}`} name="company" defaultValue={testimonial?.company ?? ""} />
          </div>
        </div>
        <div>
          <Label htmlFor={`testimonialText-${testimonial?.id ?? "new"}`}>Testimonial</Label>
          <Textarea id={`testimonialText-${testimonial?.id ?? "new"}`} name="testimonialText" rows={4} defaultValue={testimonial?.testimonialText} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`rating-${testimonial?.id ?? "new"}`}>Rating</Label>
            <Select id={`rating-${testimonial?.id ?? "new"}`} name="rating" defaultValue={String(testimonial?.rating ?? 5)}>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} star{r === 1 ? "" : "s"}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor={`status-${testimonial?.id ?? "new"}`}>Status</Label>
            <Select id={`status-${testimonial?.id ?? "new"}`} name="status" defaultValue={testimonial?.status ?? "published"}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </div>
        </div>
        <CheckboxField name="isFeatured" label="Featured on homepage" defaultChecked={testimonial?.isFeatured} />
        {state.status === "error" && state.message && <p className="text-sm text-red-600">{state.message}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Saving..." : testimonial ? "Save Testimonial" : "Add Testimonial"}
        </Button>
      </MediaForm>
    </FormCard>
  );
}
