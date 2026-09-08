import assert from "node:assert/strict";
import test from "node:test";
import { externalWebUrlSchema, internalMediaPathSchema, mediaReferenceSchema } from "./urls";

test("external URLs accept HTTPS parser features without semantic rewriting", () => {
  for (const value of [
    "https://example.com",
    "HTTPS://example.com/path?query=1#fragment",
    "https://user:pass@example.com/path",
    "https://例え.テスト/media",
  ]) assert.equal(externalWebUrlSchema.parse(value), value);
  assert.equal(externalWebUrlSchema.parse("  https://example.com/path  "), "https://example.com/path");
});

test("external URLs reject HTTP, unsafe schemes, relative forms, and malformed input", () => {
  for (const value of [
    "http://example.com", "javascript:alert(1)", "data:text/html,test", "file:///tmp/file", "ftp://example.com/file", "vbscript:msgbox(1)",
    "//evil.example", "/relative/path", "example.com", "https://example.com/%", "https://example.com/line\nbreak", "",
  ]) assert.equal(externalWebUrlSchema.safeParse(value).success, false, value);
});

test("external URLs reject raw backslash scheme confusion", () => {
  const exactSingleBackslashUrl = "https:\\evil.example/path";
  assert.equal(exactSingleBackslashUrl, String.raw`https:\evil.example/path`);

  for (const value of [
    exactSingleBackslashUrl,
    "https:\\\\evil.example/path",
    "https:/\\evil.example/path",
    "https://example.com\\path",
  ]) {
    assert.equal(externalWebUrlSchema.safeParse(value).success, false, value);
    assert.equal(mediaReferenceSchema.safeParse(value).success, false, value);
  }
});

test("internal media paths accept repository-style upload paths", () => {
  for (const value of ["/uploads/HomePage/homepage-hero-background.webp", "/uploads/About/about-hero-editor.png", "/uploads/folder/file%20name.webp"]) {
    assert.equal(internalMediaPathSchema.parse(value), value);
    assert.equal(mediaReferenceSchema.safeParse(value).success, true);
  }
  assert.equal(mediaReferenceSchema.safeParse("https://blob.example.com/media/file.webp").success, true);
});

test("internal media paths reject traversal, ambiguous, and external forms", () => {
  for (const value of [
    "", "/uploads", "/uploads/", "/uploads//file.jpg", "/uploads/folder//file.jpg",
    "//evil.example/file.png", "/../file.png", "/uploads/../secret", "/uploads/./file.png", "/uploads/folder/../file.jpg",
    "/uploads/%2e%2e/secret", "/uploads/%2E%2E/secret", "/uploads/folder%2Ffile.png", "/uploads/folder%5cfile.png",
    "/uploads\\file.png", "/uploads/folder\\file.png", "/uploads/%00file.jpg", "/uploads/%09file.jpg", "/uploads/%0Afile.jpg", "/uploads/%0Dfile.jpg", "/uploads/%1Ffile.jpg", "/uploads/%7Ffile.jpg",
    "/uploads/%252e%252e/secret", "/uploads/folder%252Ffile.png", "/uploads/folder%255cfile.png",
    "/uploads/file.png?x=1", "/uploads/file.png#x", "/images/file.png", "uploads/file.png", "/uploads/%", "/uploads/%zz", "/uploads/line\nbreak.png",
  ]) assert.equal(internalMediaPathSchema.safeParse(value).success, false, value);
});
