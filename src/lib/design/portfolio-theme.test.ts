import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/(site)/portfolio/page.tsx", "utf8");
const hero = readFileSync("src/components/portfolio/PortfolioHero.tsx", "utf8");
const card = readFileSync("src/components/portfolio/ProjectCard.tsx", "utf8");
const filter = readFileSync("src/components/portfolio/CategoryFilter.tsx", "utf8");

test("Portfolio remains CMS-driven and uses existing media fallbacks", () => {
  assert.match(page, /getCategories\(\)/);
  assert.match(page, /getPublishedProjects\(/);
  assert.match(page, /getProjectBySlug\(/);
  assert.match(card, /project\.thumbnailUrl/);
  assert.match(card, /project\.posterUrl/);
  assert.match(card, /mediaUrl/);
  assert.match(card, /project\.videoUrl/);
});

test("Portfolio listing uses the wide editorial canvas and public interaction tokens", () => {
  assert.match(page, /max-w-\[1560px\]/);
  assert.match(hero, /max-w-\[1560px\]/);
  assert.match(card, /var\(--accent-border\)/);
  assert.match(card, /var\(--focus\)/);
  assert.match(filter, /aria-pressed=\{selected\}/);
  assert.match(filter, /min-h-12/);
});

test("Portfolio presentation avoids rejected editor-interface decoration", () => {
  const source = `${page}\n${hero}\n${card}\n${filter}`;
  assert.doesNotMatch(source, /\bREC\b|timecode|waveform|timeline|playback chrome|HUD/i);
});
