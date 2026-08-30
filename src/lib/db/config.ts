type DatabaseEnvironment = {
  DATABASE_URL?: string;
  NODE_ENV?: string;
};

const POSTGRES_PROTOCOLS = new Set(["postgres:", "postgresql:"]);
const INSECURE_SSL_VALUES = new Set(["0", "false", "no-verify"]);

function databaseConfigurationError(reason: string): Error {
  return new Error(`Database configuration error: ${reason}`);
}

export function getDatabaseUrl(environment: DatabaseEnvironment = process.env): string {
  const value = environment.DATABASE_URL;
  if (!value) {
    throw databaseConfigurationError("DATABASE_URL is required.");
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw databaseConfigurationError("DATABASE_URL must be a valid URL.");
  }

  if (!POSTGRES_PROTOCOLS.has(parsed.protocol)) {
    throw databaseConfigurationError("DATABASE_URL must use the postgres or postgresql protocol.");
  }

  if (environment.NODE_ENV === "production") {
    const sslModes = parsed.searchParams.getAll("sslmode").map((mode) => mode.toLowerCase());
    if (sslModes.length !== 1 || sslModes[0] !== "verify-full") {
      throw databaseConfigurationError("production DATABASE_URL must use sslmode=verify-full.");
    }

    for (const [name, setting] of parsed.searchParams) {
      const normalizedName = name.toLowerCase();
      const normalizedSetting = setting.toLowerCase();
      const disablesVerification =
        (normalizedName === "ssl" && INSECURE_SSL_VALUES.has(normalizedSetting)) ||
        (normalizedName === "rejectunauthorized" && normalizedSetting === "false");

      if (disablesVerification) {
        throw databaseConfigurationError("production DATABASE_URL cannot disable TLS verification.");
      }
    }
  }

  return value;
}
