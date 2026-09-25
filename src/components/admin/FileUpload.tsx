"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Link2, Loader2, Play, UploadCloud, X } from "lucide-react";
import { Input, Label } from "@/components/ui/Input";
import {
  getMaximumUploadSize,
  getUploadAcceptValue,
  validateUploadFilePolicy,
} from "@/lib/media/upload-policy";
import { getVideoSource } from "@/lib/media/video";
import { useUploadActivity } from "./MediaForm";
import styles from "./AdminEditorial.module.css";

type UploadInitiation = { assetId: string; pathname: string; kind: "image" | "video" };
type ImageUploadResult = { assetId: string; pathname: string; kind: "image"; url: string };
type DetectedVideoOrientation = "landscape" | "portrait";

const MAX_VIDEO_UPLOAD_MB = getMaximumUploadSize("video") / (1024 * 1024);

async function readImageDimensions(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Invalid image."));
      image.src = objectUrl;
    });
    return { width: image.naturalWidth, height: image.naturalHeight };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function readVideoOrientation(file: File): Promise<DetectedVideoOrientation> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Invalid video metadata."));
      video.src = objectUrl;
    });
    if (!video.videoWidth || !video.videoHeight) throw new Error("Missing video dimensions.");
    return video.videoHeight > video.videoWidth ? "portrait" : "landscape";
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function providerLabel(url: string) {
  const source = getVideoSource(url);
  if (!source) return "Video URL";
  if (source.provider === "youtube") return "YouTube URL";
  if (source.provider === "google-drive") return "Google Drive URL";
  if (source.provider === "pinterest") return "Pinterest URL";
  if (source.provider === "direct") return "Direct video URL";
  return "External video URL";
}

export function FileUpload({
  name,
  assetIdName,
  label,
  kind,
  defaultValue,
  defaultAssetId,
  requiredAspectRatio,
  onDetectedVideoOrientation,
}: {
  name: string;
  assetIdName: string;
  label: string;
  kind: "image" | "video";
  defaultValue?: string | null;
  defaultAssetId?: string | null;
  requiredAspectRatio?: { width: number; height: number; label: string; recommended?: string };
  onDetectedVideoOrientation?: (orientation: DetectedVideoOrientation) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const reportUpload = useUploadActivity();
  const [url, setUrl] = useState(defaultValue ?? "");
  const [assetId, setAssetId] = useState(defaultAssetId ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const videoSource = kind === "video" ? getVideoSource(url) : null;

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    const policy = validateUploadFilePolicy({
      kind,
      contentType: file.type,
      size: file.size,
      originalFilename: file.name,
    });

    if (!policy.ok) {
      setError(
        policy.reason === "invalid_type"
          ? kind === "video"
            ? "Upload blocked: only MP4 and WebM video files are allowed."
            : "Unsupported image format."
          : kind === "video"
            ? `Upload blocked: video must be between 1 byte and ${MAX_VIDEO_UPLOAD_MB} MB.`
            : "Upload blocked: image must be between 1 byte and 4 MB.",
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (kind === "video" && onDetectedVideoOrientation) {
      try {
        onDetectedVideoOrientation(await readVideoOrientation(file));
      } catch {
        setError("Upload blocked: video dimensions could not be verified.");
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
    }

    if (kind === "image" && requiredAspectRatio) {
      try {
        const dimensions = await readImageDimensions(file);
        if (dimensions.width * requiredAspectRatio.height !== dimensions.height * requiredAspectRatio.width) {
          setError(
            `Upload blocked: Project Banner must be exactly ${requiredAspectRatio.label}. Selected image is ${dimensions.width}×${dimensions.height}px.`,
          );
          if (inputRef.current) inputRef.current.value = "";
          return;
        }
      } catch {
        setError("Upload blocked: image dimensions could not be verified.");
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
    }

    setUploading(true);
    reportUpload(true);
    setProgress(0);

    try {
      if (kind === "image") {
        const form = new FormData();
        form.append("file", file);
        setProgress(20);
        const response = await fetch("/api/upload/image", { method: "POST", body: form });
        if (!response.ok) throw new Error("Compressed image upload failed.");
        const result = (await response.json()) as ImageUploadResult;
        if (!result.assetId || !result.pathname || !result.url || result.kind !== "image") {
          throw new Error("Invalid compressed image upload response.");
        }
        setProgress(100);
        setAssetId(result.assetId);
        setUrl(result.url);
        return;
      }

      const initiationResponse = await fetch("/api/upload/initiate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind,
          originalFilename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });
      if (!initiationResponse.ok) throw new Error("Upload initiation failed.");

      const initiation = (await initiationResponse.json()) as UploadInitiation;
      if (!initiation.assetId || !initiation.pathname || initiation.kind !== kind) {
        throw new Error("Invalid upload initiation.");
      }

      const result = await upload(initiation.pathname, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        contentType: file.type,
        clientPayload: JSON.stringify({ assetId: initiation.assetId, kind }),
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });

      if (result.pathname !== initiation.pathname) throw new Error("Upload identity mismatch.");
      setAssetId(initiation.assetId);
      setUrl(result.url);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      reportUpload(false);
    }
  }

  const externalVideoInputId = `${name}-external`;

  return (
    <div className={styles.uploadField}>
      <Label>{label}</Label>
      <input type="hidden" name={name} value={url} />
      <input type="hidden" name={assetIdName} value={assetId} />

      {requiredAspectRatio && kind === "image" && (
        <p className="mb-3 mt-1 text-xs text-[var(--text-readable, var(--text-muted))]">
          Required: {requiredAspectRatio.label} aspect ratio. Recommended {requiredAspectRatio.recommended ?? (requiredAspectRatio.width > requiredAspectRatio.height ? "1920×1080 px" : "1080×1920 px")}. Other ratios are blocked before upload. Uploaded images are compressed automatically.
        </p>
      )}

      {kind === "video" && (
        <p className="mb-3 mt-1 text-xs text-[var(--text-readable, var(--text-muted))]">
          Upload a compressed MP4/WebM up to {MAX_VIDEO_UPLOAD_MB} MB. Existing external videos remain available under Advanced / Legacy.
        </p>
      )}

      {url ? (
        <div className={styles.mediaPreview}>
          {kind === "image" ? (
            <img src={url} alt="" />
          ) : videoSource?.provider === "direct" ? (
            <video src={videoSource.mediaUrl} muted playsInline preload="metadata">
              <track kind="captions" />
            </video>
          ) : (
            <div className="flex h-full min-h-36 min-w-0 w-full items-center justify-center bg-[var(--surface-primary)] p-5 text-center">
              <div className="min-w-0 w-full max-w-full">
                <Link2 className="mx-auto mb-2 text-[var(--accent-primary)]" size={24} />
                <p className="text-sm font-semibold text-[var(--text-primary)]">{providerLabel(url)}</p>
                <p className="mt-1 truncate text-xs text-[var(--text-readable, var(--text-muted))]" title={url}>{url}</p>
              </div>
            </div>
          )}
          <div className={styles.previewOverlay}>{kind === "video" && <Play size={22} />}</div>
          <button
            type="button"
            onClick={() => {
              setUrl("");
              setAssetId("");
              setError(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className={styles.removeMedia}
            disabled={uploading}
            aria-label="Remove"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={styles.uploadZone}
        >
          {uploading ? (
            <>
              <Loader2 size={21} className="animate-spin" />
              <span>{kind === "image" ? "Optimizing & uploading" : "Uploading"}… {Math.round(progress)}%</span>
            </>
          ) : (
            <>
              <UploadCloud size={21} />
              <span>Click to upload {kind === "image" ? "an image" : "an MP4 / WebM video"}</span>
            </>
          )}
        </button>
      )}

      {url && (
        <button type="button" disabled={uploading} className="mt-3 rounded-md border border-white/20 px-4 py-2 text-sm"
          onClick={() => inputRef.current?.click()}>
          {uploading ? `Uploading… ${Math.round(progress)}%` : kind === "video" ? "Replace with MP4 / WebM upload" : "Replace image"}
        </button>
      )}
      <input
        aria-label={`Upload ${label}`}
        disabled={uploading}
        ref={inputRef}
        type="file"
        accept={getUploadAcceptValue(kind)}
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {kind === "video" && (
        <details className="min-w-0 max-w-full mt-4 rounded-md border border-white/10 p-3">
          <summary className="cursor-pointer text-sm font-medium">Advanced / Legacy video URL</summary>
          {url && !assetId && <p className="my-2 text-xs text-[var(--text-readable, var(--text-muted))]">Saved source: {providerLabel(url)}. It stays unchanged unless you replace it.</p>}
          <Label htmlFor={externalVideoInputId}>Or paste any video URL</Label>
          <Input
            id={externalVideoInputId}
            disabled={uploading}
            autoComplete="off"
            spellCheck={false}
            placeholder="Pinterest, YouTube, Google Drive, MP4/WebM, Vimeo, or another http(s) URL"
            value={assetId ? "" : url}
            onChange={(event) => {
              setUrl(event.target.value);
              setAssetId("");
              setError(null);
            }}
          />
          <p className="mt-1 text-xs text-[var(--text-readable, var(--text-muted))]">
            CMS accepts any valid http(s) URL. Known providers open inside the portfolio player when supported; other sites are saved safely and get an external-source fallback instead of blocking project save.
          </p>
        </details>
      )}

      {error && <p className={styles.uploadError}>{error}</p>}
    </div>
  );
}
