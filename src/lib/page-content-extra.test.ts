import assert from "node:assert/strict";
import { test } from "node:test";
import { PAGE_CONTENT_CONFIG, type PageContentKey } from "./page-content";
import { pageContentFields } from "./page-content-extra";

test("every CMS page has one definition for each submitted field", () => {
  for (const key of Object.keys(PAGE_CONTENT_CONFIG) as PageContentKey[]) {
    const fields=pageContentFields(key,PAGE_CONTENT_CONFIG[key].fields);
    assert.equal(new Set(fields.map(field=>field.key)).size,fields.length,key);
  }
});
