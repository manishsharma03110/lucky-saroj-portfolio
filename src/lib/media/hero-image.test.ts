import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { HERO_IMAGE_FALLBACK, resolveHeroImageUrl } from "./hero-image";

test("Hero renders approved internal and HTTPS media references unchanged", () => {
  assert.equal(resolveHeroImageUrl("/uploads/HomePage/cms-hero.webp"), "/uploads/HomePage/cms-hero.webp");
  assert.equal(resolveHeroImageUrl("https://media.example.test/hero.webp"), "https://media.example.test/hero.webp");
});

test("Hero deterministically falls back for missing, empty, malformed, and unsafe values", () => {
  for (const value of [null, undefined, "", "   ", "javascript:alert(1)", "http://example.test/hero.webp", "/uploads/../secret.webp", "//example.test/hero.webp"]) {
    assert.equal(resolveHeroImageUrl(value), HERO_IMAGE_FALLBACK);
  }
});

test("public Hero remains image-only and receives no ownership/provider metadata", () => {
  const hero = readFileSync("src/components/home/Hero.tsx", "utf8");
  const page = readFileSync("src/app/(site)/page.tsx", "utf8");
  assert.doesNotMatch(hero, /<video|autoplay|autoPlay|providerKey|assetId|heroVideo/i);
  assert.doesNotMatch(page, /providerKey|assetId|heroVideo/i);
  assert.match(hero, /aria-hidden="true"/);
  assert.match(page, /heroImageUrl=\{settings\?\.heroImageUrl\}/);
});
