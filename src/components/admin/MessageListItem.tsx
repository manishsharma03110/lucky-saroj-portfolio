"use client";

import { useRef, useState, useTransition } from "react";
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
  // A refreshed server snapshot owns both status and revision. Remounting also
  // prevents an older in-flight response from overwriting the new snapshot.
  return <MessageStatusItem key={`${message.id}:${message.revision}:${message.status}`} message={message} />;
}

function MessageStatusItem({ message }: { message: ContactMessage }) {
  const [pending, startTransition] = useTransition();
  const inFlight = useRef(false);
  const [revision, setRevision] = useState(message.revision);
  const [status, setStatus] = useState(message.status);
  const [error, setError] = useState<string>();

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-semibold text-[var(--color-ink)]">{message.name}</h3>
          <p className="text-xs text-[var(--color-muted)]">{message.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            disabled={pending}
            onChange={(e) => {
              if (inFlight.current) return;
              const nextStatus = e.target.value as "new" | "read" | "replied" | "archived";
              inFlight.current = true;
              setError(undefined);
              startTransition(async () => {
                try {
                  const result = await updateMessageStatus(message.id, revision, nextStatus);
                  if (result.status === "success") { setStatus(nextStatus); setRevision(result.revision); }
                  else setError(result.message);
                } catch {
                  setError("Unable to update message status. Reload before retrying.");
                } finally {
                  inFlight.current = false;
                }
              });
            }}
            className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
          >
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
          <fieldset disabled={pending}>
            <DeleteButton confirmText={`Delete message from ${message.name}?`} onDelete={() => deleteMessage(message.id)} />
          </fieldset>
        </div>
      </div>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      {(message.projectType || message.videoType || message.budgetRange || message.projectTimeline) && (
        <p className="mb-2 text-xs text-[var(--color-muted)]">
          {[message.projectType, message.videoType, message.budgetRange, message.projectTimeline].filter(Boolean).join(" · ")}
        </p>
      )}
      {message.referenceUrl && <a href={message.referenceUrl} target="_blank" rel="noreferrer" className="mb-2 block break-all text-xs text-[var(--color-accent)] underline">Reference link</a>}
      <p className="text-sm text-[var(--color-ink-soft)]">{message.message}</p>
    </div>
  );
}
