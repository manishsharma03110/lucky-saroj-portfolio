"use client";

import { useState, type ReactNode } from "react";

export function PageEditorTabs({ content, seo }: { content: ReactNode; seo: ReactNode }) {
  const [tab, setTab] = useState<"content" | "seo">("content");
  return (
    <div>
      <div role="tablist" aria-label="Page editor" className="mb-6 flex gap-2 border-b border-white/10">
        <button type="button" role="tab" aria-selected={tab === "content"} onClick={() => setTab("content")} className={`px-4 py-3 text-sm font-medium ${tab === "content" ? "border-b-2 border-[var(--accent-primary)] text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>Content</button>
        <button type="button" role="tab" aria-selected={tab === "seo"} onClick={() => setTab("seo")} className={`px-4 py-3 text-sm font-medium ${tab === "seo" ? "border-b-2 border-[var(--accent-primary)] text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>SEO Settings</button>
      </div>
      <div role="tabpanel" hidden={tab !== "content"}>{content}</div>
      <div role="tabpanel" hidden={tab !== "seo"}>{seo}</div>
    </div>
  );
}
