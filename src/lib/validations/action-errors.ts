import type { ZodIssue } from "zod";

export const SAFE_VALIDATION_MESSAGE = "Please fix the errors below.";

export function fieldErrorsFromIssues(issues: readonly ZodIssue[]): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const field = String(issue.path[0] ?? "form");
    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return fieldErrors;
}

export class InvalidActionInputError extends Error {
  readonly code = "INVALID_ACTION_INPUT";

  constructor() {
    super("Invalid action input.");
    this.name = "InvalidActionInputError";
  }
}
