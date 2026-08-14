import type { Metadata } from "next";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ShowreelForm } from "@/components/admin/ShowreelForm";

export const metadata: Metadata = { title: "Showreel" };

export default async function AdminShowreelPage() {
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
