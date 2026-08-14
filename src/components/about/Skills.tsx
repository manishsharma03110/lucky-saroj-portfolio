import { Container } from "@/components/ui/Container";

export function Skills({
  skills,
  tools,
}: {
  skills: { id: string; name: string }[];
  tools: { id: string; name: string }[];
}) {
  return (
    <section className="py-20 md:py-24">
      <Container className="grid grid-cols-1 gap-14 lg:grid-cols-2">
        <div>
          <p className="timecode mb-4">00:01:12:00 — SKILLS</p>
          <h2 className="mb-6 font-display text-2xl font-bold text-[var(--color-ink)]">
            What I bring to every edit
          </h2>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="rounded-full border border-[var(--color-line)] bg-white px-4 py-2 text-sm text-[var(--color-ink-soft)]"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="timecode mb-4">00:01:38:00 — TOOLS &amp; SOFTWARE</p>
          <h2 className="mb-6 font-display text-2xl font-bold text-[var(--color-ink)]">
            My editing toolkit
          </h2>
          <div className="flex flex-wrap gap-3">
            {tools.map((tool) => (
              <span
                key={tool.id}
                className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-sm font-medium text-[var(--color-accent)]"
              >
                {tool.name}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
