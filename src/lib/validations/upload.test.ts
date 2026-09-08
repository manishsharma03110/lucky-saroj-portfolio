import assert from "node:assert/strict";
import test from "node:test";
import { uploadKindSchema } from "./upload";

test("upload kind accepts only image and video", () => {
  assert.equal(uploadKindSchema.parse("image"), "image");
  assert.equal(uploadKindSchema.parse("video"), "video");
  for (const value of ["", "Image", "audio", "document", null, undefined, 1, {}]) assert.equal(uploadKindSchema.safeParse(value).success, false);
});
