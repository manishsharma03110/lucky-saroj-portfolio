import { z } from "zod";
import { strictBooleanSchema } from "./booleans";

export const EXPERIENCE_YEAR_MINIMUM = 1900;
export const EXPERIENCE_YEAR_MAXIMUM = 2100;
export const experienceYearSchema = z.string().trim().regex(/^\d{4}$/, "Use a four-digit year.").refine((value) => {
  const year = Number(value);
  return year >= EXPERIENCE_YEAR_MINIMUM && year <= EXPERIENCE_YEAR_MAXIMUM;
}, `Year must be between ${EXPERIENCE_YEAR_MINIMUM} and ${EXPERIENCE_YEAR_MAXIMUM}.`);

const optionalExperienceYearSchema = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? null : value,
  experienceYearSchema.nullable().optional()
);

export const experienceDateRangeSchema = z.object({ startDate: experienceYearSchema, endDate: optionalExperienceYearSchema, isCurrent: strictBooleanSchema }).superRefine((value, context) => {
  if (value.isCurrent && value.endDate) {
    context.addIssue({ code: "custom", path: ["endDate"], message: "Current experience must not have an end year." });
  } else if (!value.isCurrent && value.endDate && Number(value.endDate) < Number(value.startDate)) {
    context.addIssue({ code: "custom", path: ["endDate"], message: "End year must not precede start year." });
  }
});
