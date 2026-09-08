import { Pool, type PoolConfig, type PoolClient, type QueryConfig, type QueryResultRow } from "pg";
import { type SQL } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { getDatabaseUrl } from "./config";
import {
  CmsTransactionControlError,
  InactiveCmsTransactionContextError,
} from "./transaction-errors";
import {
  CMS_TRANSACTION_DEFAULT_ISOLATION,
  CMS_TRANSACTION_MAX_ATTEMPTS,
  runCmsTransaction,
} from "./transaction-runner";

type ChannelBindingPoolConfig = PoolConfig & {
  // Supported by pg 8.23; its current DefinitelyTyped PoolConfig lags runtime.
  enableChannelBinding: boolean;
};

const poolConfig: ChannelBindingPoolConfig = {
  connectionString: getDatabaseUrl(),
  enableChannelBinding: true,
  max: 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 15_000,
};

const globalForPostgres = globalThis as typeof globalThis & {
  portfolioPostgresPool?: Pool;
};

const pool = process.env.NODE_ENV === "development"
  ? (globalForPostgres.portfolioPostgresPool ??= new Pool(poolConfig))
  : new Pool(poolConfig);

export const db = drizzle(pool, { schema });
export { schema };

export type DatabaseTransaction = Pick<PoolClient, "query">;

const cmsTransactionContextBrand: unique symbol = Symbol("CmsTransactionContext");

export type CmsTransactionResult<Row> = Readonly<{
  rows: readonly Row[];
  rowCount: number;
}>;

type CmsTransactionOperation = <Row extends QueryResultRow = QueryResultRow>(
  statement: SQL
) => Promise<CmsTransactionResult<Row>>;

export type CmsTransactionDb = Readonly<{
  select: CmsTransactionOperation;
  insert: CmsTransactionOperation;
  update: CmsTransactionOperation;
  delete: CmsTransactionOperation;
  execute: CmsTransactionOperation;
  count: (statement: SQL) => Promise<number>;
}>;

export interface CmsTransactionQuery {
  <Row extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: readonly unknown[]
  ): Promise<CmsTransactionResult<Row>>;
  <Row extends QueryResultRow = QueryResultRow>(
    config: QueryConfig<readonly unknown[]>
  ): Promise<CmsTransactionResult<Row>>;
}

export type CmsTransactionContext = Readonly<{
  db: CmsTransactionDb;
  query: CmsTransactionQuery;
  [cmsTransactionContextBrand]: true;
}>;

export { CMS_TRANSACTION_DEFAULT_ISOLATION, CMS_TRANSACTION_MAX_ATTEMPTS };

function retryDelayMs(failedAttempt: number): number {
  const exponentialDelay = 10 * (2 ** (failedAttempt - 1));
  const jitter = Math.floor(Math.random() * 11);
  return Math.min(exponentialDelay + jitter, 50);
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function sqlAfterLeadingTrivia(sqlText: string): string {
  let offset = 0;
  while (offset < sqlText.length) {
    const whitespace = /^\s+/.exec(sqlText.slice(offset));
    if (whitespace) {
      offset += whitespace[0].length;
      continue;
    }
    if (sqlText.startsWith("--", offset)) {
      const lineEnd = sqlText.indexOf("\n", offset + 2);
      return lineEnd === -1 ? "" : sqlAfterLeadingTrivia(sqlText.slice(lineEnd + 1));
    }
    if (sqlText.startsWith("/*", offset)) {
      let depth = 1;
      let cursor = offset + 2;
      while (cursor < sqlText.length && depth > 0) {
        if (sqlText.startsWith("/*", cursor)) {
          depth += 1;
          cursor += 2;
        } else if (sqlText.startsWith("*/", cursor)) {
          depth -= 1;
          cursor += 2;
        } else {
          cursor += 1;
        }
      }
      if (depth > 0) return "";
      offset = cursor;
      continue;
    }
    break;
  }
  return sqlText.slice(offset);
}

function assertNoTransactionControlSql(queryInput: unknown): void {
  const sqlText = typeof queryInput === "string"
    ? queryInput
    : typeof queryInput === "object" && queryInput !== null && "text" in queryInput
      ? (queryInput as { text?: unknown }).text
      : undefined;
  if (typeof sqlText !== "string") return;

  const command = sqlAfterLeadingTrivia(sqlText);
  if (/^(?:BEGIN\b|START\s+TRANSACTION\b|COMMIT\b|END\b|ROLLBACK\b|SAVEPOINT\b|RELEASE\s+SAVEPOINT\b)/i.test(command)) {
    throw new CmsTransactionControlError();
  }
}

function createCmsTransactionContext(
  client: PoolClient,
  isActive: () => boolean
): CmsTransactionContext {
  const assertActive = () => {
    if (!isActive()) throw new InactiveCmsTransactionContextError();
  };
  const toPlainResult = <Row extends QueryResultRow>(result: { rows: Row[]; rowCount: number | null }): CmsTransactionResult<Row> => Object.freeze({
    rows: Object.freeze(result.rows.map((row) => Object.freeze({ ...row }))),
    rowCount: result.rowCount ?? result.rows.length,
  });
  const guardedQuery = ((...args: Parameters<PoolClient["query"]>) => {
    assertActive();
    assertNoTransactionControlSql(args[0]);
    return client.query(...args);
  }) as PoolClient["query"];
  const query = ((input: string | QueryConfig<readonly unknown[]>, values?: readonly unknown[]) => {
    assertActive();
    assertNoTransactionControlSql(input);
    const pending = typeof input === "string"
      ? client.query(input, values as unknown[] | undefined)
      : client.query(input as QueryConfig<unknown[]>);
    return pending.then((result) => toPlainResult(result));
  }) as CmsTransactionQuery;
  // Drizzle remains private. Public operations execute a complete SQL object
  // immediately and copy only result data across the transaction boundary.
  const guardedClient = new Proxy(client, {
    get(target, property) {
      if (property === "query") return guardedQuery;
      const value = Reflect.get(target, property, target) as unknown;
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
  const transactionDb = drizzle(guardedClient, { schema });
  const execute = async <Row extends QueryResultRow = QueryResultRow>(statement: SQL): Promise<CmsTransactionResult<Row>> => {
    assertActive();
    const result = await transactionDb.execute<Row>(statement);
    return toPlainResult(result as { rows: Row[]; rowCount: number | null });
  };
  const guardedDb = Object.assign(Object.create(null) as CmsTransactionDb, {
    select: execute,
    insert: execute,
    update: execute,
    delete: execute,
    execute,
    count: async (statement: SQL) => {
      const result = await execute<Record<"count", number | string>>(statement);
      const value = result.rows[0]?.count;
      if (value === undefined) throw new Error("CMS count query returned no row.");
      const count = Number(value);
      if (!Number.isSafeInteger(count) || count < 0) throw new Error("CMS count query returned an invalid count.");
      return count;
    },
  });
  Object.freeze(guardedDb);

  return Object.freeze({
    db: guardedDb,
    query,
    [cmsTransactionContextBrand]: true as const,
  });
}

/**
 * Runs database-only work in a connection-bound PostgreSQL transaction.
 *
 * The callback may be invoked up to three times after serialization failures
 * or deadlocks. It must not perform external HTTP/Blob operations, send email,
 * emit events, redirect, or invalidate caches. Perform those effects only
 * after this promise resolves successfully.
 *
 * Services that already received a CmsTransactionContext must reuse it rather
 * than call this entry point. Nested entry is rejected automatically.
 */
export async function withCmsTransaction<T>(
  work: (context: CmsTransactionContext) => Promise<T>
): Promise<T> {
  return runCmsTransaction({
    connect: () => pool.connect(),
    createContext: createCmsTransactionContext,
    delay,
    retryDelayMs,
  }, work);
}

export async function withDatabaseTransaction<T>(work: (transaction: DatabaseTransaction) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

/** Closes the process-owned database pool used by one-shot scripts such as seed. */
export async function closeDatabasePool(): Promise<void> {
  await pool.end();
}
