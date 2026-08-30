import { Clock3, Clapperboard, Eye, Users } from "lucide-react";

function compact(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function stored(value: string) {
  const numeric = Number(value.replace(/,/g, ""));
  return Number.isFinite(numeric) ? compact(numeric) : value;
}

export function AboutStats({ years, projects, clients, views }: { years: number; projects: number; clients: number; views: string }) {
  const stats = [
    { value: years > 0 ? compact(years) : null, label: "Years experience", icon: Clock3 },
    { value: projects > 0 ? compact(projects) : null, label: "Projects completed", icon: Clapperboard },
    { value: clients > 0 ? compact(clients) : null, label: "Clients", icon: Users },
    { value: views !== "0" ? stored(views) : null, label: "Views generated", icon: Eye },
  ].filter((item): item is { value: string; label: string; icon: typeof Clock3 } => Boolean(item.value));

  if (stats.length === 0) return null;

  return (
    <section className="bg-[var(--background-primary)] pb-4 sm:pb-5 lg:pb-6">
      <dl className="mx-auto grid w-[calc(100%-2.5rem)] max-w-[1280px] grid-cols-2 overflow-hidden rounded-[8px] border border-white/10 bg-[var(--surface-primary)] sm:w-[calc(100%-4rem)] lg:grid-cols-4">
        {stats.map(({ value, label, icon: Icon }) => (
          <div key={label} className="flex min-h-24 items-center gap-4 border-white/10 p-5 even:border-l lg:border-l lg:first:border-l-0 lg:p-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--accent-primary)]/40 text-[var(--accent-primary)]"><Icon size={18} strokeWidth={1.5} aria-hidden /></span>
            <div><dd className="font-display text-2xl font-semibold tracking-[-0.04em] text-[var(--accent-primary)] sm:text-3xl">{value}</dd><dt className="mt-1 text-[0.6rem] uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</dt></div>
          </div>
        ))}
      </dl>
    </section>
  );
}
