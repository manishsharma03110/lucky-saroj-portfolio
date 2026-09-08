import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const aboutPage = readFileSync("src/app/(site)/about/page.tsx", "utf8");
const about = ["AboutHero", "AboutStats", "Skills", "Journey", "AboutCTA"].map((name) => readFileSync(`src/components/about/${name}.tsx`, "utf8")).join("\n");
const servicesPage = readFileSync("src/app/(site)/services/page.tsx", "utf8");
const services = ["ServicesShowcase", "ProcessTimeline", "ServicesTools"].map((name) => readFileSync(`src/components/services/${name}.tsx`, "utf8")).join("\n");

test("About remains CMS-driven and omits empty supporting sections", () => {
  for (const query of ["getAboutProfile", "getAboutSkills", "getAboutTools", "getExperiences", "getSiteSettings"]) assert.match(aboutPage, new RegExp(`${query}\\(\\)`));
  assert.match(aboutPage, /<Skills skills=\{skills\} tools=\{tools\}/);
  assert.match(about, /if \(stats\.length === 0\) return null/);
  assert.match(about, /if \(preview\.length === 0\) return null/);
});

test("Services remains CMS-driven with compact editorial presentation", () => {
  assert.match(servicesPage, /getServices\(false\)/);
  assert.match(servicesPage, /getAboutTools\(\)/);
  assert.match(services, /max-w-\[1480px\]/);
  assert.doesNotMatch(services, /min-h-60|h-32/);
});

test("About and Services avoid editor chrome and preserve accessible structure", () => {
  const source = `${aboutPage}\n${about}\n${servicesPage}\n${services}`;
  assert.doesNotMatch(source, /\bREC\b|timecode|waveform|HUD|editing ruler/i);
  assert.match(source, /<h1/);
  assert.match(source, /motion-reduce:/);
});
