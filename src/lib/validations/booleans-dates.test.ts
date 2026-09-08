import assert from "node:assert/strict";
import test from "node:test";
import { formDataCheckboxSchema, strictBooleanSchema } from "./booleans";
import { experienceDateRangeSchema, experienceYearSchema } from "./experience-dates";

test("strict booleans accept only actual booleans", () => {
  assert.equal(strictBooleanSchema.parse(true), true);
  assert.equal(strictBooleanSchema.parse(false), false);
  for (const value of ["true", "false", 1, 0, null, undefined, {}, []]) assert.equal(strictBooleanSchema.safeParse(value).success, false);
});

test("FormData checkbox semantics accept on or absence only", () => {
  assert.equal(formDataCheckboxSchema.parse("on"), true);
  assert.equal(formDataCheckboxSchema.parse(null), false);
  assert.equal(formDataCheckboxSchema.parse(undefined), false);
  for (const value of ["off", "true", "false", "1", 1, 0, {}]) assert.equal(formDataCheckboxSchema.safeParse(value).success, false);
});

test("Experience years accept strict four-digit supported years", () => {
  assert.equal(experienceYearSchema.parse("1900"), "1900");
  assert.equal(experienceYearSchema.parse("2026"), "2026");
  assert.equal(experienceYearSchema.parse("2100"), "2100");
  assert.equal(experienceYearSchema.parse(" 2026 "), "2026");
  for (const value of ["", "26", "2026-01", "Jan 2026", "1899", "2101", "0000", "abcd", "202x"]) assert.equal(experienceYearSchema.safeParse(value).success, false);
});

test("Experience ranges accept ordered and open-ended historical roles", () => {
  assert.equal(experienceDateRangeSchema.safeParse({ startDate: "2020", endDate: "2024", isCurrent: false }).success, true);
  assert.equal(experienceDateRangeSchema.safeParse({ startDate: "2024", endDate: "2024", isCurrent: false }).success, true);
  assert.equal(experienceDateRangeSchema.safeParse({ startDate: "2020", endDate: "", isCurrent: false }).success, true);
  assert.equal(experienceDateRangeSchema.safeParse({ startDate: "2020", endDate: null, isCurrent: true }).success, true);
});

test("Experience ranges reject current end dates and reversed ranges", () => {
  assert.equal(experienceDateRangeSchema.safeParse({ startDate: "2020", endDate: "2024", isCurrent: true }).success, false);
  assert.equal(experienceDateRangeSchema.safeParse({ startDate: "2024", endDate: "2020", isCurrent: false }).success, false);
  assert.equal(experienceDateRangeSchema.safeParse({ startDate: "bad", endDate: "2024", isCurrent: false }).success, false);
});
