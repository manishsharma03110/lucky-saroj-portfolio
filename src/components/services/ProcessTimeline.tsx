import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Preserving the exact same 4 real steps as before — only the presentation
// is redesigned, no new steps invented.
const STEPS = [
  { step: "01", title: "Brief & Footage", desc: "Share your raw footage, goals and any reference edits." },
  { step: "02", title: "Rough Cut", desc: "A first pass structuring the story, pacing and key moments." },
  { step: "03", title: "Refine", desc: "Sound design, color and motion graphics layered in with your feedback." },
  { step: "04", title: "Deliver", desc: "Final export in the formats you need, ready to publish." },
];

export function ProcessTimeline() {
  return (
    <Section spacing="md" className="bg-[var(--cine-surface)]">
      <Container>
        <SectionHeading
          eyebrow="00:02:00:00 — HOW WE WORK"
          title="My Process"
          className="mb-16"
        />

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.step} className="relative">
              <div className="relative mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--cine-accent)] text-xs font-semibold text-[var(--cine-accent)]">
                  {s.step}
                </span>

                {/* Connecting segment to the next step — positioned relative
                    to this row so its vertical center coincides exactly with
                    the badge's center (guaranteed by flexbox items-center on
                    this row), not a guessed pixel offset. */}
                {i < STEPS.length - 1 && (
                  <span
                    className="cine-scrubber absolute left-8 top-1/2 hidden -translate-y-1/2 lg:block"
                    style={{ width: "calc(100% + 8px)" }}
                    aria-hidden
                  />
                )}
              </div>
              <h3 className="cine-display text-base text-[var(--cine-text-primary)]">
                {s.title}
              </h3>
              <p className="cine-body mt-2 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
