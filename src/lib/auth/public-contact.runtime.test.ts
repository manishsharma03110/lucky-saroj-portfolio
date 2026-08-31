import assert from "node:assert/strict";
import { it, mock } from "node:test";

let inserts = 0;
mock.module("@/lib/db", { namedExports: {
  schema: { contactMessages: {} },
  db: { insert: () => ({ values: async () => { inserts += 1; } }) },
} });

it("public contact reaches normal validation without an admin session", async () => {
  const { submitContactForm } = await import("@/lib/actions/contact");
  const result = await submitContactForm({ status: "idle" }, new FormData());
  assert.equal(result.status, "error");
  assert.equal(result.message, "Please fix the errors below.");
  assert.equal(inserts, 0);
});
