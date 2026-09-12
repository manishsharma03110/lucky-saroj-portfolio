"use client";

import { useRef, useState, useTransition } from "react";
import {
  BriefcaseBusiness,
  CalendarClock,
  Clock3,
  ExternalLink,
  Mail,
  MessageSquareText,
  Phone,
  Video,
  WalletCards,
} from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { updateMessageStatus, deleteMessage } from "@/lib/actions/messages";
import type { schema } from "@/lib/db";
import styles from "./MessageListItem.module.css";

type ContactMessage = typeof schema.contactMessages.$inferSelect;
type MessageStatus = "new" | "read" | "replied" | "archived";

type DetailItem = {
  label: string;
  value: string | null;
  icon: typeof BriefcaseBusiness;
};

const STATUS_CLASS: Record<MessageStatus, string> = {
  new: styles.statusNew,
  read: styles.statusRead,
  replied: styles.statusReplied,
  archived: styles.statusArchived,
};

const STATUS_LABEL: Record<MessageStatus, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
};

function formatSubmittedAt(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

export function MessageListItem({ message }: { message: ContactMessage }) {
  return <MessageStatusItem key={`${message.id}:${message.revision}:${message.status}`} message={message} />;
}

function MessageStatusItem({ message }: { message: ContactMessage }) {
  const [pending, startTransition] = useTransition();
  const inFlight = useRef(false);
  const [revision, setRevision] = useState(message.revision);
  const [status, setStatus] = useState(message.status as MessageStatus);
  const [error, setError] = useState<string>();

  const details: DetailItem[] = [
    { label: "Project type", value: message.projectType, icon: BriefcaseBusiness },
    { label: "Video type", value: message.videoType, icon: Video },
    { label: "Budget", value: message.budgetRange, icon: WalletCards },
    { label: "Timeline", value: message.projectTimeline, icon: CalendarClock },
  ];

  return (
    <article className={`${styles.messageCard} ${styles[`card${status[0].toUpperCase()}${status.slice(1)}`]}`}>
      <div className={styles.topBar}>
        <div className={styles.identityBlock}>
          <div className={styles.identityHeading}>
            <h3>{message.name}</h3>
            <span className={`${styles.statusBadge} ${STATUS_CLASS[status]}`}>{STATUS_LABEL[status]}</span>
          </div>
          <div className={styles.submittedAt}>
            <Clock3 size={14} aria-hidden="true" />
            <span>Submitted {formatSubmittedAt(message.createdAt)} IST</span>
          </div>
        </div>

        <div className={styles.cardActions}>
          <label className={styles.statusControl}>
            <span className="sr-only">Status for message from {message.name}</span>
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
              className={styles.statusSelect}
            >
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <fieldset disabled={pending} className={styles.deleteFieldset}>
            <DeleteButton confirmText={`Delete message from ${message.name}?`} onDelete={() => deleteMessage(message.id)} />
          </fieldset>
        </div>
      </div>

      {error && <p className={styles.feedbackError}>{error}</p>}

      <section className={styles.contactGrid} aria-label="Contact details">
        <a className={styles.contactCard} href={`mailto:${message.email}`}>
          <span className={styles.iconBox}><Mail size={17} aria-hidden="true" /></span>
          <span className={styles.contactText}><small>Email</small><strong>{message.email}</strong></span>
        </a>
        {message.phone ? (
          <a className={styles.contactCard} href={phoneHref(message.phone)}>
            <span className={styles.iconBox}><Phone size={17} aria-hidden="true" /></span>
            <span className={styles.contactText}><small>Phone</small><strong>{message.phone}</strong></span>
          </a>
        ) : (
          <div className={`${styles.contactCard} ${styles.mutedCard}`}>
            <span className={styles.iconBox}><Phone size={17} aria-hidden="true" /></span>
            <span className={styles.contactText}><small>Phone</small><strong>Not provided</strong></span>
          </div>
        )}
      </section>

      <section className={styles.detailGrid} aria-label="Project details">
        {details.map(({ label, value, icon: Icon }) => (
          <div className={styles.detailCard} key={label}>
            <div className={styles.detailLabel}><Icon size={15} aria-hidden="true" /><span>{label}</span></div>
            <p>{value || "Not provided"}</p>
          </div>
        ))}
      </section>

      {message.referenceUrl && (
        <a href={message.referenceUrl} target="_blank" rel="noreferrer" className={styles.referenceCard}>
          <span className={styles.iconBox}><ExternalLink size={17} aria-hidden="true" /></span>
          <span className={styles.referenceText}><small>Reference</small><strong>{message.referenceUrl}</strong></span>
          <ExternalLink size={15} className={styles.referenceArrow} aria-hidden="true" />
        </a>
      )}

      <section className={styles.messageSection} aria-label="Client message">
        <div className={styles.messageHeading}><MessageSquareText size={17} aria-hidden="true" /><span>Message</span></div>
        <p className={styles.messageBody}>{message.message}</p>
      </section>
    </article>
  );
}
