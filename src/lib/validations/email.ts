import { z } from "zod";

export const CONTACT_EMAIL_MAX_LENGTH = 254;
export const boundedContactEmailSchema = z.string().trim().min(1, "Email is required.").max(CONTACT_EMAIL_MAX_LENGTH, "Email is too long.").email("Please enter a valid email address.");
export const boundedLoginIdentifierSchema = z.string().trim().min(1, "Email or username is required.").max(CONTACT_EMAIL_MAX_LENGTH, "Email or username is too long.");
