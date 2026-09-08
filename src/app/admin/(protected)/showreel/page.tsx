import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ShowreelForm } from "@/components/admin/ShowreelForm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import { eq } from "drizzle-orm";
import { SHOWREEL_ID } from "@/lib/db/singleton-content-service";

export const metadata: Metadata = { title: "Showreel" };

export default async function AdminShowreelPage() {
  await requirePermission("showreel.read").catch((error) => { if (error instanceof AuthorizationError) notFound(); throw error; });
  const rows = await db.select().from(schema.showreels).where(eq(schema.showreels.id, SHOWREEL_ID));
  const showreel = rows[0];
  const mediaReferences = await db.select({ slot: schema.mediaAssetReferences.slot, assetId: schema.mediaAssetReferences.assetId }).from(schema.mediaAssetReferences).where(eq(schema.mediaAssetReferences.showreelId, SHOWREEL_ID));
  const mediaAssetIds = Object.fromEntries(mediaReferences.map((reference) => [reference.slot, reference.assetId]));

  return (
    <div>
      <AdminPageHeader title="Showreel" description="Manage the showreel featured on your homepage" />
      <div className="max-w-xl">
        <ShowreelForm showreel={showreel} mediaAssetIds={mediaAssetIds} />
      </div>
    </div>
  );
}
