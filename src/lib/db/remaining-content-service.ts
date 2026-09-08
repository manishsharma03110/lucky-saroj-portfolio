import "server-only";

import { sql } from "drizzle-orm";
import type { CategoryInput } from "../validations/category";
import type { ExperienceInput } from "../validations/experience";
import type { ServiceInput } from "../validations/service";
import type { TestimonialInput } from "../validations/testimonial";
import { withCmsTransaction } from "./index";
import { ContentNotFoundError, DuplicateSlugError, postgresErrorFields, StaleRevisionError } from "./mutation-errors";
import { synchronizeMutationTest, type MutationTestSynchronization } from "./mutation-test-synchronization";
import { allocateNextDisplayOrder } from "./ordered-content-service";

export type MessageStatus = "new" | "read" | "replied" | "archived";

function isCategorySlugConflict(error: unknown): boolean {
  const fields = postgresErrorFields(error);
  return fields.code === "23505" && fields.constraint === "portfolio_categories_slug_unique";
}

export async function createOrderedCategory(input: CategoryInput, synchronization?: MutationTestSynchronization): Promise<string> {
  try {
    return await withCmsTransaction(async (tx) => {
      const displayOrder = await allocateNextDisplayOrder(tx, "portfolio_categories", synchronization);
      const id = crypto.randomUUID();
      await tx.db.insert(sql`INSERT INTO portfolio_categories(id,name,slug,display_order) VALUES (${id},${input.name},${input.slug},${displayOrder})`);
      return id;
    });
  } catch (error) {
    if (isCategorySlugConflict(error)) throw new DuplicateSlugError();
    throw error;
  }
}

export async function createOrderedExperience(input: ExperienceInput, synchronization?: MutationTestSynchronization): Promise<string> {
  return withCmsTransaction(async (tx) => {
    const displayOrder = await allocateNextDisplayOrder(tx, "experiences", synchronization);
    const id = crypto.randomUUID();
    await tx.db.insert(sql`INSERT INTO experiences(id,role,company,start_date,end_date,is_current,location,description,display_order,revision) VALUES (${id},${input.role},${input.company},${input.startDate},${input.isCurrent ? null : input.endDate || null},${!!input.isCurrent},${input.location || null},${input.description || null},${displayOrder},1)`);
    return id;
  });
}

export async function createOrderedService(input: ServiceInput, synchronization?: MutationTestSynchronization): Promise<string> {
  return withCmsTransaction(async (tx) => {
    const displayOrder = await allocateNextDisplayOrder(tx, "services", synchronization);
    const id = crypto.randomUUID();
    await tx.db.insert(sql`INSERT INTO services(id,name,description,icon,is_featured,is_active,display_order,revision) VALUES (${id},${input.name},${input.description || null},${input.icon},${!!input.isFeatured},${input.isActive ?? true},${displayOrder},1)`);
    return id;
  });
}

export async function updateExperienceRevision(id: string, expectedRevision: number, input: ExperienceInput, synchronization?: MutationTestSynchronization): Promise<number> {
  return withCmsTransaction(async (tx) => {
    await synchronizeMutationTest(tx, synchronization);
    const result = await tx.db.update<{ revision: number }>(sql`UPDATE experiences SET role=${input.role},company=${input.company},start_date=${input.startDate},end_date=${input.isCurrent ? null : input.endDate || null},is_current=${!!input.isCurrent},location=${input.location || null},description=${input.description || null},revision=revision+1 WHERE id=${id} AND revision=${expectedRevision} RETURNING revision`);
    if (result.rows[0]) return result.rows[0].revision;
    const exists = await tx.db.select(sql`SELECT 1 FROM experiences WHERE id=${id}`);
    if (!exists.rows[0]) throw new ContentNotFoundError();
    throw new StaleRevisionError();
  });
}

export async function updateServiceRevision(id: string, expectedRevision: number, input: ServiceInput, synchronization?: MutationTestSynchronization): Promise<number> {
  return withCmsTransaction(async (tx) => {
    await synchronizeMutationTest(tx, synchronization);
    const result = await tx.db.update<{ revision: number }>(sql`UPDATE services SET name=${input.name},description=${input.description || null},icon=${input.icon},is_featured=${!!input.isFeatured},is_active=${input.isActive ?? true},revision=revision+1 WHERE id=${id} AND revision=${expectedRevision} RETURNING revision`);
    if (result.rows[0]) return result.rows[0].revision;
    const exists = await tx.db.select(sql`SELECT 1 FROM services WHERE id=${id}`);
    if (!exists.rows[0]) throw new ContentNotFoundError();
    throw new StaleRevisionError();
  });
}

export async function createTestimonialRecord(input: TestimonialInput): Promise<string> {
  const id = crypto.randomUUID();
  await withCmsTransaction(async (tx) => { await tx.db.insert(sql`INSERT INTO testimonials(id,client_name,designation,company,testimonial_text,rating,is_featured,status,revision) VALUES (${id},${input.clientName},${input.designation || null},${input.company || null},${input.testimonialText},${input.rating},${!!input.isFeatured},${input.status},1)`); });
  return id;
}

export async function updateTestimonialRevision(id: string, expectedRevision: number, input: TestimonialInput, synchronization?: MutationTestSynchronization): Promise<number> {
  return withCmsTransaction(async (tx) => {
    await synchronizeMutationTest(tx, synchronization);
    const result = await tx.db.update<{ revision: number }>(sql`UPDATE testimonials SET client_name=${input.clientName},designation=${input.designation || null},company=${input.company || null},testimonial_text=${input.testimonialText},rating=${input.rating},is_featured=${!!input.isFeatured},status=${input.status},revision=revision+1 WHERE id=${id} AND revision=${expectedRevision} RETURNING revision`);
    if (result.rows[0]) return result.rows[0].revision;
    const exists = await tx.db.select(sql`SELECT 1 FROM testimonials WHERE id=${id}`);
    if (!exists.rows[0]) throw new ContentNotFoundError();
    throw new StaleRevisionError();
  });
}

export async function updateMessageStatusRevision(id: string, expectedRevision: number, status: MessageStatus, synchronization?: MutationTestSynchronization): Promise<number> {
  return withCmsTransaction(async (tx) => {
    await synchronizeMutationTest(tx, synchronization);
    const result = await tx.db.update<{ revision: number }>(sql`UPDATE contact_messages SET status=${status},revision=revision+1 WHERE id=${id} AND revision=${expectedRevision} RETURNING revision`);
    if (result.rows[0]) return result.rows[0].revision;
    const exists = await tx.db.select(sql`SELECT 1 FROM contact_messages WHERE id=${id}`);
    if (!exists.rows[0]) throw new ContentNotFoundError();
    throw new StaleRevisionError();
  });
}
