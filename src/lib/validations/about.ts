import { z } from "zod";

export const aboutProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  headline: z.string().trim().max(200).optional().or(z.literal("")),
  biography: z.string().trim().max(3000).optional().or(z.literal("")),
  yearsExperience: z.coerce.number().int().min(0).max(80),
  projectsCompleted: z.coerce.number().int().min(0).max(100000),
  clientCount: z.coerce.number().int().min(0).max(100000),
  viewsGenerated: z.string().trim().max(40),
  skills: z.string().trim().max(1000).optional().or(z.literal("")), // comma separated
  tools: z.string().trim().max(1000).optional().or(z.literal("")), // comma separated
});

export type AboutProfileInput = z.infer<typeof aboutProfileSchema>;
