import { test } from "node:test";
import assert from "node:assert/strict";
import { isAuthorizedCron } from "./cron-authorization";

test("cron fails closed without configuration or credentials", () => {
  assert.equal(isAuthorizedCron(null, undefined), false);
  assert.equal(isAuthorizedCron("Bearer undefined", undefined), false);
  assert.equal(isAuthorizedCron(null, "disposable-test-secret"), false);
});
test("cron accepts only the exact bearer secret", () => {
  assert.equal(isAuthorizedCron("vercel-cron/1.0", "disposable-test-secret"), false);
  assert.equal(isAuthorizedCron("Bearer wrong", "disposable-test-secret"), false);
  assert.equal(isAuthorizedCron("Bearer disposable-test-secret", "disposable-test-secret"), true);
});
