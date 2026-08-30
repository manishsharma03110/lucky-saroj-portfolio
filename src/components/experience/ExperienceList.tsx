import { MapPin } from "lucide-react";
import type { schema } from "@/lib/db";

type Experience = typeof schema.experiences.$inferSelect;

export function ExperienceList({ experiences }: { experiences: Experience[] }) {
  return (
    <section className="bg-[var(--background-primary)] py-14 sm:py-20 lg:py-24" aria-labelledby="experience-list-title">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">Professional journey</p>
        <div className="grid gap-5 border-b border-white/10 pb-8 sm:grid-cols-[0.9fr_1.1fr] sm:items-end">
          <h2 id="experience-list-title" className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em] text-[var(--text-primary)] sm:text-5xl">My professional experience.</h2>
          <p className="max-w-lg text-sm leading-7 text-[var(--text-secondary)] sm:justify-self-end">A timeline of my roles and responsibilities that have shaped my journey as a video editor.</p>
        </div>

        {experiences.length === 0 ? <p className="py-12 text-base text-[var(--text-secondary)]">Experience details will appear here when they are added.</p> : (
          <ol className="mt-10 space-y-5 sm:mt-12">
            {experiences.map((experience, index) => {
              const current = experience.isCurrent || experience.endDate?.trim().toLowerCase() === "present";
              const endDate = current ? "Present" : experience.endDate;
              return (
                <li key={experience.id} className="group/timeline grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] gap-x-3 gap-y-4 lg:grid-cols-[140px_48px_minmax(0,1fr)] lg:gap-x-6 lg:gap-y-0">
                  <div className="col-start-2 row-start-1 flex flex-wrap items-baseline gap-x-2 lg:col-start-1 lg:block lg:pr-1 lg:text-right">
                    <p className="font-display text-sm font-semibold tracking-[0.18em] text-[var(--accent-primary)]">{String(index + 1).padStart(2, "0")}</p>
                    <p className="text-sm tabular-nums whitespace-nowrap text-[var(--text-muted)] lg:mt-2">{experience.startDate}{endDate && <><span aria-hidden> — </span><span className={current ? "text-[var(--accent-primary)]" : undefined}>{endDate}</span></>}</p>
                  </div>
                  <div className="relative col-start-1 row-span-2 row-start-1 min-h-full lg:col-start-2 lg:row-span-1">
                    <span className="absolute bottom-[-1.25rem] left-1/2 top-0 w-px -translate-x-1/2 bg-white/10 group-last/timeline:hidden" aria-hidden />
                    <span className="absolute left-1/2 top-1.5 z-10 size-5 -translate-x-1/2 rounded-full border border-[var(--accent-primary)] bg-[var(--background-primary)] shadow-[0_0_0_5px_rgba(59,130,246,0.08)] lg:top-5" aria-hidden />
                  </div>
                  <article className="group relative col-start-2 row-start-2 grid min-w-0 w-full gap-6 overflow-hidden rounded-md border border-white/10 bg-[var(--surface-primary)] px-6 py-6 transition-colors duration-300 hover:border-[var(--accent-primary)]/40 hover:bg-[var(--surface-primary)] motion-reduce:transition-none sm:px-8 sm:py-7 lg:col-start-3 lg:row-start-1 lg:grid-cols-[minmax(14rem,0.72fr)_1px_minmax(0,1.28fr)] lg:gap-8">
                    <span className="absolute left-0 top-0 h-full w-px bg-[var(--accent-primary)]/65" aria-hidden />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3"><h3 className="break-words font-display text-2xl font-semibold tracking-[-0.035em] text-[var(--text-primary)] sm:text-3xl">{experience.role}</h3>{current && <span className="rounded-sm border border-[var(--accent-primary)]/45 bg-[var(--accent-primary)]/10 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-primary)]">Current</span>}</div>
                      <p className="mt-3 break-words text-base font-medium text-[var(--text-secondary)]">{experience.company}</p>
                      {experience.location && <p className="mt-3 flex items-center gap-2 break-words text-sm text-[var(--text-muted)]"><MapPin size={14} strokeWidth={1.6} aria-hidden />{experience.location}</p>}
                    </div>
                    <span className="hidden h-full w-px bg-white/10 lg:block" aria-hidden />
                    <div className="min-w-0">{experience.description && <p className="max-w-3xl whitespace-pre-line break-words text-base leading-7 text-[var(--text-secondary)]">{experience.description}</p>}</div>
                  </article>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
