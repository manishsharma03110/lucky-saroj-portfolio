import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { TestimonialListItem } from "@/components/admin/TestimonialListItem";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import contentStyles from "@/components/admin/AdminContent.module.css";

export const metadata: Metadata = { title: "Testimonials" };

export default async function AdminTestimonialsPage() {
  await requirePermission("testimonials.read").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });

  const testimonials = await db.select().from(schema.testimonials).orderBy(desc(schema.testimonials.createdAt));

  return (
    <div>
      <AdminPageHeader
        eyebrow="Social proof"
        title="Testimonials"
        description="Manage client feedback, ratings, visibility, and homepage highlights."
      />

      <div className={contentStyles.twoColumnWide}>
        <div className={contentStyles.listStack}>
          {testimonials.map((testimonial) => (
            <TestimonialListItem key={testimonial.id} testimonial={testimonial} />
          ))}
          {testimonials.length === 0 && (
            <div className={contentStyles.emptyState}>No testimonials yet. Add your first client testimonial from the form.</div>
          )}
        </div>
        <TestimonialForm />
      </div>
    </div>
  );
}
