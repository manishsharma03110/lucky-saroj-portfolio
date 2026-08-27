import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Playhead } from "@/components/ui/Playhead";

const PRINCIPLES = [
  {
    title: "Story First",
    description: "Every cut should move the story forward.",
  },
  {
    title: "Retention Focused",
    description: "Pacing should keep viewers engaged.",
  },
  {
    title: "Detail Matters",
    description: "Sound, color, motion and timing all matter.",
  },
];

export function WhyWorkWithMe() {
  return (
    <Section spacing="lg" className="border-t border-[var(--cine-border)] bg-[var(--cine-void)]">
      <Container>
        <SectionHeading
          eyebrow="00:03:00:00 — PHILOSOPHY"
          title="Why work with me"
          align="center"
          className="mx-auto mb-14"
        />

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">
          {PRINCIPLES.map((p, i) => (
            <div key={p.title} className="text-center sm:px-2">
              <span className="cine-eyebrow">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="cine-display mt-4 text-xl text-[var(--cine-text-primary)]">
                {p.title}
              </h3>
              <p className="cine-body mx-auto mt-2 max-w-[22ch] text-sm">{p.description}</p>
            </div>
          ))}
        </div>

        <Playhead className="mt-16" />
      </Container>
    </Section>
  );
}
