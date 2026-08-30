import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().max(20).refine((value) => !value || value.replace(/\D/g, "").length >= 10, "Please enter a valid phone number"),
  projectType: z.string().trim().min(1, "Please select a project category").max(120),
  budgetRange: z.string().trim().min(1, "Please select a budget range").max(120),
  videoType: z.string().trim().min(1, "Please select a video type").max(120),
  projectTimeline: z.string().trim().max(120).optional().or(z.literal("")),
  referenceUrl: z.string().trim().url("Please enter a valid reference URL").max(500).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell me a bit more about your project").max(4000),
});

export type ContactInput = z.infer<typeof contactSchema>;
