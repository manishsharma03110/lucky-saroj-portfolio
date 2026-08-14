import { Container } from "@/components/ui/Container";

const STEPS = [
  { step: "01", title: "Brief & Footage", desc: "Share your raw footage, goals and any reference edits." },
  { step: "02", title: "Rough Cut", desc: "A first pass structuring the story, pacing and key moments." },
  { step: "03", title: "Refine", desc: "Sound design, color and motion graphics layered in with your feedback." },
  { step: "04", title: "Deliver", desc: "Final export in the formats you need, ready to publish." },
];

export function ProcessTimeline() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="mb-12 text-center">
          <p className="timecode mb-3">00:03:00:00 — HOW WE WORK</p>
          <h2 className="font-display text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
            My Process
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.step} className="relative">
              <p className="timecode mb-3">{s.step}</p>
              <h3 className="font-display text-base font-semibold text-[var(--color-ink)]">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{s.desc}</p>
              {i < STEPS.length - 1 && (
                <div className="scrubber absolute right-[-16px] top-2 hidden w-8 lg:block" />
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
