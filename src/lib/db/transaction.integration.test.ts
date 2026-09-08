import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import {
  CmsTransactionControlError,
  InactiveCmsTransactionContextError,
} from "./transaction-errors";
import { validateDestructiveTransactionTestTarget } from "./transaction-test-target";

// This validation intentionally runs before pool construction or DB-module import.
const validatedTarget = validateDestructiveTransactionTestTarget({
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
  CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: process.env.CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS,
});
const databaseUrl = validatedTarget.href;
const verificationPool = new Pool({ connectionString: databaseUrl, max: 8 });

type TransactionModule = typeof import("./index");
let transactionModule: TransactionModule;

type ContextDbHasTransaction = "transaction" extends keyof import("./index").CmsTransactionContext["db"] ? true : false;
const contextDbHasNoTransaction: false = false as ContextDbHasTransaction;
void contextDbHasNoTransaction;
type InsertReturn = ReturnType<import("./index").CmsTransactionContext["db"]["insert"]>;
type InsertReturnsPromise = InsertReturn extends Promise<unknown> ? true : false;
type InsertResultHasNoValuesBuilder = Awaited<InsertReturn> extends { values: unknown } ? false : true;
type PublicDbForbiddenKeys = Extract<
  "transaction" | "$client" | "session" | "from" | "where" | "values" | "set" | "prepare",
  keyof import("./index").CmsTransactionContext["db"]
>;
const insertReturnsPromise: true = true as InsertReturnsPromise;
const insertResultHasNoValuesBuilder: true = true as InsertResultHasNoValuesBuilder;
const publicDbForbiddenKeys: never = undefined as never as PublicDbForbiddenKeys;
void insertReturnsPromise;
void insertResultHasNoValuesBuilder;
void publicDbForbiddenKeys;

function testId(label: string): string {
  return `${label}-${crypto.randomUUID()}`;
}

async function countRows(id: string): Promise<number> {
  const result = await verificationPool!.query<{ count: number }>(
    "SELECT count(*)::int AS count FROM cms_transaction_test WHERE id = $1",
    [id]
  );
  return result.rows[0].count;
}

function isInactiveContextError(error: unknown): boolean {
  if (error instanceof InactiveCmsTransactionContextError) return true;
  return typeof error === "object"
    && error !== null
    && "cause" in error
    && error.cause instanceof InactiveCmsTransactionContextError;
}

before(async () => {
  process.env.DATABASE_URL = databaseUrl;
  const version = await verificationPool.query<{ major: number }>(
    "SELECT current_setting('server_version_num')::int / 10000 AS major"
  );
  assert.equal(version.rows[0].major, 18, "destructive setup requires PostgreSQL 18");
  await verificationPool.query(`
    CREATE TABLE IF NOT EXISTS cms_transaction_test (
      id text PRIMARY KEY,
      value integer NOT NULL
    )
  `);
  transactionModule = await import("./index");
});

after(async () => {
  await verificationPool.query("DROP TABLE IF EXISTS cms_transaction_test");
  await verificationPool.end();
});

test("rejects unsafe targets without attempting a connection", () => {
  const local = "postgresql://test:test@localhost:5432/cms_phase3e_runtime";
  const rejected = [
    { TEST_DATABASE_URL: local },
    { TEST_DATABASE_URL: "postgresql://test:test@ep-example.neon.tech/cms_phase3e_runtime", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: "1" },
    { TEST_DATABASE_URL: "postgresql://test:test@db.example.com/cms_phase3e_runtime", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: "1" },
    { TEST_DATABASE_URL: "postgresql://test:test@8.8.8.8/cms_phase3e_runtime", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: "1" },
    { TEST_DATABASE_URL: "postgresql://test:test@192.168.1.10/cms_phase3e_runtime", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: "1" },
    ...["neondb", "postgres", "template0", "template1", "development"].map((name) => ({
      TEST_DATABASE_URL: `postgresql://test:test@localhost:5432/${name}`,
      CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: "1",
    })),
    { TEST_DATABASE_URL: "not a URL", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: "1" },
    { TEST_DATABASE_URL: "https://localhost/cms_phase3e_runtime", CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: "1" },
  ];
  for (const environment of rejected) {
    assert.throws(() => validateDestructiveTransactionTestTarget(environment));
  }
});

test("accepts only approved loopback disposable targets with opt-in", () => {
  for (const host of ["localhost", "127.0.0.1", "[::1]"]) {
    assert.doesNotThrow(() => validateDestructiveTransactionTestTarget({
      TEST_DATABASE_URL: `postgresql://test:test@${host}:5432/cms_phase3e_runtime`,
      CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: "1",
    }));
  }
});

test("commits raw and Drizzle writes", async () => {
  const rawId = testId("commit-raw");
  const drizzleId = testId("commit-drizzle");
  await transactionModule.withCmsTransaction(async (context) => {
    await context.query("INSERT INTO cms_transaction_test(id,value) VALUES ($1,$2)", [rawId, 1]);
    await context.db.execute(sql`INSERT INTO cms_transaction_test(id,value) VALUES (${drizzleId}, ${2})`);
  });
  assert.equal(await countRows(rawId), 1);
  assert.equal(await countRows(drizzleId), 1);
});

test("rolls back after a second statement failure", async () => {
  const id = testId("rollback-second");
  const applicationError = new Error("second statement failed");
  await assert.rejects(
    transactionModule.withCmsTransaction(async (context) => {
      await context.query("INSERT INTO cms_transaction_test(id,value) VALUES ($1,$2)", [id, 1]);
      throw applicationError;
    }),
    (error) => error === applicationError
  );
  assert.equal(await countRows(id), 0);
});

test("rolls back after a third statement failure", async () => {
  const firstId = testId("rollback-third-a");
  const secondId = testId("rollback-third-b");
  await assert.rejects(transactionModule.withCmsTransaction(async (context) => {
    await context.query("INSERT INTO cms_transaction_test(id,value) VALUES ($1,$2)", [firstId, 1]);
    await context.db.execute(sql`INSERT INTO cms_transaction_test(id,value) VALUES (${secondId}, ${2})`);
    await context.query("INSERT INTO cms_transaction_test(id,value) VALUES ($1,$2)", [firstId, 3]);
  }), (error: unknown) => (error as { code?: string }).code === "23505");
  assert.equal(await countRows(firstId), 0);
  assert.equal(await countRows(secondId), 0);
});

test("releases connections after success", async () => {
  for (let index = 0; index < 8; index++) {
    await transactionModule.withCmsTransaction(async (context) => {
      await context.query("SELECT 1");
    });
  }
  assert.equal((await verificationPool!.query("SELECT 1 AS value")).rows[0].value, 1);
});

test("releases connections after callback failure", async () => {
  for (let index = 0; index < 8; index++) {
    await assert.rejects(transactionModule.withCmsTransaction(async () => {
      throw new Error("expected callback failure");
    }), { message: "expected callback failure" });
  }
  assert.equal((await verificationPool!.query("SELECT 1 AS value")).rows[0].value, 1);
});

for (const code of ["40001", "40P01"] as const) {
  test(`retries SQLSTATE ${code} with a fresh transaction`, async () => {
    const id = testId(`retry-${code}`);
    let attempts = 0;
    const backendPids: number[] = [];
    const transactionIds: string[] = [];
    await transactionModule.withCmsTransaction(async (context) => {
      attempts += 1;
      const pid = await context.query<{ pid: number }>("SELECT pg_backend_pid()::int AS pid");
      const transactionId = await context.query<{ id: string }>("SELECT txid_current()::text AS id");
      backendPids.push(pid.rows[0].pid);
      transactionIds.push(transactionId.rows[0].id);
      if (attempts === 1) {
        await context.query(`DO $$ BEGIN RAISE EXCEPTION 'retry test' USING ERRCODE = '${code}'; END $$`);
      }
      await context.query("INSERT INTO cms_transaction_test(id,value) VALUES ($1,$2)", [id, attempts]);
    });
    assert.equal(attempts, 2);
    assert.equal(backendPids.length, 2);
    assert.notEqual(transactionIds[0], transactionIds[1]);
    assert.equal(await countRows(id), 1);
  });
}

test("does not retry SQLSTATE 23505", async () => {
  const id = testId("no-retry-unique");
  await verificationPool!.query("INSERT INTO cms_transaction_test(id,value) VALUES ($1,$2)", [id, 1]);
  let attempts = 0;
  await assert.rejects(transactionModule.withCmsTransaction(async (context) => {
    attempts += 1;
    await context.query("INSERT INTO cms_transaction_test(id,value) VALUES ($1,$2)", [id, 2]);
  }), (error: unknown) => (error as { code?: string }).code === "23505");
  assert.equal(attempts, 1);
});

for (const code of ["23503", "23514"] as const) {
  test(`does not retry SQLSTATE ${code}`, async () => {
    let attempts = 0;
    await assert.rejects(transactionModule.withCmsTransaction(async (context) => {
      attempts += 1;
      await context.query(`DO $$ BEGIN RAISE EXCEPTION 'constraint test' USING ERRCODE = '${code}'; END $$`);
    }), (error: unknown) => (error as { code?: string }).code === code);
    assert.equal(attempts, 1);
  });
}

test("propagates the final retryable error after retry exhaustion", async () => {
  let attempts = 0;
  await assert.rejects(transactionModule.withCmsTransaction(async (context) => {
    attempts += 1;
    await context.query("DO $$ BEGIN RAISE EXCEPTION 'exhausted' USING ERRCODE = '40001'; END $$");
  }), (error: unknown) => (error as { code?: string }).code === "40001");
  assert.equal(attempts, transactionModule.CMS_TRANSACTION_MAX_ATTEMPTS);
});

test("raw query and Drizzle share the same backend and transaction visibility", async () => {
  const id = testId("same-connection");
  await transactionModule.withCmsTransaction(async (context) => {
    const rawPid = await context.query<{ pid: number }>("SELECT pg_backend_pid()::int AS pid");
    const drizzlePid = await context.db.execute<{ pid: number }>(sql`SELECT pg_backend_pid()::int AS pid`);
    assert.equal(drizzlePid.rows[0].pid, rawPid.rows[0].pid);
    await context.query("INSERT INTO cms_transaction_test(id,value) VALUES ($1,$2)", [id, 7]);
    const visible = await context.db.execute<{ value: number }>(sql`SELECT value FROM cms_transaction_test WHERE id = ${id}`);
    assert.equal(visible.rows[0].value, 7);
  });
});

test("raw advisory lock belongs to the same transaction", async () => {
  const lockId = 3_004_201;
  await transactionModule.withCmsTransaction(async (context) => {
    await context.query("SELECT pg_advisory_xact_lock($1)", [lockId]);
    const competing = await verificationPool!.query<{ acquired: boolean }>("SELECT pg_try_advisory_xact_lock($1) AS acquired", [lockId]);
    assert.equal(competing.rows[0].acquired, false);
  });
  const afterCommit = await verificationPool!.query<{ acquired: boolean }>("SELECT pg_try_advisory_xact_lock($1) AS acquired", [lockId]);
  assert.equal(afterCommit.rows[0].acquired, true);
});

test("raw row lock belongs to the same transaction", async () => {
  const id = testId("row-lock");
  await verificationPool!.query("INSERT INTO cms_transaction_test(id,value) VALUES ($1,$2)", [id, 1]);
  await transactionModule.withCmsTransaction(async (context) => {
    await context.query("SELECT id FROM cms_transaction_test WHERE id = $1 FOR UPDATE", [id]);
    const competitor = await verificationPool!.connect();
    try {
      await competitor.query("BEGIN");
      await competitor.query("SET LOCAL lock_timeout = '100ms'");
      await assert.rejects(
        competitor.query("SELECT id FROM cms_transaction_test WHERE id = $1 FOR UPDATE", [id]),
        (error: unknown) => (error as { code?: string }).code === "55P03"
      );
      await competitor.query("ROLLBACK");
    } finally {
      competitor.release();
    }
  });
});

test("automatically rejects nested transaction entry before invoking inner work", async () => {
  let innerInvoked = false;
  await transactionModule.withCmsTransaction(async () => {
    await assert.rejects(
      transactionModule.withCmsTransaction(async () => {
        innerInvoked = true;
      }),
      { name: "NestedCmsTransactionError" }
    );
  });
  assert.equal(innerInvoked, false);
});

test("allows independent concurrent top-level transactions", async () => {
  const ids = [testId("concurrent-a"), testId("concurrent-b")];
  await Promise.all(ids.map((id) => transactionModule.withCmsTransaction(async (context) => {
    await context.query("INSERT INTO cms_transaction_test(id,value) VALUES ($1,$2)", [id, 1]);
    await new Promise((resolve) => setTimeout(resolve, 25));
  })));
  assert.deepEqual(await Promise.all(ids.map(countRows)), [1, 1]);
});

test("rejects context use after transaction completion", async () => {
  let leakedContext: Parameters<Parameters<typeof transactionModule.withCmsTransaction>[0]>[0] | undefined;
  await transactionModule.withCmsTransaction(async (context) => {
    leakedContext = context;
    await context.query("SELECT 1");
  });
  assert.throws(
    () => leakedContext!.query("SELECT 1"),
    (error) => error instanceof InactiveCmsTransactionContextError
  );
  await assert.rejects(leakedContext!.db.execute(sql`SELECT 1`), isInactiveContextError);
});

test("executes explicit CRUD and count operations without returning builders", async () => {
  const id = testId("explicit-crud");
  await transactionModule.withCmsTransaction(async (context) => {
    const inserted = await context.db.insert<{ id: string }>(sql`INSERT INTO cms_transaction_test(id,value) VALUES (${id}, 1) RETURNING id`);
    assert.deepEqual(inserted.rows, [{ id }]);
    const updated = await context.db.update<{ value: number }>(sql`UPDATE cms_transaction_test SET value=2 WHERE id=${id} RETURNING value`);
    assert.equal(updated.rows[0].value, 2);
    const selected = await context.db.select<{ value: number }>(sql`SELECT value FROM cms_transaction_test WHERE id=${id}`);
    assert.equal(selected.rows[0].value, 2);
    assert.equal(await context.db.count(sql`SELECT count(*)::int AS count FROM cms_transaction_test WHERE id=${id}`), 1);
    const deleted = await context.db.delete<{ id: string }>(sql`DELETE FROM cms_transaction_test WHERE id=${id} RETURNING id`);
    assert.equal(deleted.rows[0].id, id);
  });
  assert.equal(await countRows(id), 0);
});

test("returned operation data has no query, session, client, or lifecycle surface", async () => {
  await transactionModule.withCmsTransaction(async (context) => {
    for (const operation of [context.db.select, context.db.insert, context.db.update, context.db.delete, context.db.execute]) {
      const pending = operation<{ value: number }>(sql`SELECT 1::int AS value`);
      assert.equal(typeof Reflect.get(pending, "then"), "function");
      for (const key of ["from", "where", "values", "set", "prepare", "session", "client", "release", "connect", "end"]) {
        assert.equal(Reflect.get(pending, key), undefined);
      }
      const result = await pending;
      assert.equal(Object.isFrozen(result), true);
      assert.equal(Object.isFrozen(result.rows), true);
      assert.deepEqual(Reflect.ownKeys(result).map(String).sort(), ["rowCount", "rows"]);
      for (const key of ["from", "where", "values", "set", "prepare", "session", "client", "release", "connect", "end"]) {
        assert.equal(Reflect.get(result, key), undefined);
      }
    }
  });
});

test("removes Drizzle transaction control while preserving outer commit ownership", async () => {
  const ids = [testId("control-before"), testId("control-after")];
  await transactionModule.withCmsTransaction(async (context) => {
    await context.query("INSERT INTO cms_transaction_test(id,value) VALUES ($1,$2)", [ids[0], 1]);
    assert.equal("transaction" in context.db, false);
    assert.equal(Reflect.get(context.db, "transaction"), undefined);
    assert.equal("$client" in context.db, false);
    assert.equal("session" in context.db, false);
    await context.query("INSERT INTO cms_transaction_test(id,value) VALUES ($1,$2)", [ids[1], 2]);
  });
  assert.deepEqual(await Promise.all(ids.map(countRows)), [1, 1]);
});

test("exposes only the reflection-safe transaction database facade", async () => {
  const approvedKeys = ["count", "delete", "execute", "insert", "select", "update"];
  await transactionModule.withCmsTransaction(async (context) => {
    assert.equal(Object.getPrototypeOf(context.db), null);
    assert.deepEqual(Reflect.ownKeys(context.db).map(String).sort(), approvedKeys);
    assert.deepEqual(Object.getOwnPropertyNames(context.db).sort(), approvedKeys);
    assert.deepEqual(Object.keys(context.db).sort(), approvedKeys);
    assert.deepEqual(Object.getOwnPropertySymbols(context.db), []);

    const descriptors = Object.getOwnPropertyDescriptors(context.db);
    assert.deepEqual(Object.keys(descriptors).sort(), approvedKeys);
    for (const key of ["$client", "session", "transaction", "release", "connect", "end"]) {
      assert.equal(key in context.db, false);
      assert.equal(Reflect.get(context.db, key), undefined);
      assert.equal(Object.getOwnPropertyDescriptor(context.db, key), undefined);
      assert.equal(descriptors[key], undefined);
    }
    for (const key of approvedKeys) {
      assert.equal(typeof Reflect.get(context.db, key), "function");
    }

    const enumerated: string[] = [];
    for (const key in context.db) enumerated.push(key);
    assert.deepEqual(enumerated.sort(), approvedKeys);
    assert.equal(Object.isFrozen(context.db), true);
  });
});

test("blocks raw transaction-control SQL through tx.query", async () => {
  const statements = [
    "BEGIN",
    "START TRANSACTION",
    "COMMIT",
    "END",
    "ROLLBACK",
    "SAVEPOINT nested",
    "RELEASE SAVEPOINT nested",
    "  commit",
    "\nROLLBACK",
    "/* leading comment */ BEGIN",
    "-- leading comment\nSTART TRANSACTION",
  ];
  await transactionModule.withCmsTransaction(async (context) => {
    for (const statement of statements) {
      assert.throws(() => context.query(statement), CmsTransactionControlError);
    }
    assert.throws(() => context.query({ text: "COMMIT" }), CmsTransactionControlError);
    assert.equal((await context.query("SELECT 1 AS value")).rows[0].value, 1);
  });
});

test("blocks raw transaction-control SQL through tx.db.execute", async () => {
  await transactionModule.withCmsTransaction(async (context) => {
    for (const statement of ["BEGIN", "COMMIT", "ROLLBACK", "SAVEPOINT nested", "RELEASE SAVEPOINT nested"]) {
      await assert.rejects(context.db.execute(sql.raw(statement)), isInactiveOrControlError);
    }
  });
});

function isInactiveOrControlError(error: unknown): boolean {
  if (error instanceof CmsTransactionControlError) return true;
  return typeof error === "object"
    && error !== null
    && "cause" in error
    && error.cause instanceof CmsTransactionControlError;
}

test("allows ordinary SQL and outer rollback remains atomic after blocked misuse", async () => {
  const ids = [testId("control-rollback-a"), testId("control-rollback-b")];
  await assert.rejects(transactionModule.withCmsTransaction(async (context) => {
    await context.query("INSERT INTO cms_transaction_test(id,value) VALUES ($1,$2)", [ids[0], 1]);
    assert.throws(() => context.query("/* comment */ COMMIT"), CmsTransactionControlError);
    const harmless = await context.query<{ commitment: string; rollback_reason: string; savepoint_name: string }>(
      "WITH x AS (SELECT 'commitment'::text AS commitment) SELECT commitment, 'rollback_reason'::text AS rollback_reason, 'savepoint_name'::text AS savepoint_name FROM x"
    );
    assert.equal(harmless.rows[0].commitment, "commitment");
    await context.query("INSERT INTO cms_transaction_test(id,value) VALUES ($1,$2)", [ids[1], 2]);
    await context.query("UPDATE cms_transaction_test SET value=value+1 WHERE id=$1", [ids[1]]);
    await context.query("DELETE FROM cms_transaction_test WHERE id=$1", [testId("missing")]);
    throw new Error("force outer rollback");
  }), { message: "force outer rollback" });
  assert.deepEqual(await Promise.all(ids.map(countRows)), [0, 0]);
});

test("preserves the exact callback application error", async () => {
  const applicationError = Object.assign(new Error("application failure"), { applicationConflict: true });
  await assert.rejects(
    transactionModule.withCmsTransaction(async () => { throw applicationError; }),
    (error) => error === applicationError
  );
});

test("rollback leaves zero partial rows", async () => {
  const ids = [testId("partial-a"), testId("partial-b"), testId("partial-c")];
  await assert.rejects(transactionModule.withCmsTransaction(async (context) => {
    for (const [index, id] of ids.entries()) {
      await context.query("INSERT INTO cms_transaction_test(id,value) VALUES ($1,$2)", [id, index]);
    }
    throw new Error("rollback all rows");
  }));
  for (const id of ids) assert.equal(await countRows(id), 0);
});
