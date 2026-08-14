"use client";

import { useTransition } from "react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { updateMessageStatus, deleteMessage } from "@/lib/actions/messages";
import type { schema } from "@/lib/db";

type ContactMessage = typeof schema.contactMessages.$inferSelect;

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  read: "bg-neutral-100 text-neutral-600",
  replied: "bg-emerald-100 text-emerald-700",
  archived: "bg-neutral-100 text-neutral-400",
};

export function MessageListItem({ message }: { message: ContactMessage }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-semibold text-[var(--color-ink)]">{message.name}</h3>
          <p className="text-xs text-[var(--color-muted)]">{message.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            defaultValue={message.status}
            disabled={pending}
            onChange={(e) =>
              startTransition(() =>
                updateMessageStatus(message.id, e.target.value as "new" | "read" | "replied" | "archived")
              )
            }
            className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[message.status]}`}
          >
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
          <DeleteButton confirmText={`Delete message from ${message.name}?`} onDelete={() => deleteMessage(message.id)} />
        </div>
      </div>
      {(message.projectType || message.budgetRange) && (
        <p className="mb-2 text-xs text-[var(--color-muted)]">
          {[message.projectType, message.budgetRange].filter(Boolean).join(" · ")}
        </p>
      )}
      <p className="text-sm text-[var(--color-ink-soft)]">{message.message}</p>
    </div>
  );
}
