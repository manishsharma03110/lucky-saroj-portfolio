export const RETRYABLE_TRANSACTION_SQLSTATES = ["40001", "40P01"] as const;

export type RetryableTransactionSqlState = (typeof RETRYABLE_TRANSACTION_SQLSTATES)[number];

type PostgreSqlErrorLike = {
  code?: unknown;
};

export function getPostgreSqlState(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const code = (error as PostgreSqlErrorLike).code;
  return typeof code === "string" ? code : undefined;
}

export function isRetryableTransactionError(error: unknown): boolean {
  const code = getPostgreSqlState(error);
  return code === "40001" || code === "40P01";
}

export class NestedCmsTransactionError extends Error {
  constructor() {
    super("Nested CMS transactions are not supported; reuse the supplied transaction context.");
    this.name = "NestedCmsTransactionError";
  }
}

export class CmsTransactionRollbackError extends Error {
  readonly applicationError: unknown;
  readonly rollbackError: unknown;

  constructor(applicationError: unknown, rollbackError: unknown) {
    super("CMS transaction rollback failed.", { cause: applicationError });
    this.name = "CmsTransactionRollbackError";
    this.applicationError = applicationError;
    this.rollbackError = rollbackError;
  }
}

export class CmsTransactionReleaseError extends Error {
  readonly transactionError: unknown;
  readonly releaseError: unknown;

  constructor(transactionError: unknown, releaseError: unknown) {
    super("CMS transaction client release failed.", { cause: transactionError });
    this.name = "CmsTransactionReleaseError";
    this.transactionError = transactionError;
    this.releaseError = releaseError;
  }
}

export class InactiveCmsTransactionContextError extends Error {
  constructor() {
    super("CMS transaction context is no longer active.");
    this.name = "InactiveCmsTransactionContextError";
  }
}

export class CmsTransactionControlError extends Error {
  constructor() {
    super("CMS transaction lifecycle is controlled exclusively by withCmsTransaction.");
    this.name = "CmsTransactionControlError";
  }
}
