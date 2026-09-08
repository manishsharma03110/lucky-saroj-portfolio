import type { CmsTransactionContext } from "./index";

/** Test-only synchronization seam. Production callers must omit this dependency. */
export type MutationTestSynchronization = Readonly<{
  beforeContestedWrite: (backendPid: number) => Promise<void>;
}>;

export async function synchronizeMutationTest(
  tx: CmsTransactionContext,
  synchronization?: MutationTestSynchronization
): Promise<void> {
  if (!synchronization) return;
  const result = await tx.query<{ pid: number }>("SELECT pg_backend_pid() AS pid");
  await synchronization.beforeContestedWrite(result.rows[0].pid);
}
