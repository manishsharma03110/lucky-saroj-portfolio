import { Container } from "@/components/ui/Container";

export function AboutStats({
  years,
  projects,
  clients,
  views,
}: {
  years: number;
  projects: number;
  clients: number;
  views: string;
}) {
  const stats = [
    { value: `${years}+`, label: "Years Experience" },
    { value: `${projects}+`, label: "Projects Completed" },
    { value: `${clients}+`, label: "Happy Clients" },
    { value: views, label: "Views Generated" },
  ];

  return (
    <section className="border-y border-[var(--cine-border)] bg-[var(--cine-surface)] py-12">
      <Container className="grid grid-cols-2 gap-8 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="cine-display text-3xl text-[var(--cine-accent)] sm:text-4xl">
              {s.value}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-[var(--cine-text-tertiary)]">
              {s.label}
            </p>
          </div>
        ))}
      </Container>
    </section>
  );
}
