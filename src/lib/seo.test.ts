import assert from "node:assert/strict";
import test from "node:test";
import { createPageMetadata, FALLBACK_SITE_ORIGIN, resolveSiteUrl } from "./seo";

test("resolves an explicit canonical production origin", () => {
  assert.equal(
    resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://portfolio.example.com/work" }).toString(),
    "https://portfolio.example.com/"
  );
});

test("uses Vercel production host and then the stable fallback", () => {
  assert.equal(
    resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "portfolio.example.vercel.app" }).toString(),
    "https://portfolio.example.vercel.app/"
  );
  assert.equal(resolveSiteUrl({}).origin, FALLBACK_SITE_ORIGIN);
});

test("page metadata keeps one canonical path and matching social metadata", () => {
  const metadata = createPageMetadata({
    title: "Portfolio",
    description: "Selected video editing work.",
    path: "/portfolio",
  });
  assert.deepEqual(metadata.alternates, { canonical: "/portfolio" });
  assert.equal(metadata.openGraph?.url, "/portfolio");
  assert.equal(metadata.twitter?.card, "summary");
});
