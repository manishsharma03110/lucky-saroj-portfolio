"use client";

import { useRef, useState, useTransition } from "react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { updateMessageStatus, deleteMessage } from "@/lib/actions/messages";
import type { schema } from "@/lib/db";
import styles from "./AdminEditorial.module.css";

type ContactMessage = typeof schema.contactMessages.$inferSelect;

type MessageStatus = "new" | "read" | "replied" | "archived";

const STATUS_CLASS: Record<MessageStatus, string> = {
  new: styles.statusNew,
  read: styles.statusRead,
  replied: styles.statusReplied,
  archived: styles.statusArchived,
};

export function MessageListItem({ message }: { message: ContactMessage }) {
  return <MessageStatusItem key={`${message.id}:${message.revision}:${message.status}`} message={message} />;
}

function MessageStatusItem({ message }: { message: ContactMessage }) {
  const [pending, startTransition] = useTransition();
  const inFlight = useRef(false);
  const [revision, setRevision] = useState(message.revision);
  const [status, setStatus] = useState(message.status as MessageStatus);
  const [error, setError] = useState<string>();

  return (
    <article className={styles.messageCard}>
      <div className={styles.cardHeader}>
        <div className={styles.identity}>
          <h3>{message.name}</h3>
          <p>{message.email}</p>
        </div>

        <div className={styles.cardActions}>
          <select
            aria-label={`Status for message from ${message.name}`}
            value={status}
            disabled={pending}
            onChange={(event) => {
              if (inFlight.current) return;
              const nextStatus = event.target.value as MessageStatus;
              inFlight.current = true;
              setError(undefined);
              startTransition(async () => {
                try {
                  const result = await updateMessageStatus(message.id, revision, nextStatus);
                  if (result.status === "success") {
                    setStatus(nextStatus);
                    setRevision(result.revision);
                  } else {
                    setError(result.message);
                  }
                } catch {
                  setError("Unable to update message status. Reload before retrying.");
                } finally {
                  inFlight.current = false;
                }
              });
            }}
            className={`${styles.statusSelect} ${STATUS_CLASS[status]}`}
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

      {error && <p className={styles.feedbackError}>{error}</p>}

      {(message.projectType || message.videoType || message.budgetRange || message.projectTimeline) && (
        <p className={styles.metaLine}>
          {[message.projectType, message.videoType, message.budgetRange, message.projectTimeline].filter(Boolean).join(" · ")}
        </p>
      )}

      {message.referenceUrl && (
        <a href={message.referenceUrl} target="_blank" rel="noreferrer" className={styles.referenceLink}>
          Open reference link ↗
        </a>
      )}

      <p className={styles.messageBody}>{message.message}</p>
    </article>
  );
}
