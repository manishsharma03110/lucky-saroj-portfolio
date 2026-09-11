import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExperienceForm } from "@/components/admin/ExperienceForm";
import { ExperienceListItem } from "@/components/admin/ExperienceListItem";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import styles from "@/components/admin/AdminContent.module.css";

export const metadata: Metadata = { title: "Experience" };

export default async function AdminExperiencePage() {
  await requirePermission("experience.read").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });

  const experiences = await db.select().from(schema.experiences).orderBy(schema.experiences.displayOrder);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Career"
        title="Experience"
        description="Manage your professional history, roles, and career highlights."
      />

      <div className={styles.twoColumnWide}>
        <div className={styles.listStack}>
          {experiences.map((experience) => (
            <ExperienceListItem key={experience.id} experience={experience} />
          ))}
          {experiences.length === 0 && (
            <div className={styles.emptyState}>No experience entries yet. Add your first role from the form.</div>
          )}
        </div>

        <ExperienceForm />
      </div>
    </div>
  );
}
