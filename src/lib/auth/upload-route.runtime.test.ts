import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { NextResponse } from "next/server";
import { createUploadHandler } from "@/app/api/upload/handler";
import { createUploadCompletionHandler } from "@/app/api/upload/complete/handler";

const portfolioToken = "synthetic-portfolio-media-test-token";
let previousToken: string | undefined;
let previousDefaultToken: string | undefined;
beforeEach(() => {
  previousToken = process.env.PORTFOLIO_MEDIA_READ_WRITE_TOKEN;
  previousDefaultToken = process.env.BLOB_READ_WRITE_TOKEN;
  process.env.PORTFOLIO_MEDIA_READ_WRITE_TOKEN = portfolioToken;
  process.env.BLOB_READ_WRITE_TOKEN = "synthetic-old-store-token";
});
afterEach(() => {
  if (previousToken === undefined) delete process.env.PORTFOLIO_MEDIA_READ_WRITE_TOKEN;
  else process.env.PORTFOLIO_MEDIA_READ_WRITE_TOKEN = previousToken;
  if (previousDefaultToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
  else process.env.BLOB_READ_WRITE_TOKEN = previousDefaultToken;
});

const adminId = "11111111-1111-4111-8111-111111111111";
const assetId = "22222222-2222-4222-8222-222222222222";
const providerKey = `cms-media/${assetId}/image`;
let authorized = false;
let bodyReads = 0;
let providerCalls = 0;
let dbCalls = 0;
let providerFailure: Error | null = null;
let beforeGenerateToken: Parameters<typeof import("@vercel/blob/client").handleUpload>[0]["onBeforeGenerateToken"] | undefined;

function request() {
  return new Request("https://cms.example.test/api/upload", { method: "POST", body: JSON.stringify({ type: "blob.generate-client-token" }) });
}
const POST = createUploadHandler({
  authorizeAdmin: async () => authorized
    ? { ok: true, admin: { id: adminId, email: "admin@example.test", name: "Admin", sessionVersion: 1 } }
    : { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) },
  authorizePendingUpload: async () => { dbCalls += 1; },
  handleBlobUpload: async (options) => {
    providerCalls += 1;
    assert.equal(options.token, portfolioToken);
    if (providerFailure) throw providerFailure;
    beforeGenerateToken = options.onBeforeGenerateToken;
    return { type: "blob.generate-client-token", clientToken: "mock-token" };
  },
});
function reset() { bodyReads = 0; providerCalls = 0; dbCalls = 0; providerFailure = null; beforeGenerateToken = undefined; }

for (const state of ["unauthenticated", "missing media.upload"]) {
  test(`${state} upload token request stops before DB and provider`, async () => {
    authorized = false; reset();
    const raw = request();
    const guarded = { ...raw, json: async () => { bodyReads += 1; return raw.json(); } } as Request;
    const response = await POST(guarded);
    assert.equal(response.status, 401);
    assert.equal(bodyReads, 0);
    assert.equal(dbCalls, 0);
    assert.equal(providerCalls, 0);
  });
}

test("authorized token request binds canonical pathname and disables random suffix", async () => {
  authorized = true; reset();
  const response = await POST(request());
  assert.equal(response.status, 200);
  assert.ok(beforeGenerateToken);
  const options = await beforeGenerateToken(providerKey, JSON.stringify({ assetId, kind: "image" }), false);
  assert.equal(dbCalls, 1);
  assert.equal(options.addRandomSuffix, false);
  assert.equal(options.allowOverwrite, false);
  assert.equal(options.callbackUrl, "https://cms.example.test/api/upload/complete");
  assert.deepEqual(JSON.parse(options.tokenPayload ?? "null"), { assetId, providerKey, kind: "image" });
  await assert.rejects(beforeGenerateToken("evil/name.jpg", JSON.stringify({ assetId, kind: "image" }), false));
});

test("provider failures are normalized", async () => {
  authorized = true; reset(); providerFailure = new Error(portfolioToken);
  const response = await POST(request());
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Upload request could not be completed." });
});

test("completion receives the same explicit portfolio token and hides provider errors", async () => {
  let calls = 0;
  const complete = createUploadCompletionHandler({
    handleBlobUpload: async (options) => {
      calls += 1;
      assert.equal(options.token, portfolioToken);
      throw new Error(portfolioToken);
    },
    finalizePendingAsset: async () => { throw new Error("Unexpected finalization"); },
  });
  const response = await complete(request());
  assert.equal(calls, 1);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Upload completion could not be verified." });
});

for (const value of [undefined, "", "   "]) {
  test(`missing/blank portfolio credential (${JSON.stringify(value)}) rejects both handlers without fallback`, async () => {
    authorized = true; reset();
    if (value === undefined) delete process.env.PORTFOLIO_MEDIA_READ_WRITE_TOKEN;
    else process.env.PORTFOLIO_MEDIA_READ_WRITE_TOKEN = value;
    const response = await POST(request());
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "Upload request could not be completed." });
    assert.equal(providerCalls, 0);
    assert.equal(dbCalls, 0);
    let completionCalls = 0;
    const complete = createUploadCompletionHandler({
      handleBlobUpload: async () => { completionCalls += 1; throw new Error("Unexpected provider call"); },
      finalizePendingAsset: async () => { throw new Error("Unexpected finalization"); },
    });
    const completed = await complete(request());
    assert.equal(completed.status, 400);
    assert.deepEqual(await completed.json(), { error: "Upload completion could not be verified." });
    assert.equal(completionCalls, 0);
  });
}
