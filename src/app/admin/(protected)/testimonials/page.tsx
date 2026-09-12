import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { TestimonialListItem } from "@/components/admin/TestimonialListItem";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import { getTestimonialProfileAssetIds } from "@/lib/db/testimonial-media-service";
import contentStyles from "@/components/admin/AdminContent.module.css";

export const metadata: Metadata = { title: "Testimonials" };

export default async function AdminTestimonialsPage() {
  await requirePermission("testimonials.read").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });

  const [testimonials, profileAssetIds] = await Promise.all([
    db.select().from(schema.testimonials).orderBy(desc(schema.testimonials.createdAt)),
    getTestimonialProfileAssetIds(),
  ]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Social proof"
        title="Testimonials"
        description="Manage client feedback, ratings, profile images, visibility, and homepage highlights."
      />

      <div className={contentStyles.twoColumnWide}>
        <div className={contentStyles.listStack}>
          {testimonials.map((testimonial) => (
            <TestimonialListItem
              key={testimonial.id}
              testimonial={testimonial}
              profileImageAssetId={profileAssetIds[testimonial.id] ?? null}
            />
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
