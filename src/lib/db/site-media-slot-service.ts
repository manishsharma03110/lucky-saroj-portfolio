import "server-only";
import { sql } from "drizzle-orm";
import type { CmsTransactionContext } from "./index";
import { prepareMediaSlot, type MediaSlotInput, MediaAssetBindingError, MediaAssetNotAttachableError, MediaAssetNotFoundError } from "./media-asset-service";

export const SITE_SETTINGS_ID = "singleton:settings";

export const SITE_IMAGE_SLOTS = [
  "hero_image",
  "about_profile_image",
  "logo_image",
  "favicon",
  "og_image",
] as const;

export type SiteImageSlot = (typeof SITE_IMAGE_SLOTS)[number];

export async function prepareSiteImageSlot(tx: CmsTransactionContext, input: MediaSlotInput) {
  if (input.kind !== "image") throw new MediaAssetBindingError();
  return prepareMediaSlot(tx, input);
}

export async function synchronizeSiteImageSlot(
  tx: CmsTransactionContext,
  slot: SiteImageSlot,
  prepared: Awaited<ReturnType<typeof prepareSiteImageSlot>>
): Promise<void> {
  const current = await tx.query<{ id: string; asset_id: string }>(
    "SELECT id,asset_id FROM media_asset_references WHERE owner_type='site_settings' AND site_settings_id=$1 AND slot=$2 FOR UPDATE",
    [SITE_SETTINGS_ID, slot]
  );
  const oldAssetId = current.rows[0]?.asset_id ?? null;

  if (prepared.assetId) {
    const asset = await tx.query<{ id: string; url: string | null; kind: "image" | "video"; state: string }>(
      "SELECT id,url,kind,state FROM media_assets WHERE id=$1 FOR UPDATE",
      [prepared.assetId]
    );
    const row = asset.rows[0];
    if (!row) throw new MediaAssetNotFoundError();
    if (!row.url || row.url !== prepared.url || row.kind !== "image") throw new MediaAssetBindingError();
    if (!["pending", "attached", "orphaned"].includes(row.state)) throw new MediaAssetNotAttachableError();
  }

  if (oldAssetId === prepared.assetId) return;

  if (prepared.assetId) {
    if (current.rows[0]) {
      await tx.db.update(sql`UPDATE media_asset_references SET asset_id=${prepared.assetId} WHERE id=${current.rows[0].id}`);
    } else {
      await tx.db.insert(sql`INSERT INTO media_asset_references(id,asset_id,owner_type,site_settings_id,slot) VALUES (${crypto.randomUUID()},${prepared.assetId},'site_settings',${SITE_SETTINGS_ID},${slot})`);
    }
    await tx.db.update(sql`UPDATE media_assets SET state='attached',updated_at=now() WHERE id=${prepared.assetId}`);
  } else if (current.rows[0]) {
    await tx.db.delete(sql`DELETE FROM media_asset_references WHERE id=${current.rows[0].id}`);
  }

  if (oldAssetId) {
    const count = await tx.db.count(sql`SELECT count(*) FROM media_asset_references WHERE asset_id=${oldAssetId}`);
    await tx.db.update(sql`UPDATE media_assets SET state=${count === 0 ? "orphaned" : "attached"},updated_at=now() WHERE id=${oldAssetId} AND state IN ('pending','attached','orphaned')`);
  }
}
