import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { TestimonialListItem } from "@/components/admin/TestimonialListItem";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";

export const metadata: Metadata = { title: "Testimonials" };

export default async function AdminTestimonialsPage() {
  await requirePermission("testimonials.read").catch((error) => { if (error instanceof AuthorizationError) notFound(); throw error; });
  const testimonials = await db.select().from(schema.testimonials).orderBy(desc(schema.testimonials.createdAt));

  return (
    <div>
      <AdminPageHeader title="Testimonials" description="Manage client testimonials" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {testimonials.map((t) => (
            <TestimonialListItem key={t.id} testimonial={t} />
          ))}
          {testimonials.length === 0 && (
            <p className="rounded-2xl border border-[var(--color-line)] bg-white px-5 py-8 text-center text-sm text-[var(--color-muted)]">
              No testimonials yet.
            </p>
          )}
        </div>
        <TestimonialForm />
      </div>
    </div>
  );
}
