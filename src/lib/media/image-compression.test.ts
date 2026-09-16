import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { compressCmsImage, IMAGE_TARGET_MAX_BYTES } from "./image-compression";

test("compressCmsImage outputs bounded WebP and preserves dimensions within max width", async () => {
  const input = await sharp({
    create: { width: 3200, height: 1800, channels: 3, background: { r: 120, g: 90, b: 60 } },
  }).png().toBuffer();

  const output = await compressCmsImage(input);
  const metadata = await sharp(output).metadata();

  assert.equal(metadata.format, "webp");
  assert.ok((metadata.width ?? 0) <= 2400);
  assert.ok(output.byteLength <= IMAGE_TARGET_MAX_BYTES);
});
