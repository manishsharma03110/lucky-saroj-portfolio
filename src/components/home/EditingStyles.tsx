import { ArrowUpRight, Clapperboard } from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { getServices } from "@/lib/db/queries";

export async function EditingStyles() {
  const services = await getServices(false);
  if (services.length === 0) return null;

  return (
    <section className="border-y border-white/10 bg-[var(--surface-primary)] py-16 md:py-20 lg:py-24 2xl:py-28">
      <div className="mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12 2xl:px-16">
        <div className="grid gap-8 md:gap-10 lg:grid-cols-[0.68fr_1.32fr] lg:gap-14 2xl:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">What I do</p>
            <h2 className="mt-5 max-w-lg text-[2.25rem] font-semibold leading-[1] tracking-[-0.045em] text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
              Post-production built around the story.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-[var(--text-secondary)]">
              Explore the services currently available for projects and collaborations.
            </p>
            <Link href="/services" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)] transition-colors hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--surface-primary)]">
              Explore services <ArrowUpRight size={17} aria-hidden />
            </Link>
          </div>

          <div className="grid gap-px overflow-hidden rounded-[12px] border border-white/10 bg-white/10 sm:grid-cols-2">
            {services.map((service, index) => {
              const Icon = (Icons[service.icon as keyof typeof Icons] as LucideIcon) ?? Clapperboard;
              const isLastOdd = index === services.length - 1 && services.length % 2 === 1;
              return (
                <article key={service.id} className={`group relative overflow-hidden bg-[var(--background-secondary)] p-5 transition-colors duration-300 hover:bg-[var(--surface-elevated)] motion-reduce:transition-none sm:min-h-44 sm:p-6 lg:min-h-48 lg:p-7 ${isLastOdd ? "sm:col-span-2" : ""}`}>
                  <span className="absolute inset-y-0 left-0 w-px origin-bottom scale-y-0 bg-[var(--accent-primary)] transition-transform duration-300 group-hover:scale-y-100 motion-reduce:transition-none" aria-hidden />
                  <div className="flex items-start justify-between gap-5">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--accent-primary)]/35 text-[var(--accent-primary)]">
                      <Icon size={19} strokeWidth={1.5} aria-hidden />
                    </span>
                    <span className="text-xs tabular-nums text-[var(--text-muted)]">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-medium tracking-[-0.03em] text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-hover)] sm:mt-6">{service.name}</h3>
                  {service.description && <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">{service.description}</p>}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
