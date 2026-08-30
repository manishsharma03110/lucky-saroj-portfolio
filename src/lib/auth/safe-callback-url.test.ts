import assert from "node:assert/strict";
import test from "node:test";
import { getSafeAdminCallbackUrl } from "./safe-callback-url";

const fallback = "/admin/dashboard";

for (const value of [
  null,
  undefined,
  "",
  "https://evil.example/admin",
  "//evil.example/admin",
  "/contact",
  "javascript:alert(1)",
  "not-a-url",
]) {
  test(`rejects unsafe callback: ${String(value)}`, () => {
    assert.equal(getSafeAdminCallbackUrl(value), fallback);
  });
}

for (const value of [
  "/admin",
  "/admin/dashboard",
  "/admin/portfolio/123?mode=edit#details",
]) {
  test(`accepts local admin callback: ${value}`, () => {
    assert.equal(getSafeAdminCallbackUrl(value), value);
  });
}
