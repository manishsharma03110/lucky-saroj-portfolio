"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export function DeleteButton({
  onDelete,
  confirmText = "Delete this item? This cannot be undone.",
}: {
  onDelete: () => Promise<void>;
  confirmText?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmText)) {
          startTransition(() => onDelete());
        }
      }}
      className="rounded-lg p-2 text-[var(--color-muted)] transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      aria-label="Delete"
    >
      <Trash2 size={15} />
    </button>
  );
}
