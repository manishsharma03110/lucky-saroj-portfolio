import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Playhead } from "@/components/ui/Playhead";

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

        <Playhead className="mb-8 hidden lg:block" />
        <div className="relative">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STAGES.map((stage) => (
              <div key={stage.label} className="relative">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-[var(--cine-accent)] bg-[var(--cine-void)]" />
                  <span className="cine-eyebrow">{stage.label}</span>
                </div>
                <p className="cine-body text-sm">{stage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
