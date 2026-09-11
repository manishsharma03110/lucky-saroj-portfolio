import assert from "node:assert/strict";
import test from "node:test";
import { NextResponse } from "next/server";
import { createUploadInitiationHandler } from "@/app/api/upload/initiate/handler";
import { MAX_IMAGE_UPLOAD_BYTES, MAX_VIDEO_UPLOAD_BYTES } from "@/lib/media/upload-policy";

const admin = { id: "11111111-1111-4111-8111-111111111111", email: "admin@example.test", name: "Admin", sessionVersion: 1 };
let creates = 0;

function createHandler(authorized = true) {
  creates = 0;
  return createUploadInitiationHandler({
    authorizeAdmin: async () => authorized
      ? { ok: true, admin }
      : { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) },
    createPendingAsset: async (input) => {
      creates += 1;
      return {
        id: "22222222-2222-4222-8222-222222222222",
        provider: "vercel_blob",
        providerKey: `cms-media/22222222-2222-4222-8222-222222222222/${input.kind}`,
        url: null,
        kind: input.kind as "image" | "video",
        originalFilename: input.originalFilename as string,
        uploadedByAdminId: admin.id,
        state: "pending",
        deleteAttempts: 0,
      };
    },
  });
}

function request(body: unknown) {
  return new Request("https://cms.example.test/api/upload/initiate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("rejects unauthorized initiation before reading or writing", async () => {
  const handler = createHandler(false);
  const response = await handler(request({ kind: "image", originalFilename: "safe.png", contentType: "image/png", size: 100 }));
  assert.equal(response.status, 401);
  assert.equal(creates, 0);
});

test("validates exact MIME and size before creating a pending row", async () => {
  const handler = createHandler();
  for (const body of [
    { kind: "image", originalFilename: "vector.svg", contentType: "image/svg+xml", size: 100 },
    { kind: "image", originalFilename: "large.png", contentType: "image/png", size: MAX_IMAGE_UPLOAD_BYTES + 1 },
    { kind: "video", originalFilename: "large.mp4", contentType: "video/mp4", size: MAX_VIDEO_UPLOAD_BYTES + 1 },
    { kind: "video", originalFilename: "empty.mp4", contentType: "video/mp4", size: 0 },
  ]) {
    const response = await handler(request(body));
    assert.equal(response.status, 400);
  }
  assert.equal(creates, 0);
});

test("creates a pending row only after a valid policy check", async () => {
  const handler = createHandler();
  const response = await handler(request({ kind: "video", originalFilename: "clip.mp4", contentType: "video/mp4", size: MAX_VIDEO_UPLOAD_BYTES }));
  assert.equal(response.status, 200);
  assert.equal(creates, 1);
  assert.deepEqual(await response.json(), {
    assetId: "22222222-2222-4222-8222-222222222222",
    pathname: "cms-media/22222222-2222-4222-8222-222222222222/video",
    kind: "video",
  });
});
