import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/SectionHeading";

export function Skills({
  skills,
  tools,
}: {
  skills: { id: string; name: string }[];
  tools: { id: string; name: string }[];
}) {
  return (
    <Section spacing="lg" className="bg-[var(--cine-void)]">
      <Container className="grid grid-cols-1 gap-14 lg:grid-cols-2">
        <div>
          <Eyebrow className="mb-5">00:01:12:00 — SKILLS</Eyebrow>
          <h2 className="cine-display mb-6 text-2xl text-[var(--cine-text-primary)] sm:text-3xl">
            What I bring to every edit
          </h2>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="rounded-full border border-[var(--cine-border)] px-4 py-2 text-sm text-[var(--cine-text-secondary)] transition-colors hover:border-[var(--cine-border-strong)] hover:text-[var(--cine-text-primary)]"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
        <div>
          <Eyebrow className="mb-5">00:01:38:00 — TOOLS &amp; SOFTWARE</Eyebrow>
          <h2 className="cine-display mb-6 text-2xl text-[var(--cine-text-primary)] sm:text-3xl">
            My editing toolkit
          </h2>
          <div className="flex flex-wrap gap-3">
            {tools.map((tool) => (
              <span
                key={tool.id}
                className="rounded-full bg-[var(--cine-accent-soft)] px-4 py-2 text-sm font-medium text-[var(--cine-accent)]"
              >
                {tool.name}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
