import { getYouTubeEmbedUrl, getYouTubeVideoId } from "@/lib/media/youtube";

export type VideoSource =
  | { provider: "youtube"; embedUrl: string }
  | { provider: "google-drive"; embedUrl: string }
  | { provider: "direct"; mediaUrl: string };

type GoogleDriveReference = {
  fileId: string;
  resourceKey: string | null;
};

const GOOGLE_DRIVE_FILE_ID = /^[A-Za-z0-9_-]{10,}$/;
const DIRECT_VIDEO_EXTENSION = /\.(?:mp4|webm)$/i;
const VERCEL_BLOB_VIDEO_PATH = /^\/cms-media\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/video$/i;

function isHttpUrl(url: URL) {
  return url.protocol === "http:" || url.protocol === "https:";
}

function isVercelBlobVideo(url: URL) {
  return url.hostname.toLowerCase().endsWith(".blob.vercel-storage.com") && VERCEL_BLOB_VIDEO_PATH.test(url.pathname);
}

export function getGoogleDriveReference(value: string | null | undefined): GoogleDriveReference | null {
  const input = value?.trim();
  if (!input) return null;

  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host !== "drive.google.com") return null;

    const pathMatch = url.pathname.match(/\/file\/(?:u\/\d+\/)?d\/([A-Za-z0-9_-]{10,})(?:\/|$)/);
    const queryId = ["/open", "/uc"].includes(url.pathname) ? url.searchParams.get("id") : null;
    const fileId = pathMatch?.[1] ?? queryId;

    if (!fileId || !GOOGLE_DRIVE_FILE_ID.test(fileId)) return null;

    return {
      fileId,
      resourceKey: url.searchParams.get("resourcekey"),
    };
  } catch {
    return null;
  }
}

export function getGoogleDrivePreviewUrl(value: string | null | undefined): string | null {
  const reference = getGoogleDriveReference(value);
  if (!reference) return null;

  const previewUrl = new URL(`https://drive.google.com/file/d/${reference.fileId}/preview`);
  if (reference.resourceKey) previewUrl.searchParams.set("resourcekey", reference.resourceKey);
  return previewUrl.toString();
}

export function getDirectVideoUrl(value: string | null | undefined): string | null {
  const input = value?.trim();
  if (!input) return null;

  if (input.startsWith("/")) {
    const pathname = input.split(/[?#]/, 1)[0];
    return DIRECT_VIDEO_EXTENSION.test(pathname) ? input : null;
  }

  try {
    const url = new URL(input);
    if (!isHttpUrl(url) || url.username || url.password) return null;
    return DIRECT_VIDEO_EXTENSION.test(url.pathname) || isVercelBlobVideo(url) ? input : null;
  } catch {
    return null;
  }
}

export function getVideoSource(value: string | null | undefined): VideoSource | null {
  const input = value?.trim();
  if (!input) return null;

  if (getYouTubeVideoId(input)) {
    const embedUrl = getYouTubeEmbedUrl(input);
    return embedUrl ? { provider: "youtube", embedUrl } : null;
  }

  const driveEmbedUrl = getGoogleDrivePreviewUrl(input);
  if (driveEmbedUrl) return { provider: "google-drive", embedUrl: driveEmbedUrl };

  const directUrl = getDirectVideoUrl(input);
  if (directUrl) return { provider: "direct", mediaUrl: directUrl };

  return null;
}

export function isGoogleDriveUrl(value: string | null | undefined): boolean {
  const input = value?.trim();
  if (!input) return false;
  try {
    return new URL(input).hostname.toLowerCase().replace(/^www\./, "") === "drive.google.com";
  } catch {
    return false;
  }
}
