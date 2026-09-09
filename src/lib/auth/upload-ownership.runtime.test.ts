import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, test } from "node:test";
import { NextResponse } from "next/server";
import { createUploadInitiationHandler } from "@/app/api/upload/initiate/handler";
import { createUploadCompletionHandler } from "@/app/api/upload/complete/handler";

const portfolioToken = "synthetic-portfolio-media-test-token";
let previousToken: string | undefined;
beforeEach(() => {
  previousToken = process.env.PORTFOLIO_MEDIA_READ_WRITE_TOKEN;
  process.env.PORTFOLIO_MEDIA_READ_WRITE_TOKEN = portfolioToken;
});
afterEach(() => {
  if (previousToken === undefined) delete process.env.PORTFOLIO_MEDIA_READ_WRITE_TOKEN;
  else process.env.PORTFOLIO_MEDIA_READ_WRITE_TOKEN = previousToken;
});

const adminId = "11111111-1111-4111-8111-111111111111";
const assetId = "22222222-2222-4222-8222-222222222222";
const providerKey = `cms-media/${assetId}/image`;
const asset = { id: assetId, provider: "vercel_blob" as const, providerKey, url: null, kind: "image" as const, originalFilename: "photo.jpg", uploadedByAdminId: adminId, state: "pending" as const, deleteAttempts: 0 };

test("initiation authenticates before parsing and creates one server-owned pending row", async () => {
  let reads = 0; let creates = 0; let input: unknown;
  const denied = createUploadInitiationHandler({
    authorizeAdmin: async () => ({ ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }),
    createPendingAsset: async () => { creates += 1; return asset; },
  });
  const deniedResponse = await denied({ json: async () => { reads += 1; return {}; } } as Request);
  assert.equal(deniedResponse.status, 401); assert.equal(reads, 0); assert.equal(creates, 0);

  const allowed = createUploadInitiationHandler({
    authorizeAdmin: async () => ({ ok: true, admin: { id: adminId, email: "a@example.test", name: "A", sessionVersion: 1 } }),
    createPendingAsset: async (value) => { creates += 1; input = value; return asset; },
  });
  const response = await allowed(new Request("https://cms.test/api/upload/initiate", { method: "POST", body: JSON.stringify({ kind: "image", originalFilename: "photo.jpg" }) }));
  assert.equal(response.status, 200); assert.equal(creates, 1);
  assert.deepEqual(input, { kind: "image", originalFilename: "photo.jpg", uploadedByAdminId: adminId });
  assert.deepEqual(await response.json(), { assetId, pathname: providerKey, kind: "image" });
});

test("initiation rejects hostile filenames and caller authority before persistence", async () => {
  let creates = 0;
  const handler = createUploadInitiationHandler({
    authorizeAdmin: async () => ({ ok: true, admin: { id: adminId, email: "a@example.test", name: "A", sessionVersion: 1 } }),
    createPendingAsset: async () => { creates += 1; return asset; },
  });
  for (const body of [
    { kind: "other", originalFilename: "x.jpg" }, { kind: "image", originalFilename: "../evil.jpg" },
    { kind: "image", originalFilename: "..\\evil.jpg" }, { kind: "image", originalFilename: "folder/file.jpg" },
    { kind: "image", originalFilename: "bad\u0000.jpg" }, { kind: "image", originalFilename: "x".repeat(256) },
    { kind: "image", originalFilename: "x.jpg", assetId }, { kind: "image", originalFilename: "x.jpg", providerKey },
    { kind: "image", originalFilename: "x.jpg", uploaderAdminId: "33333333-3333-4333-8333-333333333333" },
  ]) {
    const response = await handler(new Request("https://cms.test/api/upload/initiate", { method: "POST", body: JSON.stringify(body) }));
    assert.equal(response.status, 400);
  }
  assert.equal(creates, 0);
});

test("provider completion binds signed identity and normalizes mismatches", async () => {
  let finalized: unknown;
  const identity = { assetId, providerKey, kind: "image" };
  const make = (pathname: string, tokenPayload = JSON.stringify(identity), url = "https://blob.example.test/final") => createUploadCompletionHandler({
    handleBlobUpload: async (options) => {
      assert.equal(options.token, portfolioToken);
      await options.onUploadCompleted?.({ blob: { url, downloadUrl: url, pathname, contentType: "image/jpeg", contentDisposition: "inline; filename=photo.jpg", etag: "mock-etag" }, tokenPayload });
      return { type: "blob.upload-completed", response: "ok" };
    },
    finalizePendingAsset: async (value) => { finalized = value; },
  });
  const request = () => new Request("https://cms.test/api/upload/complete", { method: "POST", body: JSON.stringify({ type: "blob.upload-completed" }) });
  const response = await make(providerKey)(request());
  assert.equal(response.status, 200);
  assert.deepEqual(finalized, { assetId, expectedProviderKey: providerKey, kind: "image", url: "https://blob.example.test/final" });
  for (const handler of [make("cms-media/33333333-3333-4333-8333-333333333333/image"), make(providerKey, JSON.stringify({ ...identity, kind: "video" })), make(providerKey, "malformed")]) {
    const rejected = await handler(request()); assert.equal(rejected.status, 400);
    assert.deepEqual(await rejected.json(), { error: "Upload completion could not be verified." });
  }
});

test("FileUpload retains asset ID and URL while hiding raw errors and preserving URL-only defaults", () => {
  const fileUpload = readFileSync("src/components/admin/FileUpload.tsx", "utf8");
  const project = readFileSync("src/components/admin/ProjectForm.tsx", "utf8");
  const showreel = readFileSync("src/components/admin/ShowreelForm.tsx", "utf8");
  const settings = readFileSync("src/components/admin/SettingsForm.tsx", "utf8");
  const settingsPage = readFileSync("src/app/admin/(protected)/settings/page.tsx", "utf8");
  const settingsAction = readFileSync("src/lib/actions/settings.ts", "utf8");
  assert.match(fileUpload, /name=\{assetIdName\} value=\{assetId\}/);
  assert.match(fileUpload, /setAssetId\(initiation\.assetId\)/);
  assert.match(fileUpload, /setUrl\(result\.url\)/);
  assert.match(fileUpload, /contentType:\s*file\.type/);
  assert.match(fileUpload, /Upload failed\. Please try again\./);
  assert.doesNotMatch(fileUpload, /err instanceof Error|err\.message/);
  for (const source of [project, showreel]) {
    assert.match(source, /assetIdName="thumbnailAssetId"/);
    assert.match(source, /assetIdName="videoAssetId"/);
  }
  assert.match(settings, /name="heroImageUrl"/);
  assert.match(settings, /assetIdName="heroImageAssetId"/);
  assert.match(settings, /kind="image"/);
  assert.doesNotMatch(settings, /kind="video"/);
  assert.match(settingsPage, /ownerType, "site_settings"/);
  assert.match(settingsPage, /siteSettingsId, SETTINGS_ID/);
  assert.match(settingsPage, /slot, "hero_image"/);
  assert.doesNotMatch(settingsPage, /heroImageUrl[\s\S]*assetId/);
  assert.ok(settingsAction.indexOf('requirePermission("settings.update")') < settingsAction.indexOf("settingsSchema.safeParse"));
  assert.match(settingsAction, /Uploaded Hero image is invalid or no longer available\./);
  assert.match(settingsAction, /error instanceof StaleRevisionError/);
  assert.doesNotMatch(settingsAction, /error\.stack|error\.cause/);
});
