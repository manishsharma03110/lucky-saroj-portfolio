import "server-only";
import { sql } from "drizzle-orm";
import { withCmsTransaction, type CmsTransactionContext } from "./index";
import { ContentNotFoundError } from "./mutation-errors";
import { prepareMediaSlot, type PreparedMediaSlot } from "./media-asset-service";

export type TestimonialProfileMediaInput = Readonly<{
  profileImageUrl: string | null;
  profileImageAssetId?: string | null;
}>;

function missingTestimonialMediaSchema(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("code" in error)) return false;
  const code = (error as { code?: unknown }).code;
  return code === "42703" || code === "42P01";
}

export async function prepareTestimonialProfileImage(tx: CmsTransactionContext, input: TestimonialProfileMediaInput) {
  return prepareMediaSlot(tx, {
    assetId: input.profileImageAssetId || null,
    url: input.profileImageUrl || null,
    kind: "image",
  });
}

export async function synchronizeTestimonialProfileImage(
  tx: CmsTransactionContext,
  testimonialId: string,
  prepared: PreparedMediaSlot
): Promise<void> {
  const current = await tx.query<{ id: string; asset_id: string }>(
    "SELECT id,asset_id FROM media_asset_references WHERE owner_type='testimonial' AND testimonial_id=$1 AND slot='profile_image' FOR UPDATE",
    [testimonialId]
  );
  const oldAssetId = current.rows[0]?.asset_id ?? null;
  if (oldAssetId === prepared.assetId) return;

  if (prepared.assetId) {
    if (current.rows[0]) {
      await tx.db.update(sql`UPDATE media_asset_references SET asset_id=${prepared.assetId} WHERE id=${current.rows[0].id}`);
    } else {
      await tx.db.insert(sql`INSERT INTO media_asset_references(id,asset_id,owner_type,testimonial_id,slot) VALUES (${crypto.randomUUID()},${prepared.assetId},'testimonial',${testimonialId},'profile_image')`);
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

export async function getTestimonialProfileAssetIds(): Promise<Record<string, string>> {
  try {
    return await withCmsTransaction(async (tx) => {
      const result = await tx.query<{ testimonial_id: string; asset_id: string }>(
        "SELECT testimonial_id,asset_id FROM media_asset_references WHERE owner_type='testimonial' AND slot='profile_image' AND testimonial_id IS NOT NULL",
        []
      );
      return Object.fromEntries(result.rows.map((row) => [row.testimonial_id, row.asset_id]));
    });
  } catch (error) {
    if (missingTestimonialMediaSchema(error)) return {};
    throw error;
  }
}

export async function deleteTestimonialWithMedia(id: string): Promise<void> {
  await withCmsTransaction(async (tx) => {
    const exists = await tx.db.select(sql`SELECT 1 FROM testimonials WHERE id=${id} FOR UPDATE`);
    if (!exists.rows[0]) throw new ContentNotFoundError();

    let oldAssetId: string | null = null;
    try {
      const current = await tx.query<{ asset_id: string }>(
        "SELECT asset_id FROM media_asset_references WHERE owner_type='testimonial' AND testimonial_id=$1 AND slot='profile_image' FOR UPDATE",
        [id]
      );
      oldAssetId = current.rows[0]?.asset_id ?? null;
      await tx.query("DELETE FROM media_asset_references WHERE owner_type='testimonial' AND testimonial_id=$1", [id]);
    } catch (error) {
      if (!missingTestimonialMediaSchema(error)) throw error;
    }

    await tx.db.delete(sql`DELETE FROM testimonials WHERE id=${id}`);

    if (oldAssetId) {
      const count = await tx.db.count(sql`SELECT count(*) FROM media_asset_references WHERE asset_id=${oldAssetId}`);
      await tx.db.update(sql`UPDATE media_assets SET state=${count === 0 ? "orphaned" : "attached"},updated_at=now() WHERE id=${oldAssetId} AND state IN ('pending','attached','orphaned')`);
    }
  });
}
