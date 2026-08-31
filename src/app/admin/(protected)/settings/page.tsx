import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await requirePermission("settings.read").catch((error) => { if (error instanceof AuthorizationError) notFound(); throw error; });
  const rows = await db.select().from(schema.siteSettings);
  const settings = rows[0];

  return (
    <div>
      <AdminPageHeader title="Site Settings" description="Manage site-wide information" />
      <SettingsForm settings={settings} />
    </div>
  );
}
