import { z } from "zod";
import { formDataCheckboxSchema } from "./booleans";

export const serviceSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  icon: z.string().trim().min(1, "Icon is required").max(60),
  isFeatured: formDataCheckboxSchema,
  isActive: formDataCheckboxSchema,
});

export type ServiceInput = z.infer<typeof serviceSchema>;
