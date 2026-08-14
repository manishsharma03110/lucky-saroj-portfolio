import { z } from "zod";

export const testimonialSchema = z.object({
  clientName: z.string().trim().min(1, "Client name is required").max(120),
  designation: z.string().trim().max(120).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  testimonialText: z.string().trim().min(1, "Testimonial text is required").max(1000),
  rating: z.coerce.number().int().min(1).max(5),
  isFeatured: z.coerce.boolean().optional(),
  status: z.enum(["draft", "published"]),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
