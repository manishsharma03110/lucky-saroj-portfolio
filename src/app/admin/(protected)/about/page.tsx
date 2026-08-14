import type { Metadata } from "next";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AboutForm } from "@/components/admin/AboutForm";

export const metadata: Metadata = { title: "About Me" };

export default async function AdminAboutPage() {
  const profileRows = await db.select().from(schema.aboutProfile);
  const profile = profileRows[0];
  const skills = await db.select().from(schema.aboutSkills).orderBy(schema.aboutSkills.displayOrder);
  const tools = await db.select().from(schema.aboutTools).orderBy(schema.aboutTools.displayOrder);

  return (
    <div>
      <AdminPageHeader title="About Me" description="Edit the content shown on your About page" />
      <AboutForm profile={profile} skills={skills} tools={tools} />
    </div>
  );
}
