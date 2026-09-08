import { z } from "zod";

export const UPLOAD_KINDS = ["image", "video"] as const;
export const uploadKindSchema = z.enum(UPLOAD_KINDS);
