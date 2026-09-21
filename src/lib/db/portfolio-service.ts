import "server-only";
import { sql } from "drizzle-orm";
import type { ParsedProjectInput } from "../validations/project";
import { withCmsTransaction } from "./index";
import { ContentNotFoundError,DuplicateContentError,DuplicateSlugError,postgresErrorFields,StaleRevisionError } from "./mutation-errors";
import { synchronizeMutationTest,type MutationTestSynchronization } from "./mutation-test-synchronization";
import { prepareMediaSlot,synchronizeMediaSlot } from "./media-asset-service";

export type ProjectMutationInput=Omit<ParsedProjectInput,"tools">&{tools:readonly string[]};
function validateTools(tools:readonly string[]){const s=new Set<string>();for(const t of tools){if(!t||t!==t.trim())throw new DuplicateContentError("Tool names must be non-empty and normalized.");if(s.has(t))throw new DuplicateContentError("Tool names must be unique.");s.add(t)}}
function validateRelatedProjects(ids:readonly string[],currentId?:string){if(new Set(ids).size!==ids.length)throw new DuplicateContentError("Related projects must be unique.");if(currentId&&ids.includes(currentId))throw new DuplicateContentError("A project cannot be related to itself.")}
function isSlugConflict(e:unknown){const f=postgresErrorFields(e);return f.code==="23505"&&f.constraint==="portfolio_projects_slug_unique"}
function resolvedThumbnailAlt(i:ProjectMutationInput){return i.thumbnailAlt?.trim()||`${i.title} — video thumbnail by Lucky Saroj`}

export async function createPortfolioProject(i:ProjectMutationInput):Promise<string>{
  validateTools(i.tools);
  const r=i.relatedProjectIds??[];
  validateRelatedProjects(r);
  try{
    return await withCmsTransaction(async tx=>{
      const id=crypto.randomUUID();
      const thumbnail=await prepareMediaSlot(tx,{assetId:i.thumbnailAssetId||null,url:i.thumbnailUrl||null,kind:"image"});
      const video=await prepareMediaSlot(tx,{assetId:i.videoAssetId||null,url:i.videoUrl||null,kind:"video"});
      const alt=resolvedThumbnailAlt(i);
      await tx.db.insert(sql`INSERT INTO portfolio_projects(id,title,slug,client_name,year,category_id,description,challenge,approach,result,thumbnail_url,thumbnail_alt,video_url,video_orientation,is_featured,status,seo_title,seo_description,og_title,og_description,og_image_url,twitter_title,twitter_description,twitter_image_url,revision) VALUES (${id},${i.title},${i.slug},${i.clientName||null},${i.year??null},${i.categoryId||null},${i.description||null},${i.challenge||null},${i.approach||null},${i.result||null},${thumbnail.url},${alt},${video.url},${i.videoOrientation},${i.isFeatured??false},${i.status},${i.seoTitle||null},${i.seoDescription||null},${i.ogTitle||null},${i.ogDescription||null},${i.ogImageUrl||null},${i.twitterTitle||null},${i.twitterDescription||null},${i.twitterImageUrl||null},1)`);
      for(const t of i.tools)await tx.db.insert(sql`INSERT INTO project_tools(id,project_id,name) VALUES (${crypto.randomUUID()},${id},${t})`);
      for(const[x,rid]of r.entries())await tx.db.insert(sql`INSERT INTO project_related_projects(project_id,related_project_id,display_order) VALUES (${id},${rid},${x})`);
      await synchronizeMediaSlot(tx,{entityType:"portfolio_project",entityId:id,slot:"thumbnail"},thumbnail);
      await synchronizeMediaSlot(tx,{entityType:"portfolio_project",entityId:id,slot:"video"},video);
      return id;
    });
  }catch(e){if(isSlugConflict(e))throw new DuplicateSlugError();throw e}
}

export async function updatePortfolioProject(id:string,expectedRevision:number,i:ProjectMutationInput,testSynchronization?:MutationTestSynchronization):Promise<number>{
  validateTools(i.tools);
  const r=i.relatedProjectIds??[];
  validateRelatedProjects(r,id);
  try{
    return await withCmsTransaction(async tx=>{
      const thumbnail=await prepareMediaSlot(tx,{assetId:i.thumbnailAssetId||null,url:i.thumbnailUrl||null,kind:"image"});
      const video=await prepareMediaSlot(tx,{assetId:i.videoAssetId||null,url:i.videoUrl||null,kind:"video"});
      const alt=resolvedThumbnailAlt(i);
      await synchronizeMutationTest(tx,testSynchronization);
      const u=await tx.db.update<{revision:number}>(sql`UPDATE portfolio_projects SET title=${i.title},slug=${i.slug},client_name=${i.clientName||null},year=${i.year??null},category_id=${i.categoryId||null},description=${i.description||null},challenge=${i.challenge||null},approach=${i.approach||null},result=${i.result||null},thumbnail_url=${thumbnail.url},thumbnail_alt=${alt},video_url=${video.url},video_orientation=${i.videoOrientation},is_featured=${i.isFeatured??false},status=${i.status},seo_title=${i.seoTitle||null},seo_description=${i.seoDescription||null},og_title=${i.ogTitle||null},og_description=${i.ogDescription||null},og_image_url=${i.ogImageUrl||null},twitter_title=${i.twitterTitle||null},twitter_description=${i.twitterDescription||null},twitter_image_url=${i.twitterImageUrl||null},updated_at=now(),revision=revision+1 WHERE id=${id} AND revision=${expectedRevision} RETURNING revision`);
      if(!u.rows[0]){const e=await tx.db.select(sql`SELECT 1 FROM portfolio_projects WHERE id=${id}`);if(!e.rows[0])throw new ContentNotFoundError();throw new StaleRevisionError()}
      await tx.db.delete(sql`DELETE FROM project_tools WHERE project_id=${id}`);
      for(const t of i.tools)await tx.db.insert(sql`INSERT INTO project_tools(id,project_id,name) VALUES (${crypto.randomUUID()},${id},${t})`);
      await tx.db.delete(sql`DELETE FROM project_related_projects WHERE project_id=${id}`);
      for(const[x,rid]of r.entries())await tx.db.insert(sql`INSERT INTO project_related_projects(project_id,related_project_id,display_order) VALUES (${id},${rid},${x})`);
      await synchronizeMediaSlot(tx,{entityType:"portfolio_project",entityId:id,slot:"thumbnail"},thumbnail);
      await synchronizeMediaSlot(tx,{entityType:"portfolio_project",entityId:id,slot:"video"},video);
      return u.rows[0].revision;
    });
  }catch(e){if(isSlugConflict(e))throw new DuplicateSlugError();throw e}
}

export async function togglePortfolioFeatured(id:string,expectedRevision:number,featured:boolean,testSynchronization?:MutationTestSynchronization):Promise<number>{return withCmsTransaction(async tx=>{await synchronizeMutationTest(tx,testSynchronization);const r=await tx.db.update<{revision:number}>(sql`UPDATE portfolio_projects SET is_featured=${featured},revision=revision+1,updated_at=now() WHERE id=${id} AND revision=${expectedRevision} RETURNING revision`);if(r.rows[0])return r.rows[0].revision;const e=await tx.db.select(sql`SELECT 1 FROM portfolio_projects WHERE id=${id}`);if(!e.rows[0])throw new ContentNotFoundError();throw new StaleRevisionError()})}
export async function deletePortfolioProject(id:string):Promise<void>{await withCmsTransaction(async tx=>{const p=await tx.db.select(sql`SELECT 1 FROM portfolio_projects WHERE id=${id} FOR UPDATE`);if(!p.rows[0])throw new ContentNotFoundError();await tx.db.select(sql`SELECT a.id FROM media_assets a JOIN media_asset_references r ON r.asset_id=a.id WHERE r.owner_type='portfolio_project' AND r.portfolio_project_id=${id} ORDER BY a.id FOR UPDATE OF a`);await tx.db.delete(sql`DELETE FROM portfolio_projects WHERE id=${id}`)})}
