import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import Module from "node:module";

const projectId = "11111111-1111-4111-8111-111111111111";
const imageId = "22222222-2222-4222-8222-222222222222";
const videoId = "33333333-3333-4333-8333-333333333333";
const oldId = "44444444-4444-4444-8444-444444444444";
const imageUrl = "https://test.public.blob.vercel-storage.com/image";
const videoUrl = "https://test.public.blob.vercel-storage.com/video";
const oldUrl = "https://example.test/old.jpg";
const external = "https://drive.google.com/file/d/example/view";
type Asset = { id: string; url: string; kind: string; state: string };
let assets: Map<string, Asset>;
let references: Map<string, string>;
let project: { revision: number; thumbnailUrl: string | null; videoUrl: string | null };
let action: typeof import("@/lib/actions/portfolio");
const dialect = new PgDialect();

async function execute(statement: SQL) {
  const { sql, params } = dialect.sqlToQuery(statement);
  if (sql.includes("SELECT url,kind,state FROM media_assets")) return { rows: [assets.get(String(params[0]))].filter(Boolean) };
  if (sql.startsWith("UPDATE portfolio_projects")) {
    if (params.at(-1) !== project.revision) return { rows: [] };
    project.thumbnailUrl = params[9] as string | null;
    project.videoUrl = params[10] as string | null;
    return { rows: [{ revision: ++project.revision }] };
  }
  if (sql.startsWith("SELECT 1 FROM portfolio_projects")) return { rows: [{ exists: 1 }] };
  if (sql.startsWith("DELETE FROM project_tools")) return { rows: [] };
  if (sql.startsWith("INSERT INTO media_asset_references")) {
    references.set(String(params[3]), String(params[1])); return { rows: [] };
  }
  if (sql.startsWith("UPDATE media_asset_references")) {
    references.set(String(params[1]), String(params[0])); return { rows: [] };
  }
  if (sql.startsWith("DELETE FROM media_asset_references")) { references.delete(String(params[0])); return { rows: [] }; }
  if (sql.startsWith("UPDATE media_assets SET state='attached'")) { assets.get(String(params[0]))!.state = "attached"; return { rows: [] }; }
  if (sql.startsWith("UPDATE media_assets SET state=")) { assets.get(String(params[1]))!.state = String(params[0]); return { rows: [] }; }
  throw new Error(`Unexpected SQL in isolated test: ${sql}`);
}
const tx = {
  db: { select: execute, update: execute, insert: execute, delete: execute,
    count: async (statement: SQL) => [...references.values()].filter(id => id === dialect.sqlToQuery(statement).params[0]).length },
  query: async (sql: string, params: unknown[]) => {
    if (sql.startsWith("SELECT id,asset_id FROM media_asset_references")) {
      const slot = String(params[2]); const id = references.get(slot);
      return { rows: id ? [{ id: slot, asset_id: id }] : [] };
    }
    if (sql.startsWith("SELECT id,url,kind,state FROM media_assets")) return { rows: (params[0] as string[]).map(id => assets.get(id)).filter(Boolean) };
    throw new Error(`Unexpected query: ${sql}`);
  },
};
mock.module("@/lib/db/index", { namedExports: { withCmsTransaction: async (work: (context: typeof tx) => Promise<unknown>) => {
  const snapshot = structuredClone({ assets, references, project });
  try { return await work(tx); } catch (error) { ({ assets, references, project } = snapshot); throw error; }
} } });
mock.module("@/lib/auth/authorization", { namedExports: { requirePermission: async () => ({ id: projectId }) } });
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
class Redirect extends Error {}
mock.module("next/navigation", { namedExports: { redirect: () => { throw new Redirect(); } } });
before(async () => {
  // Next.js supplies this marker; this isolated test needs no server-only runtime.
  const loader = Module as unknown as { _load: (name: string, ...args: unknown[]) => unknown };
  const load = loader._load;
  mock.method(loader, "_load", (name: string, ...args: unknown[]) => name === "server-only" ? {} : load(name, ...args));
  action = await import("@/lib/actions/portfolio");
});
beforeEach(() => {
  assets = new Map([
    [imageId, { id: imageId, url: imageUrl, kind: "image", state: "pending" }],
    [videoId, { id: videoId, url: videoUrl, kind: "video", state: "pending" }],
    [oldId, { id: oldId, url: oldUrl, kind: "image", state: "attached" }],
  ]);
  references = new Map([["thumbnail", oldId]]);
  project = { revision: 1, thumbnailUrl: oldUrl, videoUrl: external };
});
function form(image = false, video = false) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ title: "Cinematic Nature", slug: "cinematic-nature", status: "published", revision: "1",
    thumbnailUrl: image ? imageUrl : oldUrl, thumbnailAssetId: image ? imageId : oldId,
    videoUrl: video ? videoUrl : external, videoAssetId: video ? videoId : "", externalVideoUrl: external })) data.set(key, value);
  return data;
}
async function save(data: FormData) { await assert.rejects(action.updateProject(projectId, { status: "idle" }, data), Redirect); }
for (const [image, video] of [[true, false], [false, true], [true, true]]) {
  test(`save binds thumbnail=${image}, video=${video} through action and real services`, async () => {
    await save(form(image, video));
    assert.equal(project.thumbnailUrl, image ? imageUrl : oldUrl);
    assert.equal(project.videoUrl, video ? videoUrl : external);
    assert.equal(references.get("thumbnail"), image ? imageId : oldId);
    assert.equal(references.get("video"), video ? videoId : undefined);
    if (image) { assert.equal(assets.get(imageId)!.state, "attached"); assert.equal(assets.get(oldId)!.state, "orphaned"); }
    if (video) assert.equal(assets.get(videoId)!.state, "attached");
  });
}
test("untouched URL-only media is preserved", async () => {
  references.clear(); const data = form(); data.set("thumbnailAssetId", "");
  await save(data); assert.equal(project.thumbnailUrl, oldUrl); assert.equal(project.videoUrl, external); assert.equal(references.size, 0);
});
test("explicit remove clears both slots and does not resurrect stale external field", async () => {
  const data = form(); for (const key of ["thumbnailUrl", "thumbnailAssetId", "videoUrl", "videoAssetId"]) data.set(key, "");
  await save(data); assert.equal(project.thumbnailUrl, null); assert.equal(project.videoUrl, null); assert.equal(references.size, 0); assert.equal(assets.get(oldId)!.state, "orphaned");
});
test("missing media fields fail closed instead of clearing existing media", async () => {
  const data = form(); data.delete("thumbnailUrl"); data.delete("videoAssetId");
  const result = await action.updateProject(projectId, { status: "idle" }, data);
  assert.equal(result.status, "error"); assert.equal(project.revision, 1); assert.equal(references.get("thumbnail"), oldId);
});
test("stale save preserves old reference and leaves new assets pending", async () => {
  const data = form(true, true); project.revision = 2;
  const result = await action.updateProject(projectId, { status: "idle" }, data);
  assert.equal(result.status, "error"); assert.equal(project.revision, 2); assert.equal(references.get("thumbnail"), oldId);
  assert.equal(assets.get(imageId)!.state, "pending"); assert.equal(assets.get(videoId)!.state, "pending");
});

test("unfinalized or mismatched upload fails without detaching existing media", async () => {
  const data = form(true, true);
  assets.get(imageId)!.url = "";
  const result = await action.updateProject(projectId, { status: "idle" }, data);
  assert.equal(result.status, "error");
  assert.equal(project.thumbnailUrl, oldUrl);
  assert.equal(project.videoUrl, external);
  assert.equal(references.get("thumbnail"), oldId);
  assert.equal(assets.get(oldId)!.state, "attached");
});
