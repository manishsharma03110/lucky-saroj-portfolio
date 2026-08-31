import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ShowreelForm } from "@/components/admin/ShowreelForm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";

export const metadata: Metadata = { title: "Showreel" };

export default async function AdminShowreelPage() {
  await requirePermission("showreel.read").catch((error) => { if (error instanceof AuthorizationError) notFound(); throw error; });
  const rows = await db.select().from(schema.showreels);
  const showreel = rows[0];

  return (
    <div>
      <AdminPageHeader title="Showreel" description="Manage the showreel featured on your homepage" />
      <div className="max-w-xl">
        <ShowreelForm showreel={showreel} />
      </div>
    </div>
  );
}
