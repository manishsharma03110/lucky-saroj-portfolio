import { z } from "zod";

export const showreelSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
  videoUrl: z.string().trim().max(500).optional().or(z.literal("")),
  duration: z.string().trim().max(20).optional().or(z.literal("")),
  isFeatured: z.coerce.boolean().optional(),
  status: z.enum(["draft", "published"]),
});

export type ShowreelInput = z.infer<typeof showreelSchema>;
