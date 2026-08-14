"use client";

import { useState, useTransition } from "react";
import { toggleProjectFeatured, deleteProject } from "@/lib/actions/portfolio";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { cn } from "@/lib/utils/cn";

export function PortfolioRowActions({ id, isFeatured }: { id: string; isFeatured: boolean }) {
  const [featured, setFeatured] = useState(isFeatured);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={featured}
      disabled={pending}
      onClick={() => {
        const next = !featured;
        setFeatured(next);
        startTransition(() => toggleProjectFeatured(id, next));
      }}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50",
        featured ? "bg-[var(--color-accent)]" : "bg-neutral-200"
      )}
    >
      <span
        className={cn(
          "inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform",
          featured ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

export function DeleteProjectButton({ id, title }: { id: string; title: string }) {
  return (
    <DeleteButton
      confirmText={`Delete "${title}"? This cannot be undone.`}
      onDelete={() => deleteProject(id)}
    />
  );
}
