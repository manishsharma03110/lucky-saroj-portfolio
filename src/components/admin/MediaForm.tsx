"use client";

import { createContext, useCallback, useContext, useRef, useState, type ComponentProps } from "react";

const UploadActivity = createContext<(active: boolean) => void>(() => {});

export function useUploadActivity() {
  return useContext(UploadActivity);
}

export function MediaForm({ children, onSubmitCapture, ...props }: ComponentProps<"form">) {
  const activeUploads = useRef(0);
  const [uploading, setUploading] = useState(false);
  const reportUpload = useCallback((active: boolean) => {
    activeUploads.current += active ? 1 : -1;
    setUploading(activeUploads.current > 0);
  }, []);

  return (
    <UploadActivity.Provider value={reportUpload}>
      <form {...props} onSubmitCapture={(event) => {
        if (activeUploads.current > 0) {
          event.preventDefault();
          return;
        }
        onSubmitCapture?.(event);
      }}>
        <fieldset disabled={uploading} className="min-w-0 space-y-6">
          {children}
        </fieldset>
        {uploading && <p role="status" className="mt-3 text-sm text-[var(--color-muted)]">Wait for the upload to finish before saving.</p>}
      </form>
    </UploadActivity.Provider>
  );
}
