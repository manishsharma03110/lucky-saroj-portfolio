import { z } from "zod";

export const URL_MAX_LENGTH = 2048;
const unsafeControlCharacters = /[\u0000-\u001f\u007f]/;
const encodedPathSeparator = /%(?:2f|5c)/i;
const malformedPercentEncoding = /%(?![0-9a-f]{2})/i;
const encodedOctet = /%[0-9a-f]{2}/i;

function isSecureExternalUrl(value: string): boolean {
  if (unsafeControlCharacters.test(value) || malformedPercentEncoding.test(value) || value.includes("\\") || value.startsWith("//")) return false;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

export const externalWebUrlSchema = z.string().trim().min(1, "External URL is required.").max(URL_MAX_LENGTH, "External URL is too long.").refine(isSecureExternalUrl, "Enter an absolute HTTPS URL.");

function isApprovedInternalMediaPath(value: string): boolean {
  if (!value.startsWith("/uploads/") || value.length === "/uploads/".length || value.includes("//")) return false;
  if (unsafeControlCharacters.test(value) || malformedPercentEncoding.test(value) || value.includes("\\") || value.includes("?") || value.includes("#")) return false;
  if (encodedPathSeparator.test(value)) return false;
  try {
    const decoded = decodeURIComponent(value);
    if (unsafeControlCharacters.test(decoded) || malformedPercentEncoding.test(decoded) || encodedOctet.test(decoded)) return false;
    return decoded.split("/").slice(1).every((segment) => segment.trim().length > 0 && segment !== "." && segment !== "..");
  } catch { return false; }
}

export const internalMediaPathSchema = z.string().trim().min(1, "Media path is required.").max(URL_MAX_LENGTH, "Media path is too long.").refine(isApprovedInternalMediaPath, "Enter an approved /uploads/ media path.");
export const mediaReferenceSchema = z.union([internalMediaPathSchema, externalWebUrlSchema]);
