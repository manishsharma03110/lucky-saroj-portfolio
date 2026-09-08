import "server-only";
import { sql } from "drizzle-orm";
import type { SettingsInput } from "../validations/settings";
import type { ShowreelInput } from "../validations/showreel";
import { withCmsTransaction } from "./index";
import { ContentNotFoundError, InvalidSingletonStateError, postgresErrorFields, StaleRevisionError } from "./mutation-errors";
import { synchronizeMutationTest, type MutationTestSynchronization } from "./mutation-test-synchronization";
import { prepareMediaSlot, synchronizeMediaSlot } from "./media-asset-service";

export const SETTINGS_ID = "singleton:settings";
export const SHOWREEL_ID = "singleton:showreel";

export async function updateSingletonSettings(input: SettingsInput, expectedRevision: number, testSynchronization?: MutationTestSynchronization): Promise<number> {
  return withCmsTransaction(async (tx) => {
    const heroImage = await prepareMediaSlot(tx, { assetId: input.heroImageAssetId || null, url: input.heroImageUrl || null, kind: "image" });
    await synchronizeMutationTest(tx, testSynchronization);
    const result = await tx.db.update<{ revision: number }>(sql`UPDATE site_settings SET site_name=${input.siteName},logo_text=${input.logoText},contact_email=${input.contactEmail},contact_phone=${input.contactPhone},whatsapp=${input.whatsapp || null},location=${input.location},availability=${input.availability},payment_terms=${input.paymentTerms || null},turnaround_time=${input.turnaroundTime || null},hero_heading=${input.heroHeading},hero_subheading=${input.heroSubheading},hero_description=${input.heroDescription},hero_image_url=${heroImage.url},stat_years=${input.statYears},stat_projects=${input.statProjects},stat_clients=${input.statClients},stat_views=${input.statViews},footer_description=${input.footerDescription},instagram_url=${input.instagramUrl || null},twitter_url=${input.twitterUrl || null},youtube_url=${input.youtubeUrl || null},linkedin_url=${input.linkedinUrl || null},behance_url=${input.behanceUrl || null},vimeo_url=${input.vimeoUrl || null},seo_title=${input.seoTitle},seo_description=${input.seoDescription || null},revision=revision+1 WHERE id=${SETTINGS_ID} AND revision=${expectedRevision} RETURNING revision`);
    if (result.rows[0]) {
      await synchronizeMediaSlot(tx, { entityType: "site_settings", entityId: SETTINGS_ID, slot: "hero_image" }, heroImage);
      return result.rows[0].revision;
    }
    const exists = await tx.db.select(sql`SELECT 1 FROM site_settings WHERE id=${SETTINGS_ID}`);
    if (!exists.rows[0]) throw new ContentNotFoundError();
    throw new StaleRevisionError();
  });
}

export async function upsertSingletonShowreel(input: Omit<ShowreelInput, "thumbnailUrl"> & { thumbnailUrl: string | null }, expectedRevision: number | null, testSynchronization?: MutationTestSynchronization): Promise<number> {
  return withCmsTransaction(async (tx) => {
    const thumbnail = await prepareMediaSlot(tx, { assetId: input.thumbnailAssetId || null, url: input.thumbnailUrl, kind: "image" });
    const video = await prepareMediaSlot(tx, { assetId: input.videoAssetId || null, url: input.videoUrl || null, kind: "video" });
    const current = await tx.db.select<{ revision: number }>(sql`SELECT revision FROM showreels WHERE id=${SHOWREEL_ID} FOR UPDATE`);
    if (!current.rows[0]) {
      if (expectedRevision !== null) throw new ContentNotFoundError();
      await synchronizeMutationTest(tx, testSynchronization);
      try {
        const created = await tx.db.insert<{ revision: number }>(sql`INSERT INTO showreels(id,title,video_url,thumbnail_url,duration,is_featured,status,revision) VALUES (${SHOWREEL_ID},${input.title},${video.url},${thumbnail.url},${input.duration || null},${input.isFeatured ?? true},${input.status},1) RETURNING revision`);
        await synchronizeMediaSlot(tx, { entityType: "showreel", entityId: SHOWREEL_ID, slot: "thumbnail" }, thumbnail);
        await synchronizeMediaSlot(tx, { entityType: "showreel", entityId: SHOWREEL_ID, slot: "video" }, video);
        return created.rows[0].revision;
      } catch (error) {
        const fields = postgresErrorFields(error);
        if (fields.code === "23505" && fields.constraint === "showreels_pkey") throw new InvalidSingletonStateError();
        throw error;
      }
    }
    if (expectedRevision === null || current.rows[0].revision !== expectedRevision) throw new StaleRevisionError();
    const updated = await tx.db.update<{ revision: number }>(sql`UPDATE showreels SET title=${input.title},video_url=${video.url},thumbnail_url=${thumbnail.url},duration=${input.duration || null},is_featured=${input.isFeatured ?? true},status=${input.status},revision=revision+1 WHERE id=${SHOWREEL_ID} AND revision=${expectedRevision} RETURNING revision`);
    if (!updated.rows[0]) throw new StaleRevisionError();
    await synchronizeMediaSlot(tx, { entityType: "showreel", entityId: SHOWREEL_ID, slot: "thumbnail" }, thumbnail);
    await synchronizeMediaSlot(tx, { entityType: "showreel", entityId: SHOWREEL_ID, slot: "video" }, video);
    return updated.rows[0].revision;
  });
}
