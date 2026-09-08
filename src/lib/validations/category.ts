import { z } from "zod";
import { categorySlugSchema } from "./slugs";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  slug: categorySlugSchema,
});

export type CategoryInput = z.infer<typeof categorySchema>;
