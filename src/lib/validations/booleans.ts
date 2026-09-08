import { z } from "zod";

export const strictBooleanSchema = z.boolean({ error: "Expected a boolean value." });
export const formDataCheckboxSchema = z.union([z.literal("on"), z.null(), z.undefined()]).transform((value) => value === "on");
