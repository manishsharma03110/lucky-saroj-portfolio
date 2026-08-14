import type { Metadata } from "next";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const rows = await db.select().from(schema.siteSettings);
  const settings = rows[0];

  return (
    <div>
      <AdminPageHeader title="Site Settings" description="Manage site-wide information" />
      <SettingsForm settings={settings} />
    </div>
  );
}
