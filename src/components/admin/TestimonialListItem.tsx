"use client";

import { Star } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteTestimonial } from "@/lib/actions/testimonials";
import type { schema } from "@/lib/db";

type Testimonial = typeof schema.testimonials.$inferSelect;

export function TestimonialListItem({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
      <div className="mb-2 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-sm font-semibold text-[var(--color-ink)]">
            {testimonial.clientName}
          </h3>
          <p className="text-xs text-[var(--color-muted)]">
            {[testimonial.designation, testimonial.company].filter(Boolean).join(", ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={
              "rounded-full px-2.5 py-1 text-xs font-medium " +
              (testimonial.status === "published"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-neutral-100 text-neutral-500")
            }
          >
            {testimonial.status}
          </span>
          <DeleteButton confirmText={`Delete testimonial from ${testimonial.clientName}?`} onDelete={() => deleteTestimonial(testimonial.id)} />
        </div>
      </div>
      <div className="mb-2 flex gap-0.5 text-[var(--color-accent)]">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
        ))}
      </div>
      <p className="text-sm text-[var(--color-muted)]">{testimonial.testimonialText}</p>
    </div>
  );
}
