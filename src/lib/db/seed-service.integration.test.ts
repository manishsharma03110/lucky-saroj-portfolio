import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { Pool } from "pg";
import { validateDestructiveTransactionTestTarget } from "./transaction-test-target";

const target = validateDestructiveTransactionTestTarget({ TEST_DATABASE_URL: process.env.TEST_DATABASE_URL, CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: process.env.CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS });
const pool = new Pool({ connectionString: target.href, max: 8 });
let seed: typeof import("./seed-service");
const credentials = Object.freeze({ bootstrapEmail: "seed-bootstrap@example.test", bootstrapPassword: "local-only-passphrase" });

async function counts(): Promise<Record<string, number>> {
  const result = await pool.query<{ table_name: string; count: number }>(`
    SELECT 'admin_users' table_name,count(*)::int count FROM admin_users UNION ALL
    SELECT 'site_settings',count(*)::int FROM site_settings UNION ALL
    SELECT 'about_profile',count(*)::int FROM about_profile UNION ALL
    SELECT 'about_skills',count(*)::int FROM about_skills UNION ALL
    SELECT 'about_tools',count(*)::int FROM about_tools UNION ALL
    SELECT 'showreels',count(*)::int FROM showreels UNION ALL
    SELECT 'portfolio_categories',count(*)::int FROM portfolio_categories UNION ALL
    SELECT 'experiences',count(*)::int FROM experiences UNION ALL
    SELECT 'services',count(*)::int FROM services UNION ALL
    SELECT 'testimonials',count(*)::int FROM testimonials
  `);
  return Object.fromEntries(result.rows.map((row) => [row.table_name, row.count]));
}

before(async () => {
  assert.equal((await pool.query<{ major: number }>("SELECT current_setting('server_version_num')::int/10000 major")).rows[0].major, 18);
  process.env.DATABASE_URL = target.href;
  seed = await import("./seed-service");
});
after(async () => { await pool.end(); });

test("clean 0000-0004 first run preserves migration-owned singletons and creates one credentialed administrator", async () => {
  const beforeState = await counts();
  assert.deepEqual(beforeState, { admin_users: 0, site_settings: 1, about_profile: 1, about_skills: 0, about_tools: 0, showreels: 0, portfolio_categories: 0, experiences: 0, services: 0, testimonials: 0 });
  assert.deepEqual(await seed.runSeed(credentials), { settings: "preserved", about: "preserved", administrator: "created" });
  const afterState = await counts();
  assert.deepEqual(afterState, { admin_users: 1, site_settings: 1, about_profile: 1, about_skills: 0, about_tools: 0, showreels: 0, portfolio_categories: 0, experiences: 0, services: 0, testimonials: 0 });
  assert.deepEqual((await pool.query("SELECT id,revision FROM site_settings")).rows, [{ id: "singleton:settings", revision: 1 }]);
  assert.deepEqual((await pool.query("SELECT id,revision FROM about_profile")).rows, [{ id: "singleton:about", revision: 1 }]);
});

test("second and third runs preserve user content, revisions, children, optional Showreel, and administrator security state", async () => {
  await pool.query("UPDATE site_settings SET site_name='Customized',revision=7 WHERE id='singleton:settings'");
  await pool.query("UPDATE about_profile SET name='Customized About',revision=9 WHERE id='singleton:about'");
  await pool.query("INSERT INTO about_skills(id,profile_id,name,display_order) VALUES ('seed-skill','singleton:about','Custom Skill',4)");
  await pool.query("INSERT INTO about_tools(id,profile_id,name,display_order) VALUES ('seed-tool','singleton:about','Custom Tool',6)");
  await pool.query("INSERT INTO showreels(id,title,status,revision) VALUES ('singleton:showreel','Custom Showreel','draft',5)");
  await pool.query("UPDATE admin_users SET is_active=false,session_version=8 WHERE email=$1", [credentials.bootstrapEmail]);
  const securityBefore = (await pool.query("SELECT password_hash,role_id,is_active,session_version FROM admin_users WHERE email=$1", [credentials.bootstrapEmail])).rows[0];
  const countsBefore = await counts();
  assert.deepEqual(await seed.runSeed({}), { settings: "preserved", about: "preserved", administrator: "preserved" });
  const secondState = await counts();
  assert.deepEqual(await seed.runSeed({}), { settings: "preserved", about: "preserved", administrator: "preserved" });
  assert.deepEqual(await counts(), secondState);
  assert.deepEqual(secondState, countsBefore);
  assert.deepEqual((await pool.query("SELECT site_name,revision FROM site_settings")).rows, [{ site_name: "Customized", revision: 7 }]);
  assert.deepEqual((await pool.query("SELECT name,revision FROM about_profile")).rows, [{ name: "Customized About", revision: 9 }]);
  assert.deepEqual((await pool.query("SELECT id,title,status,revision FROM showreels")).rows, [{ id: "singleton:showreel", title: "Custom Showreel", status: "draft", revision: 5 }]);
  assert.deepEqual((await pool.query("SELECT password_hash,role_id,is_active,session_version FROM admin_users WHERE email=$1", [credentials.bootstrapEmail])).rows[0], securityBefore);
});

test("seed completion awaits the complete singleton logical unit", async () => {
  await pool.query("DELETE FROM about_profile; DELETE FROM site_settings");
  let entered!: () => void;
  let release!: () => void;
  const reached = new Promise<void>((resolve) => { entered = resolve; });
  const blocked = new Promise<void>((resolve) => { release = resolve; });
  let settled = false;
  const pending = seed.runSeed({}, { afterSettingsBootstrap: async () => { entered(); await blocked; } }).finally(() => { settled = true; });
  await reached;
  assert.equal(settled, false);
  assert.equal((await pool.query("SELECT count(*)::int n FROM site_settings")).rows[0].n, 0, "uncommitted settings must not escape the transaction");
  release();
  assert.deepEqual(await pending, { settings: "created", about: "created", administrator: "preserved" });
});

test("deterministic singleton failure rolls back the logical unit and propagates", async () => {
  await pool.query("DELETE FROM about_profile; DELETE FROM site_settings");
  await assert.rejects(seed.runSeed({}, { afterSettingsBootstrap: async () => { throw new Error("synthetic seed failure"); } }), /synthetic seed failure/);
  assert.equal((await pool.query("SELECT count(*)::int n FROM site_settings")).rows[0].n, 0);
  assert.equal((await pool.query("SELECT count(*)::int n FROM about_profile")).rows[0].n, 0);
});

test("unexpected PostgreSQL errors fail the seed without false success", async () => {
  await pool.query("CREATE OR REPLACE FUNCTION fail_seed_settings() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'forced seed database error'; END $$; CREATE TRIGGER fail_seed_settings BEFORE INSERT ON site_settings FOR EACH ROW EXECUTE FUNCTION fail_seed_settings()");
  await assert.rejects(seed.runSeed({}));
  await pool.query("DROP TRIGGER fail_seed_settings ON site_settings; DROP FUNCTION fail_seed_settings()");
  assert.equal((await pool.query("SELECT count(*)::int n FROM site_settings")).rows[0].n, 0);
  assert.equal((await pool.query("SELECT count(*)::int n FROM about_profile")).rows[0].n, 0);
});

test("seed leaves ordered demo tables untouched and therefore constraint-compatible", async () => {
  for (const table of ["portfolio_categories", "experiences", "services"] as const) {
    const invalid = await pool.query(`SELECT count(*)::int n FROM ${table} WHERE display_order < 0`);
    const duplicates = await pool.query(`SELECT count(*)::int n FROM (SELECT display_order FROM ${table} GROUP BY display_order HAVING count(*)>1) d`);
    assert.equal(invalid.rows[0].n, 0);
    assert.equal(duplicates.rows[0].n, 0);
  }
});

test("missing administrator credentials fail safely without inventing an account", async () => {
  await pool.query("DELETE FROM admin_users");
  await assert.rejects(seed.runSeed({}), /credentials are required/);
  assert.equal((await pool.query("SELECT count(*)::int n FROM admin_users")).rows[0].n, 0);
});
