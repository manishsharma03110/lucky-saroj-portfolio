import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(20),
  projectType: z.string().trim().max(120).optional().or(z.literal("")),
  budgetRange: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell me a bit more about your project").max(4000),
});

export type ContactInput = z.infer<typeof contactSchema>;
