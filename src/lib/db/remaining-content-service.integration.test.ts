import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { Pool } from "pg";
import { validateDestructiveTransactionTestTarget } from "./transaction-test-target";
import type { MutationTestSynchronization } from "./mutation-test-synchronization";
import { categorySchema } from "../validations/category";
import { experienceSchema } from "../validations/experience";
import { testimonialSchema } from "../validations/testimonial";
import { messageStatusSchema } from "../validations/message";

const target = validateDestructiveTransactionTestTarget({ TEST_DATABASE_URL: process.env.TEST_DATABASE_URL, CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS: process.env.CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS });
const pool = new Pool({ connectionString: target.href, max: 12 });
let service: typeof import("./remaining-content-service");

const experienceInput = (role: string) => ({ role, company: "Studio", startDate: "2025", endDate: "", isCurrent: true, location: "Remote", description: "Work" });
const serviceInput = (name: string) => ({ name, description: "Description", icon: "Film", isFeatured: true, isActive: true });
const testimonialInput = (name: string) => ({ clientName: name, designation: "Director", company: "Studio", testimonialText: "Excellent work", rating: 5, isFeatured: true, status: "published" as const });

function barrier(parties: number): { synchronization: MutationTestSynchronization; pids: Set<number> } {
  let arrived = 0;
  let release!: () => void;
  const released = new Promise<void>((resolve) => { release = resolve; });
  const pids = new Set<number>();
  return { pids, synchronization: { async beforeContestedWrite(pid) { pids.add(pid); arrived += 1; if (arrived === parties) release(); await released; } } };
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
  service = await import("./remaining-content-service");
});
after(async () => { await pool.end(); });

test("category ordering uses MAX+1, preserves gaps, and concurrent creators serialize", async () => {
  await pool.query("DELETE FROM portfolio_categories");
  const zero = await service.createOrderedCategory({ name: "Zero", slug: "zero" });
  assert.equal((await pool.query("SELECT display_order FROM portfolio_categories WHERE id=$1", [zero])).rows[0].display_order, 0);
  const one = await service.createOrderedCategory({ name: "One", slug: "one" });
  assert.equal((await pool.query("SELECT display_order FROM portfolio_categories WHERE id=$1", [one])).rows[0].display_order, 1);
  await pool.query("DELETE FROM portfolio_categories WHERE id=$1", [one]);
  await pool.query("UPDATE portfolio_categories SET display_order=2 WHERE slug='zero'");
  await service.createOrderedCategory({ name: "Three", slug: "three" });
  assert.deepEqual((await pool.query("SELECT display_order FROM portfolio_categories ORDER BY display_order")).rows, [{ display_order: 2 }, { display_order: 3 }]);
  const sync = barrier(2);
  await Promise.all([service.createOrderedCategory({ name: "Four", slug: "four" }, sync.synchronization), service.createOrderedCategory({ name: "Five", slug: "five" }, sync.synchronization)]);
  assert.equal(sync.pids.size, 2);
  assert.deepEqual((await pool.query("SELECT display_order FROM portfolio_categories ORDER BY display_order")).rows.map((row) => row.display_order), [2, 3, 4, 5]);
});

test("category duplicate classification is exact and FK delete sets project category null without renumbering", async () => {
  await assert.rejects(service.createOrderedCategory({ name: "Duplicate", slug: "three" }), { name: "DuplicateSlugError" });
  await pool.query("CREATE OR REPLACE FUNCTION phase3e_other_unique() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'forced' USING ERRCODE='23505', CONSTRAINT='services_display_order_unique'; END $$; CREATE TRIGGER phase3e_category_other BEFORE INSERT ON portfolio_categories FOR EACH ROW EXECUTE FUNCTION phase3e_other_unique()");
  await assert.rejects(service.createOrderedCategory({ name: "Other", slug: "other" }), (error: unknown) => (error as Error).name !== "DuplicateSlugError");
  await pool.query("DROP TRIGGER phase3e_category_other ON portfolio_categories; CREATE OR REPLACE FUNCTION phase3e_same_constraint_check() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'forced' USING ERRCODE='23514', CONSTRAINT='portfolio_categories_slug_unique'; END $$; CREATE TRIGGER phase3e_category_check BEFORE INSERT ON portfolio_categories FOR EACH ROW EXECUTE FUNCTION phase3e_same_constraint_check()");
  await assert.rejects(service.createOrderedCategory({ name: "Check", slug: "check" }), (error: unknown) => (error as Error).name !== "DuplicateSlugError");
  await pool.query("DROP TRIGGER phase3e_category_check ON portfolio_categories");
  const categoryId = (await pool.query<{ id: string }>("SELECT id FROM portfolio_categories WHERE slug='three'")).rows[0].id;
  const projectId = crypto.randomUUID();
  await pool.query("INSERT INTO portfolio_projects(id,title,slug,category_id,status) VALUES ($1,'Project',$2,$3,'draft')", [projectId, `project-${projectId}`, categoryId]);
  const before = await pool.query("SELECT id,display_order FROM portfolio_categories WHERE id<>$1 ORDER BY id", [categoryId]);
  await pool.query("DELETE FROM portfolio_categories WHERE id=$1", [categoryId]);
  assert.equal((await pool.query("SELECT category_id FROM portfolio_projects WHERE id=$1", [projectId])).rows[0].category_id, null);
  assert.deepEqual((await pool.query("SELECT id,display_order FROM portfolio_categories ORDER BY id")).rows, before.rows);
});

test("experience ordered create, revision race, invariant, and delete preserve gaps", async () => {
  await pool.query("DELETE FROM experiences");
  const first = await service.createOrderedExperience(experienceInput("First"));
  assert.equal((await pool.query("SELECT display_order FROM experiences WHERE id=$1", [first])).rows[0].display_order, 0);
  const second = await service.createOrderedExperience(experienceInput("Second"));
  assert.equal((await pool.query("SELECT display_order FROM experiences WHERE id=$1", [second])).rows[0].display_order, 1);
  await pool.query("DELETE FROM experiences WHERE id=$1", [second]);
  await pool.query("UPDATE experiences SET display_order=2 WHERE id=$1", [first]);
  const third = await service.createOrderedExperience(experienceInput("Third"));
  assert.equal((await pool.query("SELECT display_order FROM experiences WHERE id=$1", [third])).rows[0].display_order, 3);
  const createSync = barrier(2);
  await Promise.all([service.createOrderedExperience(experienceInput("Four"), createSync.synchronization), service.createOrderedExperience(experienceInput("Five"), createSync.synchronization)]);
  assert.equal(createSync.pids.size, 2);
  const updateSync = barrier(2);
  const results = await Promise.allSettled([service.updateExperienceRevision(first, 1, experienceInput("Winner A"), updateSync.synchronization), service.updateExperienceRevision(first, 1, experienceInput("Winner B"), updateSync.synchronization)]);
  assertOneStale(results); assert.equal(updateSync.pids.size, 2);
  const final = (await pool.query("SELECT role,revision FROM experiences WHERE id=$1", [first])).rows[0];
  assert.equal(final.revision, 2); assert.ok(final.role === "Winner A" || final.role === "Winner B");
  assert.equal(experienceSchema.safeParse({ ...experienceInput("Bad"), endDate: "2026", isCurrent: true }).success, true);
  await assert.rejects(pool.query("INSERT INTO experiences(id,role,company,start_date,end_date,is_current,display_order) VALUES ($1,'Bad','Studio','2025','2026',true,99)", [crypto.randomUUID()]), (error: unknown) => (error as { code?: string }).code === "23514");
  const orders = (await pool.query("SELECT id,display_order FROM experiences WHERE id<>$1 ORDER BY id", [third])).rows;
  await pool.query("DELETE FROM experiences WHERE id=$1", [third]);
  assert.deepEqual((await pool.query("SELECT id,display_order FROM experiences ORDER BY id")).rows, orders);
});

test("service ordered create and same-revision updates serialize safely", async () => {
  await pool.query("DELETE FROM services");
  const first = await service.createOrderedService(serviceInput("First"));
  assert.equal((await pool.query("SELECT display_order FROM services WHERE id=$1", [first])).rows[0].display_order, 0);
  const second = await service.createOrderedService(serviceInput("Second"));
  assert.equal((await pool.query("SELECT display_order FROM services WHERE id=$1", [second])).rows[0].display_order, 1);
  await pool.query("DELETE FROM services WHERE id=$1", [second]);
  await pool.query("UPDATE services SET display_order=2 WHERE id=$1", [first]);
  assert.equal((await pool.query("SELECT display_order FROM services WHERE id=$1", [await service.createOrderedService(serviceInput("Third"))])).rows[0].display_order, 3);
  const createSync = barrier(2);
  await Promise.all([service.createOrderedService(serviceInput("Four"), createSync.synchronization), service.createOrderedService(serviceInput("Five"), createSync.synchronization)]);
  assert.equal(createSync.pids.size, 2);
  const updateSync = barrier(2);
  const results = await Promise.allSettled([service.updateServiceRevision(first, 1, serviceInput("Winner A"), updateSync.synchronization), service.updateServiceRevision(first, 1, serviceInput("Winner B"), updateSync.synchronization)]);
  assertOneStale(results); assert.equal(updateSync.pids.size, 2);
  const final = (await pool.query("SELECT name,revision FROM services WHERE id=$1", [first])).rows[0];
  assert.equal(final.revision, 2); assert.ok(final.name === "Winner A" || final.name === "Winner B");
});

test("testimonial validation, revision race, and delete are safe", async () => {
  assert.equal(testimonialSchema.safeParse({ ...testimonialInput("Low"), rating: 0 }).success, false);
  assert.equal(testimonialSchema.safeParse({ ...testimonialInput("High"), rating: 6 }).success, false);
  const id = await service.createTestimonialRecord(testimonialInput("First"));
  const sync = barrier(2);
  const results = await Promise.allSettled([service.updateTestimonialRevision(id, 1, testimonialInput("Winner A"), sync.synchronization), service.updateTestimonialRevision(id, 1, testimonialInput("Winner B"), sync.synchronization)]);
  assertOneStale(results); assert.equal(sync.pids.size, 2);
  const final = (await pool.query("SELECT client_name,revision FROM testimonials WHERE id=$1", [id])).rows[0];
  assert.equal(final.revision, 2); assert.ok(final.client_name === "Winner A" || final.client_name === "Winner B");
  await pool.query("DELETE FROM testimonials WHERE id=$1", [id]);
  assert.equal((await pool.query("SELECT count(*)::int n FROM testimonials WHERE id=$1", [id])).rows[0].n, 0);
});

test("message status revisions reject stale writes and update/delete race is coherent", async () => {
  assert.equal(messageStatusSchema.safeParse("invalid").success, false);
  const id = crypto.randomUUID();
  await pool.query("INSERT INTO contact_messages(id,name,email,message,status,revision) VALUES ($1,'Sender','sender@example.test','Hello','new',1)", [id]);
  const sync = barrier(2);
  const results = await Promise.allSettled([service.updateMessageStatusRevision(id, 1, "read", sync.synchronization), service.updateMessageStatusRevision(id, 1, "replied", sync.synchronization)]);
  assertOneStale(results); assert.equal(sync.pids.size, 2);
  const final = (await pool.query("SELECT status,revision FROM contact_messages WHERE id=$1", [id])).rows[0];
  assert.equal(final.revision, 2); assert.ok(final.status === "read" || final.status === "replied");
  const race = await Promise.allSettled([service.updateMessageStatusRevision(id, 2, "archived"), pool.query("DELETE FROM contact_messages WHERE id=$1", [id])]);
  assert.equal((await pool.query("SELECT count(*)::int n FROM contact_messages WHERE id=$1", [id])).rows[0].n, 0);
  assert.ok(race.every((result) => result.status === "fulfilled" || (result.reason as Error).name === "ContentNotFoundError"));
  assert.equal(categorySchema.safeParse({ name: "A", slug: "A" }).success, false);
});
