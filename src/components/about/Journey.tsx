import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { schema } from "@/lib/db";

type Experience = typeof schema.experiences.$inferSelect;

export function Journey({ experiences, eyebrow, heading, linkLabel, linkUrl, presentLabel }: { experiences: Experience[]; eyebrow: string; heading: string; linkLabel: string; linkUrl: string; presentLabel: string }) {
  const preview = experiences.slice(0, 3);
  if (preview.length === 0) return null;

  return (
    <section className="border-y border-white/10 bg-[var(--surface-primary)] py-14 sm:py-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12 2xl:px-16">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">{eyebrow}</p>
            <h2 className="mt-4 max-w-[14ch] font-display text-[clamp(2.25rem,3.2vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-[var(--text-primary)]">{heading}</h2>
          </div>
          <Link href={linkUrl} className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]">{linkLabel} <ArrowUpRight size={16} aria-hidden /></Link>
        </div>
        <ol>
          {preview.map((experience, index) => {
            const end = experience.isCurrent ? presentLabel : experience.endDate;
            return (
              <li key={experience.id} className="grid gap-4 border-b border-white/10 py-7 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-6 lg:py-8">
                <span className="text-xs tabular-nums tracking-[0.18em] text-[var(--accent-primary)]">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">{experience.role}</h3>
                  <p className="mt-2 text-base leading-6 text-[var(--text-secondary)]">{experience.company}{experience.location ? ` · ${experience.location}` : ""}</p>
                  {experience.description && <p className="mt-3 max-w-2xl whitespace-pre-line text-base leading-7 text-[var(--text-muted)]">{experience.description}</p>}
                </div>
                <p className="text-sm tabular-nums text-[var(--text-muted)] sm:text-right">{experience.startDate}{end ? ` — ${end}` : ""}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
