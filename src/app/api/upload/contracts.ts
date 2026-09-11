import { z } from "zod";
import { assetIdSchema, originalFilenameSchema, storageKeySchema } from "@/lib/media/ownership";
import { uploadKindSchema } from "@/lib/validations/upload";

export const uploadInitiationSchema = z.object({
  kind: uploadKindSchema,
  originalFilename: originalFilenameSchema,
  contentType: z.string().min(1).max(100),
  size: z.number().int().positive(),
}).strict();

export const uploadClientPayloadSchema = z.object({
  assetId: assetIdSchema,
  kind: uploadKindSchema,
}).strict();

export const uploadCompletionPayloadSchema = z.object({
  assetId: assetIdSchema,
  providerKey: storageKeySchema,
  kind: uploadKindSchema,
}).strict();

export type UploadCompletionPayload = z.infer<typeof uploadCompletionPayloadSchema>;
