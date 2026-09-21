import { z } from "zod";
import { ROLE_KEYS } from "./permissions";

// bcrypt ignores bytes beyond 72. Reject rather than silently truncate.
export const newPasswordSchema = z.string().min(12).max(72)
  .refine(value => new TextEncoder().encode(value).length <= 72, "Password must be at most 72 UTF-8 bytes.");
export const createAdminSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  password: newPasswordSchema,
  role: z.enum(ROLE_KEYS),
});
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(1024),
  newPassword: newPasswordSchema,
  confirmPassword: z.string(),
}).refine(value => value.newPassword === value.confirmPassword, "Passwords must match.");
export const adminTargetSchema = z.string().uuid();
