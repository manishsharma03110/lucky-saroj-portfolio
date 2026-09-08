import { AsyncLocalStorage } from "node:async_hooks";
import {
  CmsTransactionReleaseError,
  CmsTransactionRollbackError,
  isRetryableTransactionError,
  NestedCmsTransactionError,
} from "./transaction-errors";

export const CMS_TRANSACTION_MAX_ATTEMPTS = 3;
export const CMS_TRANSACTION_DEFAULT_ISOLATION = "READ COMMITTED" as const;

export type TransactionClient = {
  query(text: string): Promise<unknown>;
  release(): void;
};

export type TransactionRunnerDependencies<Client extends TransactionClient, Context> = {
  connect(): Promise<Client>;
  createContext(client: Client, isActive: () => boolean): Context;
  delay(milliseconds: number): Promise<void>;
  retryDelayMs(failedAttempt: number): number;
};

const transactionExecution = new AsyncLocalStorage<boolean>();

async function runAttempt<Client extends TransactionClient, Context, Result>(
  dependencies: TransactionRunnerDependencies<Client, Context>,
  work: (context: Context) => Promise<Result>
): Promise<Result> {
  const client = await dependencies.connect();
  let active = false;
  let transactionStarted = false;
  let result!: Result;
  let primaryError: unknown;

  try {
    await client.query(`BEGIN ISOLATION LEVEL ${CMS_TRANSACTION_DEFAULT_ISOLATION}`);
    transactionStarted = true;
    active = true;
    result = await work(dependencies.createContext(client, () => active));
    active = false;
    await client.query("COMMIT");
    transactionStarted = false;
  } catch (error) {
    active = false;
    primaryError = error;
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        primaryError = new CmsTransactionRollbackError(error, rollbackError);
      }
    }
  }

  try {
    client.release();
  } catch (releaseError) {
    if (primaryError !== undefined) {
      throw new CmsTransactionReleaseError(primaryError, releaseError);
    }
    throw releaseError;
  }

  if (primaryError !== undefined) throw primaryError;
  return result;
}

export async function runCmsTransaction<Client extends TransactionClient, Context, Result>(
  dependencies: TransactionRunnerDependencies<Client, Context>,
  work: (context: Context) => Promise<Result>
): Promise<Result> {
  if (transactionExecution.getStore()) throw new NestedCmsTransactionError();

  return transactionExecution.run(true, async () => {
    for (let attempt = 1; attempt <= CMS_TRANSACTION_MAX_ATTEMPTS; attempt++) {
      try {
        return await runAttempt(dependencies, work);
      } catch (error) {
        if (!isRetryableTransactionError(error) || attempt === CMS_TRANSACTION_MAX_ATTEMPTS) {
          throw error;
        }
        await dependencies.delay(dependencies.retryDelayMs(attempt));
      }
    }

    throw new Error("CMS transaction retry loop terminated unexpectedly.");
  });
}
