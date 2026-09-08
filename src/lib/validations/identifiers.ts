import { z } from "zod";

export const ENTITY_ID_MAX_LENGTH = 36;

export const entityIdSchema = z.string({ error: "Entity ID is required." }).trim().min(1, "Entity ID is required.").max(ENTITY_ID_MAX_LENGTH, "Entity ID is too long.").uuid("Entity ID must be a valid UUID.");

export const optionalEntityIdSchema = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? null : value,
  entityIdSchema.nullable().optional()
);
