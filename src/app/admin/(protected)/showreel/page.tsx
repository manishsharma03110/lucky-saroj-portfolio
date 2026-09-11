import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ShowreelForm } from "@/components/admin/ShowreelForm";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import { eq } from "drizzle-orm";
import { SHOWREEL_ID } from "@/lib/db/singleton-content-service";
import styles from "@/components/admin/AdminEditorial.module.css";

export const metadata: Metadata = { title: "Showreel" };

export default async function AdminShowreelPage() {
  await requirePermission("showreel.read").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });

  const rows = await db.select().from(schema.showreels).where(eq(schema.showreels.id, SHOWREEL_ID));
  const showreel = rows[0];
  const mediaReferences = await db
    .select({ slot: schema.mediaAssetReferences.slot, assetId: schema.mediaAssetReferences.assetId })
    .from(schema.mediaAssetReferences)
    .where(eq(schema.mediaAssetReferences.showreelId, SHOWREEL_ID));
  const mediaAssetIds = Object.fromEntries(mediaReferences.map((reference) => [reference.slot, reference.assetId]));

  return (
    <div>
      <AdminPageHeader
        eyebrow="Featured media"
        title="Showreel"
        description="Manage the thumbnail, video, status, and homepage visibility of your featured showreel."
      />
      <div className={styles.singleColumn}>
        <ShowreelForm showreel={showreel} mediaAssetIds={mediaAssetIds} />
      </div>
    </div>
  );
}
