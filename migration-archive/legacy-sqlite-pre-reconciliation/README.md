# Legacy SQLite Migration Evidence

Archived before PostgreSQL migration reconciliation on 2026-08-29.

These artifacts are preserved as immutable audit evidence. They came from the
active `drizzle/` directory, but they do not form a safe PostgreSQL migration
history: migration `0000`, the journal, and the snapshot use the SQLite dialect,
while the runtime database and current Drizzle configuration use PostgreSQL.
They must never be replayed against PostgreSQL.

The live database was independently backed up and restored before this archive
was created. Read-only inspection found no trustworthy Drizzle tracking table.
The live effects of legacy migrations 0002 and 0003 already existed, while the
three columns described by 0001 did not.

## Original order and SHA-256 inventory

| Order | Original path | Archived path | SHA-256 |
|---:|---|---|---|
| 0000 | `drizzle/0000_marvelous_goblin_queen.sql` | `migration-archive/legacy-sqlite-pre-reconciliation/0000_marvelous_goblin_queen.sql` | `5816A3F3E5088E40ABF078AD381FBCB1C1694BDE5C3B9D7E491CCAB5413C2EB7` |
| 0001 | `drizzle/0001_contact_inquiry_fields.sql` | `migration-archive/legacy-sqlite-pre-reconciliation/0001_contact_inquiry_fields.sql` | `E210D824DDC6875BED8E559FA2E065206D089D78CC1AA464A290373A10144C83` |
| 0002 | `drizzle/0002_contact_professional_settings.sql` | `migration-archive/legacy-sqlite-pre-reconciliation/0002_contact_professional_settings.sql` | `E9A420B03AA2066E8F8736214D6AA2A208865E8F26EF5885ECC1228E34CD2AD8` |
| 0003 | `drizzle/0003_contact_working_terms.sql` | `migration-archive/legacy-sqlite-pre-reconciliation/0003_contact_working_terms.sql` | `36367D9E4A033F489EA9D50553C8A3F736C86E78F88EA5EEE0AF8A4EB7520EA5` |
| metadata | `drizzle/meta/_journal.json` | `migration-archive/legacy-sqlite-pre-reconciliation/meta/_journal.json` | `327419C2149C3EEF40EF3CFB5D360E05E0CF13BA6CD5B45305A92B678E76311E` |
| metadata | `drizzle/meta/0000_snapshot.json` | `migration-archive/legacy-sqlite-pre-reconciliation/meta/0000_snapshot.json` | `56F6362EABA6EC4AFEFF8D95ED8C30EC9AC3AD6A8FA363D6E2940DA9E27D8D58` |

## Legacy journal record

- Journal version: 7
- Journal dialect: `sqlite`
- Entries: `0000_marvelous_goblin_queen`, `0001_contact_inquiry_fields`,
  `0002_contact_professional_settings`, `0003_contact_working_terms`
- The only snapshot was version 6 with dialect `sqlite`.

The clean active `drizzle/` lineage replaces these artifacts with generated
PostgreSQL metadata. Archiving is evidentiary preservation, not a claim that
the legacy files were executed against the live PostgreSQL database.
