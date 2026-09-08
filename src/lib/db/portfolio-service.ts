import "server-only";
import { sql } from "drizzle-orm";
import type { ProjectInput } from "../validations/project";
import { withCmsTransaction } from "./index";
import { ContentNotFoundError, DuplicateContentError, DuplicateSlugError, postgresErrorFields, StaleRevisionError } from "./mutation-errors";
import { synchronizeMutationTest, type MutationTestSynchronization } from "./mutation-test-synchronization";
import { prepareMediaSlot, synchronizeMediaSlot } from "./media-asset-service";

export type ProjectMutationInput = Omit<ProjectInput, "tools"> & { tools: readonly string[] };
function validateTools(tools: readonly string[]): void {
  const seen = new Set<string>();
  for (const tool of tools) {
    if (!tool || tool !== tool.trim()) throw new DuplicateContentError("Tool names must be non-empty and normalized.");
    if (seen.has(tool)) throw new DuplicateContentError("Tool names must be unique.");
    seen.add(tool);
  }
}
function isSlugConflict(error: unknown): boolean {
  const fields = postgresErrorFields(error);
  return fields.code === "23505" && fields.constraint === "portfolio_projects_slug_unique";
}

export async function createPortfolioProject(input: ProjectMutationInput): Promise<string> {
  validateTools(input.tools);
  try {
    return await withCmsTransaction(async (tx) => {
      const id = crypto.randomUUID();
      const thumbnail = await prepareMediaSlot(tx, { assetId: input.thumbnailAssetId || null, url: input.thumbnailUrl || null, kind: "image" });
      const video = await prepareMediaSlot(tx, { assetId: input.videoAssetId || null, url: input.videoUrl || null, kind: "video" });
      await tx.db.insert(sql`INSERT INTO portfolio_projects(id,title,slug,client_name,year,category_id,description,challenge,approach,result,thumbnail_url,video_url,is_featured,status,seo_title,seo_description,revision) VALUES (${id},${input.title},${input.slug},${input.clientName || null},${input.year ?? null},${input.categoryId || null},${input.description || null},${input.challenge || null},${input.approach || null},${input.result || null},${input.thumbnailUrl || null},${input.videoUrl || null},${input.isFeatured ?? false},${input.status},${input.seoTitle || null},${input.seoDescription || null},1)`);
      for (const tool of input.tools) await tx.db.insert(sql`INSERT INTO project_tools(id,project_id,name) VALUES (${crypto.randomUUID()},${id},${tool})`);
      await synchronizeMediaSlot(tx, { entityType: "portfolio_project", entityId: id, slot: "thumbnail" }, thumbnail);
      await synchronizeMediaSlot(tx, { entityType: "portfolio_project", entityId: id, slot: "video" }, video);
      return id;
    });
  } catch (error) { if (isSlugConflict(error)) throw new DuplicateSlugError(); throw error; }
}

export async function updatePortfolioProject(id: string, expectedRevision: number, input: ProjectMutationInput, testSynchronization?: MutationTestSynchronization): Promise<number> {
  validateTools(input.tools);
  try {
    return await withCmsTransaction(async (tx) => {
      const thumbnail = await prepareMediaSlot(tx, { assetId: input.thumbnailAssetId || null, url: input.thumbnailUrl || null, kind: "image" });
      const video = await prepareMediaSlot(tx, { assetId: input.videoAssetId || null, url: input.videoUrl || null, kind: "video" });
      await synchronizeMutationTest(tx, testSynchronization);
      const updated = await tx.db.update<{ revision: number }>(sql`UPDATE portfolio_projects SET title=${input.title},slug=${input.slug},client_name=${input.clientName || null},year=${input.year ?? null},category_id=${input.categoryId || null},description=${input.description || null},challenge=${input.challenge || null},approach=${input.approach || null},result=${input.result || null},thumbnail_url=${input.thumbnailUrl || null},video_url=${input.videoUrl || null},is_featured=${input.isFeatured ?? false},status=${input.status},seo_title=${input.seoTitle || null},seo_description=${input.seoDescription || null},updated_at=now(),revision=revision+1 WHERE id=${id} AND revision=${expectedRevision} RETURNING revision`);
      if (!updated.rows[0]) {
        const exists = await tx.db.select(sql`SELECT 1 FROM portfolio_projects WHERE id=${id}`);
        if (!exists.rows[0]) throw new ContentNotFoundError();
        throw new StaleRevisionError();
      }
      await tx.db.delete(sql`DELETE FROM project_tools WHERE project_id=${id}`);
      for (const tool of input.tools) await tx.db.insert(sql`INSERT INTO project_tools(id,project_id,name) VALUES (${crypto.randomUUID()},${id},${tool})`);
      await synchronizeMediaSlot(tx, { entityType: "portfolio_project", entityId: id, slot: "thumbnail" }, thumbnail);
      await synchronizeMediaSlot(tx, { entityType: "portfolio_project", entityId: id, slot: "video" }, video);
      return updated.rows[0].revision;
    });
  } catch (error) { if (isSlugConflict(error)) throw new DuplicateSlugError(); throw error; }
}

export async function togglePortfolioFeatured(id: string, expectedRevision: number, featured: boolean, testSynchronization?: MutationTestSynchronization): Promise<number> {
  return withCmsTransaction(async (tx) => {
    await synchronizeMutationTest(tx, testSynchronization);
    const result = await tx.db.update<{ revision: number }>(sql`UPDATE portfolio_projects SET is_featured=${featured},revision=revision+1,updated_at=now() WHERE id=${id} AND revision=${expectedRevision} RETURNING revision`);
    if (result.rows[0]) return result.rows[0].revision;
    const exists = await tx.db.select(sql`SELECT 1 FROM portfolio_projects WHERE id=${id}`);
    if (!exists.rows[0]) throw new ContentNotFoundError();
    throw new StaleRevisionError();
  });
}

export async function deletePortfolioProject(id: string): Promise<void> {
  await withCmsTransaction(async (tx) => {
    const project = await tx.db.select(sql`SELECT 1 FROM portfolio_projects WHERE id=${id} FOR UPDATE`);
    if (!project.rows[0]) throw new ContentNotFoundError();
    await tx.db.select(sql`SELECT a.id FROM media_assets a JOIN media_asset_references r ON r.asset_id=a.id WHERE r.owner_type='portfolio_project' AND r.portfolio_project_id=${id} ORDER BY a.id FOR UPDATE OF a`);
    await tx.db.delete(sql`DELETE FROM portfolio_projects WHERE id=${id}`);
  });
}