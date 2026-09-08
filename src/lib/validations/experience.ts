import { z } from "zod";
import { formDataCheckboxSchema } from "./booleans";
import { experienceDateRangeSchema, experienceYearSchema } from "./experience-dates";

const optionalExperienceYearSchema = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? null : value,
  experienceYearSchema.nullable().optional()
);

const experienceFormSchema = z.object({
  role: z.string().trim().min(1, "Role is required").max(160),
  company: z.string().trim().min(1, "Company is required").max(160),
  startDate: experienceYearSchema,
  endDate: optionalExperienceYearSchema,
  isCurrent: formDataCheckboxSchema,
  location: z.string().trim().max(160).optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const experienceSchema = experienceFormSchema.superRefine((value, context) => {
  const range = experienceDateRangeSchema.safeParse(value);
  if (!range.success) {
    for (const issue of range.error.issues) {
      context.addIssue({ code: "custom", path: issue.path, message: issue.message });
    }
  }
});

export type ExperienceInput = z.infer<typeof experienceSchema>;
