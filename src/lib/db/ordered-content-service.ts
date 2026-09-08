import "server-only";
import { sql } from "drizzle-orm";
import type { CmsTransactionContext } from "./index";
import { synchronizeMutationTest, type MutationTestSynchronization } from "./mutation-test-synchronization";

export type OrderedResource = "portfolio_categories" | "experiences" | "services";
const ORDER_LOCK_NAMESPACE = 1_347_631;
const ORDER_LOCK_KEYS: Record<OrderedResource, number> = { portfolio_categories: 1, experiences: 2, services: 3 };

export async function allocateNextDisplayOrder(tx: CmsTransactionContext, resource: OrderedResource, testSynchronization?: MutationTestSynchronization): Promise<number> {
  await synchronizeMutationTest(tx, testSynchronization);
  await tx.query("SELECT pg_advisory_xact_lock($1,$2)", [ORDER_LOCK_NAMESPACE, ORDER_LOCK_KEYS[resource]]);
  const result = resource === "portfolio_categories"
    ? await tx.db.select<{ next_order: number }>(sql`SELECT COALESCE(MAX(display_order),-1)::int+1 AS next_order FROM portfolio_categories`)
    : resource === "experiences"
      ? await tx.db.select<{ next_order: number }>(sql`SELECT COALESCE(MAX(display_order),-1)::int+1 AS next_order FROM experiences`)
      : await tx.db.select<{ next_order: number }>(sql`SELECT COALESCE(MAX(display_order),-1)::int+1 AS next_order FROM services`);
  return result.rows[0].next_order;
}

export const ORDERED_CONTENT_ADVISORY_KEYS = Object.freeze({ namespace: ORDER_LOCK_NAMESPACE, ...ORDER_LOCK_KEYS });
