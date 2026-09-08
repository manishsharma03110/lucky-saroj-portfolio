import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CmsTransactionReleaseError,
  CmsTransactionRollbackError,
  NestedCmsTransactionError,
} from "./transaction-errors";
import { runCmsTransaction, type TransactionClient } from "./transaction-runner";

type Fault = "acquire" | "begin" | "commit" | "rollback" | "release";

function harness(fault?: Fault) {
  const events: string[] = [];
  let acquisitions = 0;
  const connect = async (): Promise<TransactionClient> => {
    events.push("acquire");
    acquisitions += 1;
    if (fault === "acquire") throw new Error("acquire failure");
    return {
      async query(text: string) {
        events.push(text);
        const operation = text.startsWith("BEGIN") ? "begin" : text.toLowerCase() as Fault;
        if (fault === operation) throw new Error(`${operation} failure`);
      },
      release() {
        events.push("release");
        if (fault === "release") throw new Error("release failure");
      },
    };
  };
  const dependencies = {
    connect,
    createContext: (client: TransactionClient) => client,
    delay: async () => undefined,
    retryDelayMs: () => 0,
  };
  return { dependencies, events, acquisitions: () => acquisitions };
}

test("BEGIN failure skips callback and releases the client", async () => {
  const state = harness("begin");
  let invoked = false;
  await assert.rejects(runCmsTransaction(state.dependencies, async () => { invoked = true; }), { message: "begin failure" });
  assert.equal(invoked, false);
  assert.deepEqual(state.events, ["acquire", "BEGIN ISOLATION LEVEL READ COMMITTED", "release"]);
});

test("COMMIT failure rolls back, releases, and remains primary", async () => {
  const state = harness("commit");
  await assert.rejects(runCmsTransaction(state.dependencies, async () => "result"), { message: "commit failure" });
  assert.deepEqual(state.events.slice(-3), ["COMMIT", "ROLLBACK", "release"]);
});

test("ROLLBACK failure retains callback and rollback errors", async () => {
  const state = harness("rollback");
  const applicationError = new Error("application failure");
  await assert.rejects(runCmsTransaction(state.dependencies, async () => { throw applicationError; }), (error) => {
    assert.ok(error instanceof CmsTransactionRollbackError);
    assert.equal(error.applicationError, applicationError);
    assert.match((error.rollbackError as Error).message, /rollback failure/);
    return true;
  });
  assert.equal(state.events.at(-1), "release");
});

test("COMMIT and ROLLBACK failure retain both errors", async () => {
  const state = harness();
  state.dependencies.connect = async () => ({
    async query(text: string) {
      state.events.push(text);
      if (text === "COMMIT") throw new Error("commit failure");
      if (text === "ROLLBACK") throw new Error("rollback failure");
    },
    release() { state.events.push("release"); },
  });
  await assert.rejects(runCmsTransaction(state.dependencies, async () => undefined), (error) => {
    assert.ok(error instanceof CmsTransactionRollbackError);
    assert.match((error.applicationError as Error).message, /commit failure/);
    assert.match((error.rollbackError as Error).message, /rollback failure/);
    return true;
  });
});

test("release failure does not hide a callback failure", async () => {
  const state = harness("release");
  const applicationError = new Error("application failure");
  await assert.rejects(runCmsTransaction(state.dependencies, async () => { throw applicationError; }), (error) => {
    assert.ok(error instanceof CmsTransactionReleaseError);
    assert.equal(error.transactionError, applicationError);
    assert.match((error.releaseError as Error).message, /release failure/);
    return true;
  });
});

test("release failure after COMMIT is reported", async () => {
  const state = harness("release");
  await assert.rejects(runCmsTransaction(state.dependencies, async () => "committed"), { message: "release failure" });
});

test("acquisition failure skips callback and does not release", async () => {
  const state = harness("acquire");
  let invoked = false;
  await assert.rejects(runCmsTransaction(state.dependencies, async () => { invoked = true; }), { message: "acquire failure" });
  assert.equal(invoked, false);
  assert.deepEqual(state.events, ["acquire"]);
});

test("ordinary nesting rejects before a second acquire or BEGIN", async () => {
  const state = harness();
  let innerInvoked = false;
  await runCmsTransaction(state.dependencies, async () => {
    await assert.rejects(runCmsTransaction(state.dependencies, async () => { innerInvoked = true; }), NestedCmsTransactionError);
  });
  assert.equal(innerInvoked, false);
  assert.equal(state.acquisitions(), 1);
  assert.equal(state.events.filter((event) => event.startsWith("BEGIN")).length, 1);
});

test("overlapping independent top-level executions do not conflict", async () => {
  const first = harness();
  const second = harness();
  await Promise.all([
    runCmsTransaction(first.dependencies, async () => new Promise((resolve) => setTimeout(resolve, 10))),
    runCmsTransaction(second.dependencies, async () => new Promise((resolve) => setTimeout(resolve, 10))),
  ]);
  assert.equal(first.acquisitions(), 1);
  assert.equal(second.acquisitions(), 1);
});
