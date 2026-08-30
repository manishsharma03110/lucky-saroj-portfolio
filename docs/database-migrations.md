# Database Migration Workflow

## Active lineage

The active `drizzle/` directory is PostgreSQL-only.

1. `0000_postgresql_baseline_pre_reconciliation.sql` represents the verified
   PostgreSQL schema before contact inquiry reconciliation: 14 application
   tables and 123 columns.
2. `0001_contact_inquiry_reconciliation.sql` adds only the nullable `text`
   columns `contact_messages.video_type`, `project_timeline`, and
   `reference_url`.

The baseline corresponds to the recovery checkpoint and verified logical dump
created before reconciliation. Existing databases that already satisfy the
baseline must use the reviewed baseline-attestation procedure; never execute
the baseline table-creation SQL over an existing schema.

## Legacy evidence

The previous SQLite-oriented SQL, journal, snapshot, original ordering, and
SHA-256 inventory are preserved under
`migration-archive/legacy-sqlite-pre-reconciliation/`. They are audit evidence
only and must never be replayed against PostgreSQL.

## Production workflow

- Do not use `npm run db:push` for production schema changes.
- Do not run migrations during application startup or `next build`.
- Generate and review PostgreSQL SQL before execution.
- Create and verify a provider checkpoint and logical backup before writes.
- Rehearse the complete chain on an empty disposable database.
- Rehearse upgrades on a disposable restore of current production state.
- Run production migrations as a controlled, single-writer deployment step.
- Verify migration tracking, schema fingerprints, row counts, and relationships
  before deploying application code that requires the new schema.

## Connection security

- Hosted Neon production must use the pooled runtime endpoint with
  `sslmode=verify-full` so certificate and hostname verification remain
  explicit across node-postgres major versions.
- Runtime code must not use `rejectUnauthorized: false` for hosted Neon.
- Channel binding is enabled/requested by node-postgres and is used when the
  server offers SCRAM-SHA-256-PLUS.
- On a pooled endpoint, `pg_stat_ssl` describes the PostgreSQL connection
  visible behind PgBouncer; use the authorized Node TLS socket as the
  client-to-pooler TLS evidence.
- Migrations remain a separate, controlled deployment operation. They do not
  run during application startup or builds.

## Future changes

Update `src/lib/db/schema.ts`, generate a new migration with the pinned project
tooling, review the SQL for unrelated or destructive operations, test both a
fresh chain and an upgrade path, and retain the resulting journal/snapshots with
the SQL. Never edit an already-applied migration.
