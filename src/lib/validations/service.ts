import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  icon: z.string().trim().min(1, "Icon is required").max(60),
  isFeatured: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
