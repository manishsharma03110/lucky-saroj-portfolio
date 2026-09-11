import "server-only";
import { sql } from "drizzle-orm";
import { withCmsTransaction } from "./index";
import { ContentNotFoundError, DuplicateContentError, StaleRevisionError } from "./mutation-errors";
import { synchronizeMutationTest, type MutationTestSynchronization } from "./mutation-test-synchronization";
import { prepareSiteImageSlot, synchronizeSiteImageSlot } from "./site-media-slot-service";

export const ABOUT_ID = "singleton:about";
export type OrderedName = Readonly<{ name: string; displayOrder: number }>;
export type ReplaceAboutInput = Readonly<{
  expectedRevision: number; name: string; headline: string | null; biography: string | null;
  profileImageUrl: string | null; profileImageAssetId: string | null;
  yearsExperience: number; projectsCompleted: number; clientCount: number; viewsGenerated: string;
  skills: readonly OrderedName[]; tools: readonly OrderedName[];
}>;

function validateChildren(label: string, rows: readonly OrderedName[]): void {
  const names = new Set<string>(); const orders = new Set<number>();
  for (const row of rows) {
    if (!row.name || row.name !== row.name.trim()) throw new DuplicateContentError(`${label} names must be non-empty and normalized.`);
    if (!Number.isInteger(row.displayOrder) || row.displayOrder < 0) throw new DuplicateContentError(`${label} order is invalid.`);
    if (names.has(row.name)) throw new DuplicateContentError(`${label} names must be unique.`);
    if (orders.has(row.displayOrder)) throw new DuplicateContentError(`${label} order must be unique.`);
    names.add(row.name); orders.add(row.displayOrder);
  }
}

export async function replaceAbout(input: ReplaceAboutInput, testSynchronization?: MutationTestSynchronization): Promise<number> {
  validateChildren("Skill", input.skills); validateChildren("Tool", input.tools);
  return withCmsTransaction(async (tx) => {
    const profileImage = await prepareSiteImageSlot(tx, {
      assetId: input.profileImageAssetId,
      url: input.profileImageUrl,
      kind: "image",
    });
    await synchronizeMutationTest(tx, testSynchronization);
    const locked = await tx.db.select<{ revision: number }>(sql`SELECT revision FROM about_profile WHERE id=${ABOUT_ID} FOR UPDATE`);
    if (!locked.rows[0]) throw new ContentNotFoundError();
    if (locked.rows[0].revision !== input.expectedRevision) throw new StaleRevisionError();
    const updated = await tx.db.update<{ revision: number }>(sql`UPDATE about_profile SET profile_image_url=${profileImage.url},name=${input.name},headline=${input.headline},biography=${input.biography},years_experience=${input.yearsExperience},projects_completed=${input.projectsCompleted},client_count=${input.clientCount},views_generated=${input.viewsGenerated},revision=revision+1 WHERE id=${ABOUT_ID} AND revision=${input.expectedRevision} RETURNING revision`);
    if (!updated.rows[0]) throw new StaleRevisionError();
    await synchronizeSiteImageSlot(tx, "about_profile_image", profileImage);
    await tx.db.delete(sql`DELETE FROM about_skills WHERE profile_id=${ABOUT_ID}`);
    for (const child of input.skills) await tx.db.insert(sql`INSERT INTO about_skills(id,profile_id,name,display_order) VALUES (${crypto.randomUUID()},${ABOUT_ID},${child.name},${child.displayOrder})`);
    await tx.db.delete(sql`DELETE FROM about_tools WHERE profile_id=${ABOUT_ID}`);
    for (const child of input.tools) await tx.db.insert(sql`INSERT INTO about_tools(id,profile_id,name,display_order) VALUES (${crypto.randomUUID()},${ABOUT_ID},${child.name},${child.displayOrder})`);
    return updated.rows[0].revision;
  });
}
