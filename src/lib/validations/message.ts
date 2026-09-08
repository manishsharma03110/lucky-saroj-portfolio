import { z } from "zod";

export const messageStatusSchema = z.enum(["new", "read", "replied", "archived"]);
