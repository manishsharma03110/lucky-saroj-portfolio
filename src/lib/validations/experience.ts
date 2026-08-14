import { z } from "zod";

export const experienceSchema = z.object({
  role: z.string().trim().min(1, "Role is required").max(160),
  company: z.string().trim().min(1, "Company is required").max(160),
  startDate: z.string().trim().min(1, "Start date is required").max(40),
  endDate: z.string().trim().max(40).optional().or(z.literal("")),
  isCurrent: z.coerce.boolean().optional(),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type ExperienceInput = z.infer<typeof experienceSchema>;
