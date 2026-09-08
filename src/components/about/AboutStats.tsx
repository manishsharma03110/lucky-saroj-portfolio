function compact(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function stored(value: string) {
  const numeric = Number(value.replace(/,/g, ""));
  return Number.isFinite(numeric) ? compact(numeric) : value;
}

export function AboutStats({ years, projects, clients, views }: { years: number; projects: number; clients: number; views: string }) {
  const stats = [
    { value: years > 0 ? compact(years) : null, label: "Years experience" },
    { value: projects > 0 ? compact(projects) : null, label: "Projects completed" },
    { value: clients > 0 ? compact(clients) : null, label: "Clients" },
    { value: views !== "0" ? stored(views) : null, label: "Views generated" },
  ].filter((item): item is { value: string; label: string } => Boolean(item.value));

  if (stats.length === 0) return null;

  return (
    <section className="bg-[var(--background-primary)] py-8 sm:py-10">
      <dl className="mx-auto grid w-full max-w-[1480px] grid-cols-2 px-5 sm:px-8 lg:grid-cols-4 lg:px-12 2xl:px-16">
        {stats.map(({ value, label }) => (
          <div key={label} className="border-b border-white/10 py-5 odd:pr-5 even:border-l even:pl-5 lg:border-b-0 lg:border-l lg:px-7 lg:first:border-l-0 lg:first:pl-0">
            <dd className="font-display text-3xl font-semibold tracking-[-0.045em] text-[var(--accent-primary)] sm:text-4xl">{value}</dd><dt className="mt-2 text-[0.68rem] uppercase tracking-[0.16em] text-[var(--text-secondary)]">{label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
