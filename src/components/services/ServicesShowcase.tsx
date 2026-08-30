import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Service = { id: string; name: string; description: string | null; icon: string };

export function ServicesShowcase({ services }: { services: Service[] }) {
  return (
    <section className="bg-[var(--background-primary)] py-16 sm:py-20 lg:py-28" aria-labelledby="services-showcase-title">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-6 border-b border-white/10 pb-8 sm:grid-cols-[0.7fr_1.3fr] sm:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">What I offer</p><h2 id="services-showcase-title" className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Services built around the story.</h2></div>
          <p className="max-w-lg text-sm leading-7 text-[var(--text-secondary)] sm:justify-self-end">Every active service below is drawn directly from the current service catalog.</p>
        </div>
        {services.length > 0 ? <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{services.map((service, index) => {
          const Icon = (Icons[service.icon as keyof typeof Icons] as LucideIcon) ?? Icons.Clapperboard;
          return <li key={service.id} className="group relative flex min-h-60 flex-col overflow-hidden border border-white/10 bg-[var(--surface-primary)] p-6 transition-colors duration-300 hover:border-[var(--accent-primary)]/45 motion-reduce:transition-none sm:p-7">
            <span className="absolute right-5 top-5 font-display text-xs font-semibold tracking-[0.18em] text-[var(--text-muted)]">{String(index + 1).padStart(2, "0")}</span>
            <span className="grid size-12 place-items-center rounded-lg border border-[var(--accent-primary)]/35 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.02]" aria-hidden><Icon size={22} strokeWidth={1.5} /></span>
            <div className="mt-10 flex flex-1 flex-col"><h3 className="min-h-16 font-display text-2xl font-semibold leading-tight tracking-[-0.04em] transition-colors duration-300 motion-reduce:transition-none group-hover:text-[var(--accent-hover)] sm:text-3xl">{service.name}</h3>
            {service.description && <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">{service.description}</p>}</div>
            <span className="absolute bottom-0 left-0 h-px w-16 bg-[var(--accent-primary)]/70" aria-hidden />
          </li>;
        })}</ol> : <p className="py-14 text-sm text-[var(--text-secondary)]">No active services yet.</p>}
      </div>
    </section>
  );
}
