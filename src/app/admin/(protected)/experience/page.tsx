import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExperienceForm } from "@/components/admin/ExperienceForm";
import { ExperienceListItem } from "@/components/admin/ExperienceListItem";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";

export const metadata: Metadata = { title: "Experience" };

export default async function AdminExperiencePage() {
  await requirePermission("experience.read").catch((error) => { if (error instanceof AuthorizationError) notFound(); throw error; });
  const experiences = await db.select().from(schema.experiences).orderBy(schema.experiences.displayOrder);

  return (
    <div>
      <AdminPageHeader title="Experience" description="Manage your professional journey timeline" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {experiences.map((exp) => (
            <ExperienceListItem key={exp.id} experience={exp} />
          ))}
          {experiences.length === 0 && (
            <p className="rounded-2xl border border-[var(--color-line)] bg-white px-5 py-8 text-center text-sm text-[var(--color-muted)]">
              No experience entries yet.
            </p>
          )}
        </div>

        <ExperienceForm />
      </div>
    </div>
  );
}
