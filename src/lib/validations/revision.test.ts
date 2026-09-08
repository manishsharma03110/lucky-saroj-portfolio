import assert from "node:assert/strict";
import test from "node:test";
import { revisionSchema } from "./revision";

test("revision validation rejects unsafe or non-integral inputs", () => {
  for (const value of [undefined, null, "", " ", 0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, "abc", "1.5"]) {
    assert.equal(revisionSchema.safeParse(value).success, false, `unexpected valid revision: ${String(value)}`);
  }
});

test("revision validation accepts positive safe integers from numbers and FormData strings", () => {
  for (const value of [1, 2, "1", "2", Number.MAX_SAFE_INTEGER, String(Number.MAX_SAFE_INTEGER)]) {
    assert.equal(revisionSchema.safeParse(value).success, true, `unexpected invalid revision: ${String(value)}`);
  }
});
