export const ALLOWED_IMAGE_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const ALLOWED_VIDEO_UPLOAD_TYPES = [
  "video/mp4",
  "video/webm",
] as const;

export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_UPLOAD_BYTES = 25 * 1024 * 1024;

export type UploadMediaKind = "image" | "video";

const VIDEO_FILE_EXTENSION = /\.(?:mp4|webm)$/i;

export function getAllowedUploadContentTypes(kind: UploadMediaKind): readonly string[] {
  return kind === "video" ? ALLOWED_VIDEO_UPLOAD_TYPES : ALLOWED_IMAGE_UPLOAD_TYPES;
}

export function getMaximumUploadSize(kind: UploadMediaKind): number {
  return kind === "video" ? MAX_VIDEO_UPLOAD_BYTES : MAX_IMAGE_UPLOAD_BYTES;
}

export function getUploadAcceptValue(kind: UploadMediaKind): string {
  if (kind === "video") return ".mp4,.webm,video/mp4,video/webm";
  return getAllowedUploadContentTypes(kind).join(",");
}

export function validateUploadFilePolicy(input: {
  kind: UploadMediaKind;
  contentType: unknown;
  size: unknown;
  originalFilename?: unknown;
}): { ok: true } | { ok: false; reason: "invalid_type" | "invalid_size" } {
  if (
    typeof input.contentType !== "string" ||
    !getAllowedUploadContentTypes(input.kind).includes(input.contentType)
  ) {
    return { ok: false, reason: "invalid_type" };
  }

  if (
    input.kind === "video" &&
    typeof input.originalFilename === "string" &&
    !VIDEO_FILE_EXTENSION.test(input.originalFilename.trim())
  ) {
    return { ok: false, reason: "invalid_type" };
  }

  if (
    typeof input.size !== "number" ||
    !Number.isSafeInteger(input.size) ||
    input.size <= 0 ||
    input.size > getMaximumUploadSize(input.kind)
  ) {
    return { ok: false, reason: "invalid_size" };
  }

  return { ok: true };
}
