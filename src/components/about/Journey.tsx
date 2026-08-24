import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/SectionHeading";
import type { schema } from "@/lib/db";

type Experience = typeof schema.experiences.$inferSelect;

/**
 * About-page-only experience timeline. Deliberately distinct from the
 * shared `ExperienceTimeline.tsx` (used on the dedicated /experience page)
 * so that component can be redesigned independently later without this one
 * needing to change, and vice versa — the two were never the same
 * component, just visually similar in the old design.
 */
export function Journey({ experiences }: { experiences: Experience[] }) {
  if (experiences.length === 0) return null;

  return (
    <Section spacing="lg" className="bg-[var(--cine-surface)]">
      <Container>
        <Eyebrow className="mb-4">00:02:20:00 — MY JOURNEY</Eyebrow>
        <h2 className="cine-display mb-14 text-3xl text-[var(--cine-text-primary)] sm:text-4xl">
          The path so far
        </h2>

        <ol className="relative border-l border-[var(--cine-border)] pl-8">
          {experiences.map((exp) => (
            <li key={exp.id} className="relative mb-12 last:mb-0">
              <span className="absolute -left-[calc(2rem+7px)] mt-1.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--cine-accent)] bg-[var(--cine-surface)]" />
              <p className="cine-eyebrow mb-1">
                {exp.startDate} — {exp.isCurrent ? "Present" : exp.endDate}
              </p>
              <h3 className="cine-display text-lg text-[var(--cine-text-primary)] sm:text-xl">
                {exp.role}
              </h3>
              <p className="mt-0.5 text-sm font-medium text-[var(--cine-accent)]">
                {exp.company}
                {exp.location ? ` · ${exp.location}` : ""}
              </p>
              {exp.description && (
                <p className="cine-body mt-2 max-w-xl text-sm">{exp.description}</p>
              )}
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
