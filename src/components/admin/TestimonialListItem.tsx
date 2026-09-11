"use client";

import { Star } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteTestimonial } from "@/lib/actions/testimonials";
import type { schema } from "@/lib/db";
import { TestimonialForm } from "./TestimonialForm";
import styles from "./AdminEditorial.module.css";

type Testimonial = typeof schema.testimonials.$inferSelect;

export function TestimonialListItem({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className={styles.testimonialCard}>
      <div className={styles.cardHeader}>
        <div className={styles.identity}>
          <h3>{testimonial.clientName}</h3>
          <p>{[testimonial.designation, testimonial.company].filter(Boolean).join(", ") || "Client"}</p>
        </div>
        <div className={styles.cardActions}>
          <span className={testimonial.status === "published" ? styles.statusPublished : styles.statusDraft}>
            {testimonial.status === "published" ? "Published" : "Draft"}
          </span>
          <DeleteButton
            confirmText={`Delete testimonial from ${testimonial.clientName}?`}
            onDelete={() => deleteTestimonial(testimonial.id)}
          />
        </div>
      </div>

      <div className={styles.rating} aria-label={`${testimonial.rating} out of 5 stars`}>
        {Array.from({ length: testimonial.rating }).map((_, index) => (
          <Star key={index} size={13} fill="currentColor" strokeWidth={0} />
        ))}
      </div>

      <p className={styles.quote}>{testimonial.testimonialText}</p>

      <details className={styles.disclosure}>
        <summary>Edit testimonial</summary>
        <div className={styles.disclosureBody}>
          <TestimonialForm testimonial={testimonial} />
        </div>
      </details>
    </article>
  );
}
