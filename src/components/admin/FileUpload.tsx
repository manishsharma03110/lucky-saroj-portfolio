"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { UploadCloud, X, Loader2, Play } from "lucide-react";
import { Label } from "@/components/ui/Input";

export function FileUpload({
  name,
  label,
  kind,
  defaultValue,
}: {
  name: string;
  label: string;
  kind: "image" | "video";
  defaultValue?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      const result = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        clientPayload: kind,
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });
      setUrl(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="relative overflow-hidden rounded-lg border border-[var(--color-line)] bg-black">
          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-40 w-full object-cover" />
          ) : (
            <video src={url} className="h-40 w-full object-cover" muted playsInline>
              <track kind="captions" />
            </video>
          )}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-opacity hover:bg-black/40 hover:opacity-100">
            {kind === "video" && <Play size={20} className="text-white" />}
          </div>
          <button
            type="button"
            onClick={() => {
              setUrl("");
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[var(--color-ink)] shadow"
            aria-label="Remove"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--color-line)] bg-white py-8 text-sm text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Uploading… {progress}%
            </>
          ) : (
            <>
              <UploadCloud size={20} />
              Click to upload {kind === "image" ? "an image" : "a video"}
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={kind === "image" ? "image/*" : "video/*"}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}