export class StaleRevisionError extends Error { constructor() { super("Content changed since this page was loaded. Reload before saving."); this.name = "StaleRevisionError"; } }
export class ContentNotFoundError extends Error { constructor() { super("Content no longer exists."); this.name = "ContentNotFoundError"; } }
export class DuplicateSlugError extends Error { constructor() { super("A project with this slug already exists."); this.name = "DuplicateSlugError"; } }
export class DuplicateContentError extends Error { constructor(message: string) { super(message); this.name = "DuplicateContentError"; } }
export class InvalidSingletonStateError extends Error { constructor() { super("Singleton content is in an invalid state."); this.name = "InvalidSingletonStateError"; } }

export type PostgresErrorFields = Readonly<{ code?: string; constraint?: string }>;

export function postgresErrorFields(error: unknown): PostgresErrorFields {
  let current = error;
  for (let depth = 0; depth < 5 && typeof current === "object" && current !== null; depth++) {
    const candidate = current as { code?: unknown; constraint?: unknown };
    const code = typeof candidate.code === "string" ? candidate.code : undefined;
    const constraint = typeof candidate.constraint === "string" ? candidate.constraint : undefined;
    if (code !== undefined || constraint !== undefined) return Object.freeze({ code, constraint });
    current = "cause" in current ? (current as { cause?: unknown }).cause : undefined;
  }
  return Object.freeze({});
}
