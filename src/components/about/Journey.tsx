import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { schema } from "@/lib/db";

type Experience = typeof schema.experiences.$inferSelect;

export function Journey({ experiences }: { experiences: Experience[] }) {
  const preview = experiences.slice(0, 3);
  if (preview.length === 0) return null;

  return (
    <section className="border-y border-white/10 bg-[var(--surface-primary)] py-12 sm:py-14 lg:py-14">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">Experience</p>
            <h2 className="mt-4 max-w-[15ch] font-display text-[clamp(2rem,3vw,3.4rem)] font-semibold leading-none tracking-[-0.045em] text-[var(--text-primary)]">The path behind the practice.</h2>
          </div>
          <Link href="/experience" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]">Full experience <ArrowUpRight size={16} aria-hidden /></Link>
        </div>
        <ol>
          {preview.map((experience, index) => {
            const end = experience.isCurrent ? "Present" : experience.endDate;
            return (
              <li key={experience.id} className="grid gap-4 border-b border-white/10 py-7 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-6 lg:py-8">
                <span className="text-xs tabular-nums text-[var(--accent-primary)]">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-[-0.025em] text-[var(--text-primary)] sm:text-2xl">{experience.role}</h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{experience.company}{experience.location ? ` · ${experience.location}` : ""}</p>
                  {experience.description && <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-6 text-[var(--text-muted)]">{experience.description}</p>}
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
