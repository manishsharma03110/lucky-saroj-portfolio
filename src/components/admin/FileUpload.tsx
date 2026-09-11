"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { UploadCloud, X, Loader2, Play } from "lucide-react";
import { Input, Label } from "@/components/ui/Input";
import { getUploadAcceptValue, validateUploadFilePolicy } from "@/lib/media/upload-policy";
import { useUploadActivity } from "./MediaForm";
import styles from "./AdminEditorial.module.css";

type UploadInitiation = { assetId: string; pathname: string; kind: "image" | "video" };

export function FileUpload({
  name,
  assetIdName,
  label,
  kind,
  defaultValue,
  defaultAssetId,
}: {
  name: string;
  assetIdName: string;
  label: string;
  kind: "image" | "video";
  defaultValue?: string | null;
  defaultAssetId?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const reportUpload = useUploadActivity();
  const [url, setUrl] = useState(defaultValue ?? "");
  const [assetId, setAssetId] = useState(defaultAssetId ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    const policy = validateUploadFilePolicy({ kind, contentType: file.type, size: file.size });
    if (!policy.ok) {
      setError(
        policy.reason === "invalid_type"
          ? `Unsupported ${kind} format.`
          : `${kind === "image" ? "Image" : "Video"} file is too large or empty.`
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    reportUpload(true);
    setProgress(0);
    try {
      const initiationResponse = await fetch("/api/upload/initiate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, originalFilename: file.name, contentType: file.type, size: file.size }),
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

  return (
    <div>
      <Label>{label}</Label>
      <input type="hidden" name={name} value={url} />
      <input type="hidden" name={assetIdName} value={assetId} />

      {url ? (
        <div className={styles.mediaPreview}>
          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" />
          ) : (
            <video src={url} muted playsInline>
              <track kind="captions" />
            </video>
          )}
          <div className={styles.previewOverlay}>{kind === "video" && <Play size={22} />}</div>
          <button
            type="button"
            onClick={() => {
              setUrl("");
              setAssetId("");
              if (inputRef.current) inputRef.current.value = "";
            }}
            className={styles.removeMedia}
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
              <span>Uploading… {progress}%</span>
            </>
          ) : (
            <>
              <UploadCloud size={21} />
              <span>Click to upload {kind === "image" ? "an image" : "a video"}</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={getUploadAcceptValue(kind)}
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {kind === "video" && (
        <div className="mt-4">
          <Label htmlFor="externalVideoUrl">Or paste a YouTube / Vimeo link</Label>
          <Input
            id="externalVideoUrl"
            name="externalVideoUrl"
            placeholder="https://youtube.com/watch?v=..."
            value={assetId || url.includes("blob.vercel-storage.com") ? "" : url}
            onChange={(event) => {
              setUrl(event.target.value);
              setAssetId("");
            }}
          />
        </div>
      )}

      {error && <p className={styles.uploadError}>{error}</p>}
    </div>
  );
}
