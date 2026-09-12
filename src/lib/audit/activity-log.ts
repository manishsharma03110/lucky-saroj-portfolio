import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

type Actor = { id: string; name: string; email: string };
type MetadataValue = string | number | boolean | null | MetadataValue[];
type Metadata = Record<string, MetadataValue>;

const SENSITIVE_KEY = /(password|hash|secret|token|cookie|session|database|credential|authorization)/i;

function sanitizeValue(value: unknown, depth = 0): MetadataValue | undefined {
  if (depth > 2) return undefined;
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeValue(item, depth + 1)).filter((item): item is MetadataValue => item !== undefined);
  }
  return undefined;
}

export function sanitizeActivityMetadata(input: Record<string, unknown> | undefined): Metadata {
  if (!input) return {};
  const safe: Metadata = {};
  for (const [key, value] of Object.entries(input).slice(0, 30)) {
    if (SENSITIVE_KEY.test(key)) continue;
    const sanitized = sanitizeValue(value);
    if (sanitized !== undefined) safe[key] = sanitized;
  }
  return safe;
}

export async function recordActivity(input: {
  actor: Actor;
  action: string;
  resource: string;
  resourceId?: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const metadata = sanitizeActivityMetadata(input.metadata);
  await db.execute(sql`
    INSERT INTO activity_logs (
      admin_user_id, actor_name, actor_email, action, resource, resource_id, summary, metadata
    ) VALUES (
      ${input.actor.id}, ${input.actor.name}, ${input.actor.email}, ${input.action}, ${input.resource},
      ${input.resourceId ?? null}, ${input.summary}, ${JSON.stringify(metadata)}::jsonb
    )
  `);
}

export async function recordActivitySafely(input: Parameters<typeof recordActivity>[0]): Promise<void> {
  try {
    await recordActivity(input);
  } catch {
    // Audit telemetry must never turn an already-committed CMS mutation into a misleading user-facing failure.
    console.warn({ operation: "activity.record", result: "failed", action: input.action, resource: input.resource });
  }
}

export type ActivityLogRow = {
  id: string;
  admin_user_id: string | null;
  actor_name: string;
  actor_email: string;
  action: string;
  resource: string;
  resource_id: string | null;
  summary: string;
  metadata: Metadata;
  created_at: Date;
};

export async function listActivityLogs(filters: {
  actor?: string;
  action?: string;
  resource?: string;
  from?: string;
  to?: string;
  limit?: number;
}): Promise<ActivityLogRow[]> {
  const clauses = [sql`TRUE`];
  if (filters.actor) clauses.push(sql`admin_user_id = ${filters.actor}`);
  if (filters.action) clauses.push(sql`action = ${filters.action}`);
  if (filters.resource) clauses.push(sql`resource = ${filters.resource}`);
  if (filters.from) clauses.push(sql`created_at >= ${filters.from}::date`);
  if (filters.to) clauses.push(sql`created_at < (${filters.to}::date + interval '1 day')`);
  const limit = Math.min(Math.max(filters.limit ?? 100, 1), 200);
  const result = await db.execute<ActivityLogRow>(sql`
    SELECT id, admin_user_id, actor_name, actor_email, action, resource, resource_id, summary, metadata, created_at
    FROM activity_logs
    WHERE ${sql.join(clauses, sql` AND `)}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `);
  return result.rows;
}

export async function listActivityFilterOptions(): Promise<{
  actors: Array<{ id: string; name: string; email: string }>;
  actions: string[];
  resources: string[];
}> {
  const [actorsResult, actionsResult, resourcesResult] = await Promise.all([
    db.execute<{ id: string; name: string; email: string }>(sql`
      SELECT DISTINCT ON (admin_user_id) admin_user_id AS id, actor_name AS name, actor_email AS email
      FROM activity_logs
      WHERE admin_user_id IS NOT NULL
      ORDER BY admin_user_id, created_at DESC
    `),
    db.execute<{ action: string }>(sql`SELECT DISTINCT action FROM activity_logs ORDER BY action`),
    db.execute<{ resource: string }>(sql`SELECT DISTINCT resource FROM activity_logs ORDER BY resource`),
  ]);
  return {
    actors: actorsResult.rows,
    actions: actionsResult.rows.map((row) => row.action),
    resources: resourcesResult.rows.map((row) => row.resource),
  };
}
