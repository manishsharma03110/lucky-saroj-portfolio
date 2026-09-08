import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { Pool } from "pg";
import { validateDestructiveTransactionTestTarget } from "./transaction-test-target";
import { DuplicateSlugError } from "./mutation-errors";
import type { MutationTestSynchronization } from "./mutation-test-synchronization";

const target = validateDestructiveTransactionTestTarget({ TEST_DATABASE_URL: process.env.TEST_DATABASE_URL, CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: process.env.CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS });
const pool = new Pool({ connectionString: target.href, max: 10 });
let about: typeof import("./about-service");
let singleton: typeof import("./singleton-content-service");
let portfolio: typeof import("./portfolio-service");
let ordered: typeof import("./ordered-content-service");
let transaction: typeof import("./index");

const projectInput = (slug: string, tools: string[] = ["Premiere"]): import("./portfolio-service").ProjectMutationInput => ({ title: "Project", slug, clientName: "", year: 2026, categoryId: "", description: "", challenge: "", approach: "", result: "", thumbnailUrl: "", videoUrl: "", isFeatured: false, status: "draft", seoTitle: "", seoDescription: "", tools });
const settingsInput = (name: string): import("../validations/settings").SettingsInput => ({ siteName: name, logoText: "LS", contactEmail: "local@example.test", contactPhone: "", whatsapp: "", location: "India", availability: "Available", paymentTerms: "", turnaroundTime: "", heroHeading: "Hero", heroSubheading: "Sub", heroDescription: "Description", heroImageUrl: "", heroImageAssetId: "", statYears: "1", statProjects: "1", statClients: "1", statViews: "1", footerDescription: "Footer", instagramUrl: "", twitterUrl: "", youtubeUrl: "", linkedinUrl: "", behanceUrl: "", vimeoUrl: "", seoTitle: "SEO", seoDescription: "" });
const showreelInput = (title: string) => ({ title, videoUrl: "", thumbnailUrl: null, duration: "", isFeatured: true, status: "published" as const });

function deterministicBarrier(parties: number): { synchronization: MutationTestSynchronization; pids: Set<number> } {
  let arrived = 0;
  let release!: () => void;
  const released = new Promise<void>((resolve) => { release = resolve; });
  const pids = new Set<number>();
  return {
    pids,
    synchronization: {
      async beforeContestedWrite(backendPid) {
        pids.add(backendPid);
        arrived += 1;
        if (arrived === parties) release();
        await released;
      },
    },
  };
}

function assertOneStale(results: PromiseSettledResult<unknown>[]): void {
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  const rejected = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");
  assert.equal(rejected.length, 1);
  assert.equal(rejected[0].reason?.name, "StaleRevisionError");
}

before(async () => {
  assert.equal((await pool.query<{ major: number }>("SELECT current_setting('server_version_num')::int/10000 major")).rows[0].major, 18);
  process.env.DATABASE_URL = target.href;
  about = await import("./about-service"); singleton = await import("./singleton-content-service"); portfolio = await import("./portfolio-service"); ordered = await import("./ordered-content-service"); transaction = await import("./index");
});
after(async () => { await pool.end(); });

test("About replacement commits parent and canonically owned children", async () => {
  await pool.query("DELETE FROM about_skills; DELETE FROM about_tools; UPDATE about_profile SET revision=1,name='Before' WHERE id='singleton:about'");
  const revision = await about.replaceAbout({ expectedRevision: 1, name: "After", headline: null, biography: null, yearsExperience: 2, projectsCompleted: 3, clientCount: 4, viewsGenerated: "5", skills: [{ name: "Editing", displayOrder: 0 }], tools: [{ name: "Resolve", displayOrder: 0 }] });
  assert.equal(revision, 2);
  assert.deepEqual((await pool.query("SELECT name,revision FROM about_profile WHERE id='singleton:about'")).rows[0], { name: "After", revision: 2 });
  assert.equal((await pool.query("SELECT count(*)::int n FROM about_skills WHERE profile_id='singleton:about'")).rows[0].n, 1);
  assert.equal((await pool.query("SELECT count(*)::int n FROM about_tools WHERE profile_id='singleton:about'")).rows[0].n, 1);
});
test("About stale write changes no parent or children", async () => {
  const before = await pool.query("SELECT name,revision FROM about_profile");
  await assert.rejects(about.replaceAbout({ expectedRevision: 1, name: "Stale", headline: null, biography: null, yearsExperience: 0, projectsCompleted: 0, clientCount: 0, viewsGenerated: "0", skills: [], tools: [] }), { name: "StaleRevisionError" });
  assert.deepEqual((await pool.query("SELECT name,revision FROM about_profile")).rows, before.rows);
  assert.equal((await pool.query("SELECT count(*)::int n FROM about_skills")).rows[0].n, 1);
});
test("About duplicate child inputs reject before mutation", async () => {
  const base = { expectedRevision: 2, name: "After", headline: null, biography: null, yearsExperience: 0, projectsCompleted: 0, clientCount: 0, viewsGenerated: "0", tools: [] };
  await assert.rejects(about.replaceAbout({ ...base, skills: [{ name: "A", displayOrder: 0 }, { name: "A", displayOrder: 1 }] }), { name: "DuplicateContentError" });
  await assert.rejects(about.replaceAbout({ ...base, skills: [{ name: "A", displayOrder: 0 }, { name: "B", displayOrder: 0 }] }), { name: "DuplicateContentError" });
  await assert.rejects(about.replaceAbout({ ...base, skills: [], tools: [{ name: "A", displayOrder: 0 }, { name: "A", displayOrder: 1 }] }), { name: "DuplicateContentError" });
  await assert.rejects(about.replaceAbout({ ...base, skills: [], tools: [{ name: "A", displayOrder: 0 }, { name: "B", displayOrder: 0 }] }), { name: "DuplicateContentError" });
});
test("About forced child failure rolls back parent and all children", async () => {
  await pool.query("CREATE OR REPLACE FUNCTION fail_phase3e_child() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.name='FAIL' THEN RAISE EXCEPTION 'forced'; END IF; RETURN NEW; END $$; CREATE TRIGGER fail_about_tool BEFORE INSERT ON about_tools FOR EACH ROW EXECUTE FUNCTION fail_phase3e_child()");
  await assert.rejects(about.replaceAbout({ expectedRevision: 2, name: "Must rollback", headline: null, biography: null, yearsExperience: 0, projectsCompleted: 0, clientCount: 0, viewsGenerated: "0", skills: [{ name: "New", displayOrder: 0 }], tools: [{ name: "FAIL", displayOrder: 0 }] }));
  await pool.query("DROP TRIGGER fail_about_tool ON about_tools");
  assert.equal((await pool.query("SELECT name FROM about_profile")).rows[0].name, "After");
  assert.equal((await pool.query("SELECT name FROM about_skills")).rows[0].name, "Editing");
});
test("About forced skill failure rolls back parent before tool replacement", async () => {
  await pool.query("CREATE TRIGGER fail_about_skill BEFORE INSERT ON about_skills FOR EACH ROW EXECUTE FUNCTION fail_phase3e_child()");
  const revision = (await pool.query<{ revision: number }>("SELECT revision FROM about_profile")).rows[0].revision;
  await assert.rejects(about.replaceAbout({ expectedRevision: revision, name: "Must rollback", headline: null, biography: null, yearsExperience: 0, projectsCompleted: 0, clientCount: 0, viewsGenerated: "0", skills: [{ name: "FAIL", displayOrder: 0 }], tools: [] }));
  await pool.query("DROP TRIGGER fail_about_skill ON about_skills");
  assert.notEqual((await pool.query("SELECT name FROM about_profile")).rows[0].name, "Must rollback");
});
test("concurrent About same-revision updates allow exactly one", async () => {
  await pool.query("DELETE FROM about_skills; DELETE FROM about_tools; UPDATE about_profile SET revision=2,name='Before race' WHERE id='singleton:about'");
  const input = (name: string) => ({ expectedRevision: 2, name, headline: null, biography: null, yearsExperience: 0, projectsCompleted: 0, clientCount: 0, viewsGenerated: "0", skills: [{ name: `${name} skill`, displayOrder: 0 }], tools: [{ name: `${name} tool`, displayOrder: 0 }] });
  const barrier = deterministicBarrier(2);
  const results = await Promise.allSettled([about.replaceAbout(input("One"), barrier.synchronization), about.replaceAbout(input("Two"), barrier.synchronization)]);
  assertOneStale(results);
  assert.equal(barrier.pids.size, 2);
  const final = (await pool.query("SELECT name,revision FROM about_profile WHERE id='singleton:about'")).rows[0];
  assert.equal(final.revision, 3);
  assert.ok(final.name === "One" || final.name === "Two");
  assert.deepEqual((await pool.query("SELECT name FROM about_skills WHERE profile_id='singleton:about'")).rows, [{ name: `${final.name} skill` }]);
  assert.deepEqual((await pool.query("SELECT name FROM about_tools WHERE profile_id='singleton:about'")).rows, [{ name: `${final.name} tool` }]);
});

test("Settings canonical revision update and stale no-op", async () => {
  await pool.query("UPDATE site_settings SET revision=1,site_name='Before' WHERE id='singleton:settings'");
  assert.equal(await singleton.updateSingletonSettings(settingsInput("After"), 1), 2);
  await assert.rejects(singleton.updateSingletonSettings(settingsInput("Stale"), 1), { name: "StaleRevisionError" });
  assert.deepEqual((await pool.query("SELECT id,site_name,revision FROM site_settings")).rows, [{ id: "singleton:settings", site_name: "After", revision: 2 }]);
});
test("concurrent Settings same-revision updates allow exactly one", async () => {
  const barrier = deterministicBarrier(2);
  const results = await Promise.allSettled([singleton.updateSingletonSettings(settingsInput("One"), 2, barrier.synchronization), singleton.updateSingletonSettings(settingsInput("Two"), 2, barrier.synchronization)]);
  assertOneStale(results);
  assert.equal(barrier.pids.size, 2);
  const final = (await pool.query("SELECT site_name,revision FROM site_settings WHERE id='singleton:settings'")).rows[0];
  assert.equal(final.revision, 3);
  assert.ok(final.site_name === "One" || final.site_name === "Two");
});
test("Settings missing canonical row is deliberate and fabricates nothing", async () => {
  assert.equal((await pool.query("SELECT count(*)::int n FROM pg_constraint WHERE conname='site_settings_singleton_id'")).rows[0].n, 1);
  await pool.query("DELETE FROM site_settings WHERE id='singleton:settings'");
  await assert.rejects(singleton.updateSingletonSettings(settingsInput("Missing"), 1), { name: "ContentNotFoundError" });
  assert.equal((await pool.query("SELECT count(*)::int n FROM site_settings WHERE id='singleton:settings'")).rows[0].n, 0);
  assert.equal((await pool.query("SELECT count(*)::int n FROM site_settings")).rows[0].n, 0);
});

test("Showreel absent, canonical first create, update, and stale rejection", async () => {
  await pool.query("DELETE FROM showreels");
  assert.equal((await pool.query("SELECT count(*)::int n FROM showreels")).rows[0].n, 0);
  assert.equal(await singleton.upsertSingletonShowreel(showreelInput("First"), null), 1);
  assert.deepEqual((await pool.query("SELECT id,title,revision FROM showreels")).rows[0], { id: "singleton:showreel", title: "First", revision: 1 });
  assert.equal(await singleton.upsertSingletonShowreel(showreelInput("Second"), 1), 2);
  await assert.rejects(singleton.upsertSingletonShowreel(showreelInput("Stale"), 1), { name: "StaleRevisionError" });
});
test("concurrent Showreel first creates produce one canonical row", async () => {
  await pool.query("DELETE FROM showreels");
  const barrier = deterministicBarrier(2);
  const results = await Promise.allSettled([singleton.upsertSingletonShowreel(showreelInput("One"), null, barrier.synchronization), singleton.upsertSingletonShowreel(showreelInput("Two"), null, barrier.synchronization)]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  const rejected = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");
  assert.equal(rejected.length, 1);
  assert.equal(rejected[0].reason?.name, "InvalidSingletonStateError");
  assert.equal(barrier.pids.size, 2);
  assert.deepEqual((await pool.query("SELECT count(*)::int n FROM showreels")).rows[0], { n: 1 });
  const final = (await pool.query("SELECT id,title,revision FROM showreels")).rows[0];
  assert.equal(final.id, "singleton:showreel");
  assert.ok(final.title === "One" || final.title === "Two");
  assert.equal(final.revision, 1);
});

test("Project create and tools commit atomically", async () => {
  const id = await portfolio.createPortfolioProject(projectInput(`atomic-${crypto.randomUUID()}`, ["A", "B"]));
  assert.equal((await pool.query("SELECT count(*)::int n FROM project_tools WHERE project_id=$1", [id])).rows[0].n, 2);
});
test("forced project tool failure leaves no parent", async () => {
  await pool.query("CREATE TRIGGER fail_project_tool BEFORE INSERT ON project_tools FOR EACH ROW EXECUTE FUNCTION fail_phase3e_child()");
  const slug = `rollback-${crypto.randomUUID()}`;
  await assert.rejects(portfolio.createPortfolioProject(projectInput(slug, ["FAIL"])));
  await pool.query("DROP TRIGGER fail_project_tool ON project_tools");
  assert.equal((await pool.query("SELECT count(*)::int n FROM portfolio_projects WHERE slug=$1", [slug])).rows[0].n, 0);
});
test("Project slug conflict is specific and duplicate tools prevalidate", async () => {
  const slug = `duplicate-${crypto.randomUUID()}`; await portfolio.createPortfolioProject(projectInput(slug));
  await assert.rejects(portfolio.createPortfolioProject(projectInput(slug)), { name: "DuplicateSlugError" });
  await assert.rejects(portfolio.createPortfolioProject(projectInput(`tools-${crypto.randomUUID()}`, ["A", "A"])), { name: "DuplicateContentError" });
});
test("unrelated 23505 is not mislabeled as a slug conflict", async () => {
  await pool.query("CREATE OR REPLACE FUNCTION fail_phase3e_unique() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'forced unique' USING ERRCODE='23505', CONSTRAINT='project_tools_project_id_name_unique'; END $$; CREATE TRIGGER fail_project_tool_unique BEFORE INSERT ON project_tools FOR EACH ROW EXECUTE FUNCTION fail_phase3e_unique()");
  await assert.rejects(portfolio.createPortfolioProject(projectInput(`other-unique-${crypto.randomUUID()}`)), (error: unknown) => !(error instanceof DuplicateSlugError));
  await pool.query("DROP TRIGGER fail_project_tool_unique ON project_tools");
});
test("non-23505 with the slug constraint field is not mislabeled", async () => {
  await pool.query("CREATE OR REPLACE FUNCTION fail_phase3e_check() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'forced check' USING ERRCODE='23514', CONSTRAINT='portfolio_projects_slug_unique'; END $$; CREATE TRIGGER fail_project_check BEFORE INSERT ON portfolio_projects FOR EACH ROW EXECUTE FUNCTION fail_phase3e_check()");
  await assert.rejects(portfolio.createPortfolioProject(projectInput(`not-unique-${crypto.randomUUID()}`)), (error: unknown) => !(error instanceof DuplicateSlugError));
  await pool.query("DROP TRIGGER fail_project_check ON portfolio_projects");
});
test("Project update increments revision and stale update preserves tools", async () => {
  const id = await portfolio.createPortfolioProject(projectInput(`update-${crypto.randomUUID()}`, ["Old"]));
  assert.equal(await portfolio.updatePortfolioProject(id, 1, projectInput(`updated-${crypto.randomUUID()}`, ["New"])), 2);
  await assert.rejects(portfolio.updatePortfolioProject(id, 1, projectInput(`stale-${crypto.randomUUID()}`, ["Stale"])), { name: "StaleRevisionError" });
  assert.deepEqual((await pool.query("SELECT name FROM project_tools WHERE project_id=$1", [id])).rows, [{ name: "New" }]);
});
test("forced project tool replacement failure rolls back parent revision", async () => {
  const id = await portfolio.createPortfolioProject(projectInput(`replace-fail-${crypto.randomUUID()}`, ["Old"]));
  await pool.query("CREATE TRIGGER fail_project_tool BEFORE INSERT ON project_tools FOR EACH ROW EXECUTE FUNCTION fail_phase3e_child()");
  await assert.rejects(portfolio.updatePortfolioProject(id, 1, projectInput(`must-rollback-${crypto.randomUUID()}`, ["FAIL"])));
  await pool.query("DROP TRIGGER fail_project_tool ON project_tools");
  assert.equal((await pool.query("SELECT revision FROM portfolio_projects WHERE id=$1", [id])).rows[0].revision, 1);
  assert.deepEqual((await pool.query("SELECT name FROM project_tools WHERE project_id=$1", [id])).rows, [{ name: "Old" }]);
});
test("concurrent Project updates and edit-vs-toggle allow exactly one", async () => {
  const id = await portfolio.createPortfolioProject(projectInput(`race-${crypto.randomUUID()}`));
  const editBarrier = deterministicBarrier(2);
  const inputs = [projectInput(`race-a-${crypto.randomUUID()}`, ["A"]), projectInput(`race-b-${crypto.randomUUID()}`, ["B"])] as const;
  const updates = await Promise.allSettled([portfolio.updatePortfolioProject(id, 1, inputs[0], editBarrier.synchronization), portfolio.updatePortfolioProject(id, 1, inputs[1], editBarrier.synchronization)]);
  assertOneStale(updates);
  assert.equal(editBarrier.pids.size, 2);
  const afterEdits = (await pool.query("SELECT slug,revision FROM portfolio_projects WHERE id=$1", [id])).rows[0];
  assert.equal(afterEdits.revision, 2);
  const winnerTool = afterEdits.slug === inputs[0].slug ? "A" : "B";
  assert.deepEqual((await pool.query("SELECT name FROM project_tools WHERE project_id=$1", [id])).rows, [{ name: winnerTool }]);
  const revision = (await pool.query<{ revision: number }>("SELECT revision FROM portfolio_projects WHERE id=$1", [id])).rows[0].revision;
  const mixedBarrier = deterministicBarrier(2);
  const mixed = await Promise.allSettled([portfolio.updatePortfolioProject(id, revision, projectInput(`edit-${crypto.randomUUID()}`), mixedBarrier.synchronization), portfolio.togglePortfolioFeatured(id, revision, true, mixedBarrier.synchronization)]);
  assertOneStale(mixed);
  assert.equal(mixedBarrier.pids.size, 2);
  assert.equal((await pool.query("SELECT revision FROM portfolio_projects WHERE id=$1", [id])).rows[0].revision, revision + 1);
});
test("toggle featured increments revision", async () => {
  const id = await portfolio.createPortfolioProject(projectInput(`toggle-${crypto.randomUUID()}`));
  assert.equal(await portfolio.togglePortfolioFeatured(id, 1, true), 2);
});

test("ordering allocator uses max plus one, preserves gaps, and isolates keys", async () => {
  await pool.query("DELETE FROM portfolio_categories; DELETE FROM services; DELETE FROM experiences");
  await transaction.withCmsTransaction(async (tx) => { assert.equal(await ordered.allocateNextDisplayOrder(tx, "portfolio_categories"), 0); });
  await pool.query("INSERT INTO portfolio_categories(id,name,slug,display_order) VALUES ('o0','0','o0',0),('o2','2','o2',2)");
  await pool.query("INSERT INTO services(id,name,display_order) VALUES ('s0','0',0),('s1','1',1),('s2','2',2)");
  await transaction.withCmsTransaction(async (tx) => { assert.equal(await ordered.allocateNextDisplayOrder(tx, "portfolio_categories"), 3); assert.equal(await ordered.allocateNextDisplayOrder(tx, "services"), 3); assert.equal(await ordered.allocateNextDisplayOrder(tx, "experiences"), 0); });
});
test("barrier-synchronized cooperating creators receive distinct orders", async () => {
  await pool.query("DELETE FROM portfolio_categories");
  const categoryBarrier = deterministicBarrier(2);
  const create = (resource: "portfolio_categories" | "services", id: string, synchronization: MutationTestSynchronization) => transaction.withCmsTransaction(async (tx) => {
    const order = await ordered.allocateNextDisplayOrder(tx, resource, synchronization);
    if (resource === "portfolio_categories") await tx.query("INSERT INTO portfolio_categories(id,name,slug,display_order) VALUES ($1,$1,$1,$2)", [id, order]);
    else await tx.query("INSERT INTO services(id,name,display_order) VALUES ($1,$1,$2)", [id, order]);
    return order;
  });
  const categoryOrders = await Promise.all([create("portfolio_categories", "c1", categoryBarrier.synchronization), create("portfolio_categories", "c2", categoryBarrier.synchronization)]);
  assert.deepEqual([...categoryOrders].sort(), [0, 1]);
  assert.equal(categoryBarrier.pids.size, 2);
  await pool.query("DELETE FROM services");
  const serviceBarrier = deterministicBarrier(3);
  const serviceOrders = await Promise.all([create("services", "s1", serviceBarrier.synchronization), create("services", "s2", serviceBarrier.synchronization), create("services", "s3", serviceBarrier.synchronization)]);
  assert.deepEqual([...serviceOrders].sort(), [0, 1, 2]);
  assert.equal(serviceBarrier.pids.size, 3);
});
test("ordering rollback releases transaction advisory lock", async () => {
  await assert.rejects(transaction.withCmsTransaction(async (tx) => { await ordered.allocateNextDisplayOrder(tx, "services"); throw new Error("rollback"); }));
  await transaction.withCmsTransaction(async (tx) => { assert.equal(typeof await ordered.allocateNextDisplayOrder(tx, "services"), "number"); });
});
test("ordering resource keys do not block one another", async () => {
  let releaseCategory!: () => void;
  const categoryHeld = new Promise<void>((resolve) => { releaseCategory = resolve; });
  let categoryLocked!: () => void;
  const locked = new Promise<void>((resolve) => { categoryLocked = resolve; });
  const holder = transaction.withCmsTransaction(async (tx) => { await ordered.allocateNextDisplayOrder(tx, "portfolio_categories"); categoryLocked(); await categoryHeld; });
  await locked;
  for (const resource of ["services", "experiences"] as const) {
    await Promise.race([
      transaction.withCmsTransaction(async (tx) => { await ordered.allocateNextDisplayOrder(tx, resource); }),
      new Promise((_, reject) => setTimeout(() => reject(new Error(`${resource} lock collided`)), 1000)),
    ]);
  }
  releaseCategory();
  await holder;
});
