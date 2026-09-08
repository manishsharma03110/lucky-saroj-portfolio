import assert from "node:assert/strict";
import test from "node:test";
import { entityIdSchema, optionalEntityIdSchema } from "./identifiers";
import { categorySlugSchema, projectSlugSchema } from "./slugs";

test("entity IDs accept trimmed UUIDs and optional IDs normalize empty input", () => {
  const id = "11111111-1111-4111-8111-111111111111";
  assert.equal(entityIdSchema.parse(`  ${id}  `), id);
  assert.equal(optionalEntityIdSchema.parse("  "), null);
  assert.equal(optionalEntityIdSchema.parse(null), null);
  assert.equal(optionalEntityIdSchema.parse(undefined), undefined);
});

test("entity IDs reject empty, huge, malformed, and singleton values", () => {
  for (const value of ["", "   ", "x".repeat(10_000), "not-a-uuid", "11111111-1111-1111-1111-11111111111z", "singleton:settings", "singleton:about", "singleton:showreel"]) {
    assert.equal(entityIdSchema.safeParse(value).success, false, value.slice(0, 40));
  }
});

test("slug schemas accept intended ASCII syntax and exact maximums", () => {
  for (const value of ["showreel", "short-form-editing", "project-2026"]) assert.equal(projectSlugSchema.parse(value), value);
  assert.equal(categorySlugSchema.parse("a".repeat(80)), "a".repeat(80));
  assert.equal(projectSlugSchema.parse("a".repeat(160)), "a".repeat(160));
});

test("slug schemas reject malformed and over-limit input", () => {
  for (const value of ["", "   ", "Uppercase", "two words", "-leading", "trailing-", "double--hyphen", "punctuation!", "café", ".", "..", "a/b", "a\\b", "a%2fb", "a".repeat(161)]) {
    assert.equal(projectSlugSchema.safeParse(value).success, false, value.slice(0, 40));
  }
  assert.equal(categorySlugSchema.safeParse("a".repeat(81)).success, false);
});

test("category slug reserves the portfolio filter sentinel after trimming", () => {
  assert.equal(categorySlugSchema.safeParse("all").success, false);
  assert.equal(categorySlugSchema.safeParse(" all ").success, false);
});
