import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync("src/app/(site)/portfolio/[slug]/page.tsx", "utf8");
const caseStudy = readFileSync("src/components/portfolio/detail/CaseStudy.tsx", "utf8");
const hero = readFileSync("src/components/portfolio/detail/ProjectHero.tsx", "utf8");
const media = readFileSync("src/components/portfolio/detail/ProjectMedia.tsx", "utf8");
const navigation = readFileSync("src/components/portfolio/detail/ProjectNavigation.tsx", "utf8");

test("Project detail keeps the CMS-driven optional editorial flow", () => {
  for (const component of ["ProjectHero", "ProjectMedia", "ProjectOverview", "CaseStudy", "ProjectGallery", "ProjectTools", "ProjectNavigation", "ProjectCTA"]) {
    assert.ok(route.includes(`<${component}`), `Missing project detail component: ${component}`);
  }
  assert.match(route, /getProjectBySlug\(slug\)/);
  assert.match(route, /getAdjacentProjects\(slug\)/);
  assert.match(caseStudy, /if \(sections\.length === 0\) return null/);
  assert.match(caseStudy, /if \(tools\.length === 0\) return null/);
});

test("Project media preserves ordered CMS media and VideoPlayer authority", () => {
  assert.match(media, /project\.thumbnailUrl/);
  assert.match(media, /project\.posterUrl/);
  assert.match(media, /galleryImages\[0\]/);
  assert.match(media, /<VideoPlayer/);
  assert.match(media, /items\.map\(\(item, index\)/);
});

test("Project detail uses wide editorial canvases and accessible centralized focus", () => {
  assert.match(hero, /max-w-\[1560px\]/);
  assert.match(media, /max-w-\[1600px\]/);
  assert.match(caseStudy, /max-w-\[1480px\]/);
  assert.match(navigation, /var\(--focus\)/);
  const source = `${hero}\n${media}\n${caseStudy}\n${navigation}`;
  assert.doesNotMatch(source, /\bREC\b|timecode|waveform|timeline|HUD/i);
});
