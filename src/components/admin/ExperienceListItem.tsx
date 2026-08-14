"use client";

import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteExperience } from "@/lib/actions/experience";
import type { schema } from "@/lib/db";

type Experience = typeof schema.experiences.$inferSelect;

export function ExperienceListItem({ experience }: { experience: Experience }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-[var(--color-line)] bg-white p-5">
      <div>
        <p className="timecode mb-1">
          {experience.startDate} — {experience.isCurrent ? "Present" : experience.endDate}
        </p>
        <h3 className="font-display text-base font-semibold text-[var(--color-ink)]">{experience.role}</h3>
        <p className="text-sm font-medium text-[var(--color-accent)]">{experience.company}</p>
        {experience.description && (
          <p className="mt-2 text-sm text-[var(--color-muted)]">{experience.description}</p>
        )}
      </div>
      <DeleteButton confirmText={`Delete "${experience.role}" at ${experience.company}?`} onDelete={() => deleteExperience(experience.id)} />
    </div>
  );
}
