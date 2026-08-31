import { Pool, type PoolConfig, type PoolClient } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { getDatabaseUrl } from "./config";

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
