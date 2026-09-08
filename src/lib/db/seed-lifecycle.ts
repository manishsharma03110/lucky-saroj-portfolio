export async function runWithCleanup<Result>(
  run: () => Promise<Result>,
  cleanup: () => Promise<void>
): Promise<Result> {
  let result: Result;

  try {
    result = await run();
  } catch (runError) {
    try {
      await cleanup();
    } catch (cleanupError) {
      throw new AggregateError(
        [runError, cleanupError],
        "Seed failed and resource cleanup also failed.",
        { cause: runError }
      );
    }
    throw runError;
  }

  await cleanup();
  return result;
}
