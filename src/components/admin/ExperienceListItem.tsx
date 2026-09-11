"use client";

import { Pencil } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteExperience } from "@/lib/actions/experience";
import type { schema } from "@/lib/db";
import { ExperienceForm } from "./ExperienceForm";
import styles from "./AdminContent.module.css";

type Experience = typeof schema.experiences.$inferSelect;

export function ExperienceListItem({ experience }: { experience: Experience }) {
  return (
    <article className={styles.itemCard}>
      <div className={styles.itemTop}>
        <div className={styles.itemCopy}>
          <p className={styles.dateLabel}>
            {experience.startDate} — {experience.isCurrent ? "Present" : experience.endDate}
          </p>
          <h3>{experience.role}</h3>
          <p className={styles.company}>{experience.company}</p>
          {experience.description && <p>{experience.description}</p>}
          <div className={styles.itemMeta}>
            {experience.isCurrent && <span className={styles.currentBadge}>Current role</span>}
            {experience.location && <span className={styles.muted}>{experience.location}</span>}
          </div>
        </div>

        <div className={styles.itemActions}>
          <DeleteButton
            confirmText={`Delete "${experience.role}" at ${experience.company}?`}
            onDelete={() => deleteExperience(experience.id)}
          />
        </div>
      </div>

      <details className={styles.editDisclosure}>
        <summary>
          <Pencil size={13} />
          Edit experience
        </summary>
        <div className={styles.editBody}>
          <ExperienceForm experience={experience} />
        </div>
      </details>
    </article>
  );
}
