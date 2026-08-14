import { Container } from "@/components/ui/Container";
import type { schema } from "@/lib/db";

type Experience = typeof schema.experiences.$inferSelect;

export function ExperienceTimeline({
  experiences,
  eyebrow = "00:02:20:00 — MY JOURNEY",
  heading = "My Professional Journey",
  compact = false,
}: {
  experiences: Experience[];
  eyebrow?: string;
  heading?: string;
  compact?: boolean;
}) {
  return (
    <section className={compact ? "py-16" : "py-20 md:py-28"}>
      <Container>
        <div className="mb-12">
          <p className="timecode mb-3">{eyebrow}</p>
          <h2 className="font-display text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
            {heading}
          </h2>
        </div>

        <ol className="relative border-l border-[var(--color-line)] pl-8">
          {experiences.map((exp) => (
            <li key={exp.id} className="mb-10 last:mb-0">
              <span className="absolute -left-[7px] mt-1.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--color-accent)] bg-[var(--color-paper)]" />
              <p className="timecode mb-1">
                {exp.startDate} — {exp.isCurrent ? "Present" : exp.endDate}
              </p>
              <h3 className="font-display text-lg font-semibold text-[var(--color-ink)]">
                {exp.role}
              </h3>
              <p className="mt-0.5 text-sm font-medium text-[var(--color-accent)]">
                {exp.company}
                {exp.location ? ` · ${exp.location}` : ""}
              </p>
              {exp.description && (
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--color-muted)]">
                  {exp.description}
                </p>
              )}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
