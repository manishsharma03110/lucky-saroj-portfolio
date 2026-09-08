import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/(site)/contact/page.tsx", "utf8");
const pageComponents = ["ContactHero", "ContactFormShell", "ContactPortfolioCTA"]
  .map((name) => readFileSync(`src/components/contact/page/${name}.tsx`, "utf8"))
  .join("\n");
const info = readFileSync("src/components/contact/ContactInfo.tsx", "utf8");
const form = readFileSync("src/components/contact/ContactForm.tsx", "utf8");
const select = readFileSync("src/components/contact/ContactSelect.tsx", "utf8");

test("contact presentation uses the locked electric-blue public token system", () => {
  const source = `${page}\n${pageComponents}\n${info}\n${form}\n${select}`;
  assert.match(source, /var\(--accent-primary\)/);
  assert.match(source, /rgba\(59,130,246/);
  assert.doesNotMatch(source, /orange|amber|#f97316|#ea580c|#fb923c/i);
});

test("contact page keeps real settings-driven details and the canonical form", () => {
  assert.match(page, /getSiteSettings\(\)/);
  assert.match(page, /settings\?\.contactEmail/);
  assert.match(page, /settings\?\.contactPhone/);
  assert.match(page, /<ContactFormShell/);
  assert.match(form, /submitFullContactForm/);
});

test("contact form exposes accessible error, pending, and reduced-motion states", () => {
  assert.match(form, /aria-busy=\{pending\}/);
  assert.match(form, /aria-invalid=/);
  assert.match(form, /disabled=\{pending\}/);
  assert.match(select, /role="combobox"/);
  assert.match(select, /focus-visible:ring-2/);
  assert.match(`${pageComponents}\n${info}\n${form}\n${select}`, /motion-reduce:/);
});

test("contact presentation avoids editor chrome and preserves semantic landmarks", () => {
  const source = `${page}\n${pageComponents}\n${info}`;
  assert.doesNotMatch(source, /\bREC\b|timecode|waveform|HUD|editing ruler/i);
  assert.match(pageComponents, /<h1/);
  assert.match(pageComponents, /aria-labelledby=/);
  assert.match(info, /mailto:/);
  assert.match(info, /tel:/);
});
