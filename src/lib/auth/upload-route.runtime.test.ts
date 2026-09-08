import assert from "node:assert/strict";
import { test } from "node:test";
import { NextResponse } from "next/server";
import { createUploadHandler } from "@/app/api/upload/handler";

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
  authorized = true; reset(); providerFailure = new Error("token=secret C:\\private\\stack");
  const response = await POST(request());
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Upload request could not be completed." });
});