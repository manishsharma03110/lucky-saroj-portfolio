import assert from "node:assert/strict";
import test from "node:test";
import {
  BUDGET_RANGES, POPUP_PROJECT_TYPES, PROJECT_TIMELINES, VIDEO_TYPES,
  budgetRangeSchema, createProjectTypeSchema, popupProjectTypeSchema, projectTimelineSchema, videoTypeSchema,
} from "./contact-options";
import { boundedContactEmailSchema, boundedLoginIdentifierSchema, CONTACT_EMAIL_MAX_LENGTH } from "./email";

test("every current finite contact option is authoritative", () => {
  for (const value of BUDGET_RANGES) assert.equal(budgetRangeSchema.parse(value), value);
  for (const value of VIDEO_TYPES) assert.equal(videoTypeSchema.parse(value), value);
  for (const value of PROJECT_TIMELINES) assert.equal(projectTimelineSchema.parse(value), value);
  for (const value of POPUP_PROJECT_TYPES) assert.equal(popupProjectTypeSchema.parse(value), value);
});

test("finite contact options reject unknown, empty, whitespace, case changes, and oversized values", () => {
  for (const schema of [budgetRangeSchema, videoTypeSchema, projectTimelineSchema, popupProjectTypeSchema]) {
    for (const value of ["", "   ", "Unknown", "other", "x".repeat(1000)]) assert.equal(schema.safeParse(value).success, false);
  }
});

test("full-page project types use current category names plus Other", () => {
  const schema = createProjectTypeSchema(["Commercial", "Documentary"]);
  for (const value of ["Commercial", "Documentary", "Other"]) assert.equal(schema.parse(value), value);
  for (const value of ["", "commercial", "Unknown", "x".repeat(121)]) assert.equal(schema.safeParse(value).success, false);
});

test("bounded contact email trims and validates normal addresses", () => {
  assert.equal(boundedContactEmailSchema.parse("  person@example.com  "), "person@example.com");
  for (const value of ["", "not-an-email", "person@", "@example.com"]) assert.equal(boundedContactEmailSchema.safeParse(value).success, false);
});

test("bounded contact email enforces the exact maximum and login identifier stays semantics-neutral", () => {
  const atMaximum = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(61)}`;
  const overMaximum = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(62)}`;
  assert.equal(atMaximum.length, CONTACT_EMAIL_MAX_LENGTH);
  assert.equal(boundedContactEmailSchema.safeParse(atMaximum).success, true);
  assert.equal(boundedContactEmailSchema.safeParse(overMaximum).success, false);
  assert.equal(boundedLoginIdentifierSchema.parse(" existing-admin "), "existing-admin");
  assert.equal(boundedLoginIdentifierSchema.safeParse("x".repeat(CONTACT_EMAIL_MAX_LENGTH + 1)).success, false);
});
