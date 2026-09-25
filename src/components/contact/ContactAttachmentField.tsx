"use client";

import { useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";

export function ContactAttachmentField({ compact = false }: { compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { setError("Attachment must be 4 MB or smaller. Please choose a smaller file."); if (inputRef.current) inputRef.current.value = ""; return; }
    setBusy(true); setError("");
    try {
      const data = new FormData(); data.set("file", file);
      const response = await fetch("/api/contact/attachment", { method: "POST", body: data });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Upload failed.");
      setUrl(result.url); setName(file.name);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Upload failed."); }
    finally { setBusy(false); if (inputRef.current) inputRef.current.value = ""; }
  }
  return <div className={compact ? "space-y-1" : "space-y-2"}>
    <input type="hidden" name="referenceUrl" value={url} />
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,video/mp4" className="hidden" onChange={(event) => upload(event.target.files?.[0])} />
    {url ? <div className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-white/10 bg-[var(--surface-primary)] px-3 text-xs text-[var(--text-secondary)]"><span className="truncate">{name}</span><button type="button" onClick={() => { setUrl(""); setName(""); }} aria-label="Remove attachment" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X size={16} /></button></div> : <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-[var(--surface-primary)] px-4 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-white/20 hover:text-[var(--text-primary)] disabled:opacity-60"><Paperclip size={16} aria-hidden />{busy ? "Uploading attachment…" : "Attach JPG, PNG or MP4 (max 4 MB)"}</button>}
    <p className="text-xs leading-5 text-[var(--text-secondary)]">Anyone with the attachment link can view it. Please avoid sensitive information.</p>
    {error && <p className="text-xs text-[var(--error,#ef4444)]" role="alert">{error}</p>}
  </div>;
}

