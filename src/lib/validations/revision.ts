import { z } from "zod";

export const revisionSchema = z.coerce.number().int().min(1);
