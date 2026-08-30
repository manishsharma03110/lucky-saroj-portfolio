import assert from "node:assert/strict";
import { test } from "node:test";
import type { HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { createUploadHandler } from "@/app/api/upload/handler";

type BlobUploadHandler = typeof import("@vercel/blob/client").handleUpload;
type BeforeGenerateToken = Parameters<BlobUploadHandler>[0]["onBeforeGenerateToken"];

let authorized = false;
let bodyReads = 0;
let uploadCalls = 0;
let receivedRequest: unknown;
let receivedBody: HandleUploadBody | undefined;
let beforeGenerateToken: BeforeGenerateToken | undefined;

function request() {
  return {
    json: async () => {
      bodyReads += 1;
      return { type: "blob.generate-client-token" };
    },
  } as Request;
}

const POST = createUploadHandler({
  authorizeAdmin: async () => authorized
    ? {
        ok: true,
        admin: {
          id: "11111111-1111-4111-8111-111111111111",
          email: "admin@example.invalid",
          name: "Admin",
          sessionVersion: 7,
        },
      }
    : {
        ok: false,
        response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      },
  handleBlobUpload: async (options) => {
    uploadCalls += 1;
    receivedRequest = options.request;
    receivedBody = options.body;
    beforeGenerateToken = options.onBeforeGenerateToken;
    return { type: "blob.generate-client-token", clientToken: "synthetic-test-token" };
  },
});

function reset() {
  bodyReads = 0;
  uploadCalls = 0;
  receivedRequest = undefined;
  receivedBody = undefined;
  beforeGenerateToken = undefined;
}

for (const state of [
  "missing session",
  "malformed identity",
  "missing version",
  "stale version",
  "deleted administrator",
  "inactive administrator",
  "authorization DB failure",
]) {
  test(`upload route rejects ${state} before privileged work`, async () => {
    authorized = false;
    reset();
    const response = await POST(request());
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: "Unauthorized" });
    assert.equal(bodyReads, 0);
    assert.equal(uploadCalls, 0);
  });
}

test("upload route composes a valid administrator with the Blob handler", async () => {
  authorized = true;
  reset();
  const uploadRequest = request();
  const response = await POST(uploadRequest);
  const payload = await response.clone().json();
  assert.equal(response.status, 200, JSON.stringify(payload));
  assert.deepEqual(payload, {
    type: "blob.generate-client-token",
    clientToken: "synthetic-test-token",
  });
  assert.equal(bodyReads, 1);
  assert.equal(uploadCalls, 1);
  assert.equal(receivedRequest, uploadRequest);
  assert.deepEqual(receivedBody, { type: "blob.generate-client-token" });
  assert.ok(beforeGenerateToken);

  assert.deepEqual(await beforeGenerateToken("image/example.png", "image", false), {
    allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    addRandomSuffix: true,
    maximumSizeInBytes: 10 * 1024 * 1024,
    tokenPayload: JSON.stringify({ kind: "image" }),
  });
  assert.deepEqual(await beforeGenerateToken("video/example.mp4", "video", false), {
    allowedContentTypes: ["video/mp4", "video/webm", "video/quicktime"],
    addRandomSuffix: true,
    maximumSizeInBytes: 200 * 1024 * 1024,
    tokenPayload: JSON.stringify({ kind: "video" }),
  });
});
