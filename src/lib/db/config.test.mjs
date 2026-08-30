import assert from "node:assert/strict";
import test from "node:test";
import { getDatabaseUrl } from "./config.ts";

const production = (databaseUrl) => ({
  NODE_ENV: "production",
  DATABASE_URL: databaseUrl,
});

for (const value of [
  "postgresql://user:password@example.invalid/database?sslmode=verify-full",
  "postgres://user:password@example.invalid/database?sslmode=verify-full",
]) {
  test("accepts a production PostgreSQL URL using verify-full", () => {
    assert.equal(getDatabaseUrl(production(value)), value);
  });
}

for (const [name, value] of [
  ["missing DATABASE_URL", undefined],
  ["sslmode=require", "postgresql://user:password@example.invalid/database?sslmode=require"],
  ["sslmode=prefer", "postgresql://user:password@example.invalid/database?sslmode=prefer"],
  ["sslmode=allow", "postgresql://user:password@example.invalid/database?sslmode=allow"],
  ["sslmode=disable", "postgresql://user:password@example.invalid/database?sslmode=disable"],
  ["sslmode=verify-ca", "postgresql://user:password@example.invalid/database?sslmode=verify-ca"],
  ["no sslmode", "postgresql://user:password@example.invalid/database"],
  ["malformed URL", "not a database URL"],
  ["non-PostgreSQL scheme", "https://example.invalid/database?sslmode=verify-full"],
  ["duplicate sslmode", "postgresql://user:password@example.invalid/database?sslmode=verify-full&sslmode=verify-full"],
  ["verification disabled", "postgresql://user:password@example.invalid/database?sslmode=verify-full&ssl=no-verify"],
]) {
  test(`rejects production configuration: ${name}`, () => {
    assert.throws(
      () => getDatabaseUrl(production(value)),
      (error) => error instanceof Error && error.message.startsWith("Database configuration error:")
    );
  });
}

test("allows a local development PostgreSQL URL without sslmode", () => {
  const value = "postgresql://user:password@localhost/database";
  assert.equal(getDatabaseUrl({ NODE_ENV: "development", DATABASE_URL: value }), value);
});
