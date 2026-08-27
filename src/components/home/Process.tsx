import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STAGES = [
  { label: "01 DISCOVER", description: "Understand the project, audience and goal." },
  { label: "02 EDIT", description: "Structure, pacing and storytelling." },
  { label: "03 POLISH", description: "Color, sound and motion." },
  { label: "04 DELIVER", description: "Final platform-ready video." },
];

export function Process() {
  return (
    <Section spacing="lg" className="bg-[var(--cine-surface)]">
      <Container>
        <SectionHeading
          eyebrow="00:04:00:00 — PROCESS"
          title="From raw to final"
          className="mb-16"
        />

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((stage, i) => (
            <div key={stage.label} className="relative">
              <div className="relative mb-4 flex items-center gap-3">
                <span className="relative z-10 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[var(--cine-accent)] bg-[var(--cine-surface)]" />
                <span className="cine-eyebrow">{stage.label}</span>

                {/* Connecting segment to the next marker — positioned via
                    top-1/2 + -translate-y-1/2 relative to THIS row, which
                    flexbox already centers the dot within (items-center on
                    the row above). That makes the segment's center coincide
                    exactly with the dot's center by definition, with no
                    pixel guessing involved. Spans past this row's own width
                    by exactly one grid gap (gap-10 = 2.5rem) so it reaches
                    the next dot with no visible break. */}
                {i < STAGES.length - 1 && (
                  <span
                    className="cine-scrubber absolute left-0 top-1/2 hidden -translate-y-1/2 lg:block"
                    style={{ width: "calc(100% + 2.5rem)" }}
                    aria-hidden
                  />
                )}
              </div>
              <p className="cine-body pl-[26px] text-sm">{stage.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
