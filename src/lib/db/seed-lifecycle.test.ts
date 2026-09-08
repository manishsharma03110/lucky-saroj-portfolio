import assert from "node:assert/strict";
import test from "node:test";
import { runWithCleanup } from "./seed-lifecycle";

test("run success and cleanup success returns the run result", async () => {
  const value = Object.freeze({ status: "complete" });
  assert.equal(await runWithCleanup(async () => value, async () => undefined), value);
});

test("run failure and cleanup success preserves the original failure", async () => {
  const runError = new Error("synthetic run failure");
  await assert.rejects(runWithCleanup(async () => { throw runError; }, async () => undefined), (error) => error === runError);
});

test("run failure and cleanup failure preserves both errors with run failure primary", async () => {
  const runError = new Error("synthetic run failure");
  const cleanupError = new Error("synthetic cleanup failure");
  await assert.rejects(
    runWithCleanup(async () => { throw runError; }, async () => { throw cleanupError; }),
    (error) => error instanceof AggregateError && error.cause === runError && error.errors[0] === runError && error.errors[1] === cleanupError
  );
});

test("run success and cleanup failure surfaces the cleanup failure", async () => {
  const cleanupError = new Error("synthetic cleanup failure");
  await assert.rejects(runWithCleanup(async () => "complete", async () => { throw cleanupError; }), (error) => error === cleanupError);
});
