import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_IMAGE_UPLOAD_BYTES,
  MAX_VIDEO_UPLOAD_BYTES,
  getUploadAcceptValue,
  validateUploadFilePolicy,
} from "./upload-policy";

test("accepts supported image and video types at size boundaries", () => {
  assert.deepEqual(validateUploadFilePolicy({ kind: "image", contentType: "image/webp", size: MAX_IMAGE_UPLOAD_BYTES }), { ok: true });
  assert.deepEqual(validateUploadFilePolicy({ kind: "video", contentType: "video/mp4", size: MAX_VIDEO_UPLOAD_BYTES }), { ok: true });
});

test("rejects unsupported content types and invalid sizes", () => {
  assert.deepEqual(validateUploadFilePolicy({ kind: "image", contentType: "image/svg+xml", size: 1 }), { ok: false, reason: "invalid_type" });
  assert.deepEqual(validateUploadFilePolicy({ kind: "video", contentType: "video/x-msvideo", size: 1 }), { ok: false, reason: "invalid_type" });
  assert.deepEqual(validateUploadFilePolicy({ kind: "image", contentType: "image/png", size: 0 }), { ok: false, reason: "invalid_size" });
  assert.deepEqual(validateUploadFilePolicy({ kind: "video", contentType: "video/mp4", size: MAX_VIDEO_UPLOAD_BYTES + 1 }), { ok: false, reason: "invalid_size" });
});

test("file picker accept values use the same exact allowlist", () => {
  assert.equal(getUploadAcceptValue("image"), "image/jpeg,image/png,image/webp,image/gif");
  assert.equal(getUploadAcceptValue("video"), "video/mp4,video/webm,video/quicktime");
});
