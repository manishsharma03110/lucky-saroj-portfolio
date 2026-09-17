"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { UploadCloud, X, Loader2, Play } from "lucide-react";
import { Input, Label } from "@/components/ui/Input";
import { getUploadAcceptValue, validateUploadFilePolicy } from "@/lib/media/upload-policy";
import { useUploadActivity } from "./MediaForm";
import styles from "./AdminEditorial.module.css";

type UploadInitiation = { assetId: string; pathname: string; kind: "image" | "video" };
type ImageUploadResult = { assetId: string; pathname: string; kind: "image"; url: string };

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

export function FileUpload({
  name,
  assetIdName,
  label,
  kind,
  defaultValue,
  defaultAssetId,
  requiredAspectRatio,
}: {
  name: string;
  assetIdName: string;
  label: string;
  kind: "image" | "video";
  defaultValue?: string | null;
  defaultAssetId?: string | null;
  requiredAspectRatio?: { width: number; height: number; label: string };
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
      setError(policy.reason === "invalid_type" ? `Unsupported ${kind} format.` : `${kind === "image" ? "Image" : "Video"} file is too large or empty.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (kind === "image" && requiredAspectRatio) {
      try {
        const dimensions = await readImageDimensions(file);
        if (dimensions.width * requiredAspectRatio.height !== dimensions.height * requiredAspectRatio.width) {
          setError(`Upload blocked: Project Banner must be exactly ${requiredAspectRatio.label}. Selected image is ${dimensions.width}×${dimensions.height}px.`);
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
        if (!result.assetId || !result.pathname || !result.url || result.kind !== "image") throw new Error("Invalid compressed image upload response.");
        setProgress(100); setAssetId(result.assetId); setUrl(result.url); return;
      }
      const initiationResponse = await fetch("/api/upload/initiate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind, originalFilename: file.name, contentType: file.type, size: file.size }) });
      if (!initiationResponse.ok) throw new Error("Upload initiation failed.");
      const initiation = (await initiationResponse.json()) as UploadInitiation;
      if (!initiation.assetId || !initiation.pathname || initiation.kind !== kind) throw new Error("Invalid upload initiation.");
      const result = await upload(initiation.pathname, file, { access: "public", handleUploadUrl: "/api/upload", contentType: file.type, clientPayload: JSON.stringify({ assetId: initiation.assetId, kind }), onUploadProgress: ({ percentage }) => setProgress(percentage) });
      if (result.pathname !== initiation.pathname) throw new Error("Upload identity mismatch.");
      setAssetId(initiation.assetId); setUrl(result.url);
    } catch { setError("Upload failed. Please try again."); }
    finally { setUploading(false); reportUpload(false); }
  }

  return <div><Label>{label}</Label><input type="hidden" name={name} value={url}/><input type="hidden" name={assetIdName} value={assetId}/>
    {requiredAspectRatio && kind === "image" && <p className="mb-3 mt-1 text-xs text-[var(--text-muted)]">Required: {requiredAspectRatio.label} aspect ratio. Recommended 1920×1080 px. Other ratios are blocked before upload.</p>}
    {url ? <div className={styles.mediaPreview}>{kind === "image" ? <img src={url} alt=""/> : <video src={url} muted playsInline><track kind="captions"/></video>}<div className={styles.previewOverlay}>{kind === "video" && <Play size={22}/>}</div><button type="button" onClick={()=>{setUrl("");setAssetId("");if(inputRef.current)inputRef.current.value=""}} className={styles.removeMedia} aria-label="Remove"><X size={15}/></button></div> : <button type="button" onClick={()=>inputRef.current?.click()} disabled={uploading} className={styles.uploadZone}>{uploading?<><Loader2 size={21} className="animate-spin"/><span>{kind === "image" ? "Optimizing & uploading" : "Uploading"}… {progress}%</span></>:<><UploadCloud size={21}/><span>Click to upload {kind === "image" ? "an image" : "a video"}</span></>}</button>}
    <input ref={inputRef} type="file" accept={getUploadAcceptValue(kind)} className="hidden" onChange={event=>handleFile(event.target.files?.[0])}/>
    {kind === "video" && <div className="mt-4"><Label htmlFor="externalVideoUrl">Or paste a YouTube / Vimeo link</Label><Input id="externalVideoUrl" name="externalVideoUrl" placeholder="https://youtube.com/watch?v=..." value={assetId || url.includes("blob.vercel-storage.com") ? "" : url} onChange={event=>{setUrl(event.target.value);setAssetId("")}}/></div>}
    {error&&<p className={styles.uploadError}>{error}</p>}
  </div>;
}
