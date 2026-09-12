import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Service = { id: string; name: string; description: string | null; icon: string };

type Copy = {
  eyebrow: string;
  heading: string;
  description: string;
  emptyLabel: string;
};

export function ServicesShowcase({ services, copy }: { services: Service[]; copy: Copy }) {
  return (
    <section className="bg-[var(--background-primary)] py-14 sm:py-16 lg:py-20 2xl:py-24" aria-labelledby="services-showcase-title">
      <div className="mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12 2xl:px-16">
        <div className="grid gap-6 border-b border-white/10 pb-8 sm:grid-cols-[0.7fr_1.3fr] sm:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">{copy.eyebrow}</p><h2 id="services-showcase-title" className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">{copy.heading}</h2></div>
          <p className="max-w-lg text-sm leading-7 text-[var(--text-secondary)] sm:justify-self-end">{copy.description}</p>
        </div>
        {services.length > 0 ? <ol className="mt-10 grid border-t border-white/10 md:grid-cols-2">{services.map((service, index) => {
          const Icon = (Icons[service.icon as keyof typeof Icons] as LucideIcon) ?? Icons.Clapperboard;
          return <li key={service.id} className="group relative grid gap-6 border-b border-white/10 py-7 transition-colors duration-300 hover:bg-white/[0.015] motion-reduce:transition-none sm:grid-cols-[3rem_minmax(0,1fr)] sm:px-5 sm:py-8 md:odd:border-r lg:px-7">
            <span className="absolute right-5 top-5 font-display text-xs font-semibold tracking-[0.18em] text-[var(--text-muted)]">{String(index + 1).padStart(2, "0")}</span>
            <span className="grid size-11 place-items-center text-[var(--accent-primary)]" aria-hidden><Icon size={22} strokeWidth={1.5} /></span>
            <div><h3 className="font-display text-2xl font-semibold leading-tight tracking-[-0.04em] transition-colors duration-300 motion-reduce:transition-none group-hover:text-[var(--accent-hover)] sm:text-3xl">{service.name}</h3>
            {service.description && <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">{service.description}</p>}</div>
          </li>;
        })}</ol> : <p className="py-14 text-sm text-[var(--text-secondary)]">{copy.emptyLabel}</p>}
      </div>
    </section>
  );
}
