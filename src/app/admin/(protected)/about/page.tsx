import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { ABOUT_ID } from "@/lib/db/about-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AboutForm } from "@/components/admin/AboutForm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import styles from "@/components/admin/AdminEditorial.module.css";

export const metadata: Metadata = { title: "About Me" };

export default async function AdminAboutPage() {
  await requirePermission("about.read").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });

  const profileRows = await db.select().from(schema.aboutProfile).where(eq(schema.aboutProfile.id, ABOUT_ID));
  const profile = profileRows[0];
  if (!profile) notFound();

  const skills = await db.select().from(schema.aboutSkills).orderBy(schema.aboutSkills.displayOrder);
  const tools = await db.select().from(schema.aboutTools).orderBy(schema.aboutTools.displayOrder);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Profile"
        title="About Me"
        description="Edit the biography, profile metrics, skills, and tools shown on your About page."
      />
      <div className={styles.singleColumn}>
        <AboutForm profile={profile} skills={skills} tools={tools} />
      </div>
    </div>
  );
}
