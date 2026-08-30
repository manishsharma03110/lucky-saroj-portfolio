import { Briefcase, CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import type { schema } from "@/lib/db";

type Experience = typeof schema.experiences.$inferSelect;

export function ExperienceHero({ experiences }: { experiences: Experience[] }) {
  const current = experiences.find((experience) => experience.isCurrent || experience.endDate?.trim().toLowerCase() === "present");

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[var(--background-primary)] py-14 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_5%_48%,rgba(59,130,246,0.17),transparent_29%)]" aria-hidden />
      <span className="pointer-events-none absolute left-5 top-8 h-9 w-9 border-l border-t border-[var(--accent-primary)]/70 sm:left-8 lg:left-12" aria-hidden />
      <span className="pointer-events-none absolute bottom-8 right-5 h-9 w-9 border-b border-r border-[var(--accent-primary)]/70 sm:right-8 lg:right-12" aria-hidden />
      <div className="relative mx-auto grid min-h-[29rem] w-full max-w-[1280px] gap-10 px-5 sm:px-8 md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.08fr)] md:items-center md:gap-10 lg:gap-14 lg:px-12">
        <div>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]"><span className="h-px w-10 bg-current" aria-hidden />Experience</p>
          <h1 className="mt-7 max-w-[11ch] font-display text-[clamp(2.5rem,4.8vw,4.75rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-[var(--text-primary)]">Crafting stories through experience and precision.</h1>
          <p className="mt-7 max-w-[34rem] text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">Over the years, I&rsquo;ve worked across different industries and creative environments — sharpening my skills, understanding stories deeper, and delivering impactful edits.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button href="/portfolio" variant="cine-solid" withArrow className="!rounded-md !px-7 !py-3.5">View My Work</Button><Button href="/contact" variant="cine-outline" withArrow className="!rounded-md !px-7 !py-3.5">Let&rsquo;s Connect</Button></div>
        </div>

        <div className="relative pb-24 sm:pb-20 md:pb-24">
          <div className="relative min-h-72 overflow-hidden border border-white/10 bg-[var(--surface-primary)] sm:min-h-96 md:min-h-[29rem]">
            <Image src="/uploads/About/about-hero-editor.png" alt="Video editor working at a professional editing workstation" fill preload sizes="(max-width: 767px) 100vw, 57vw" className="object-cover object-center" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,11,0.67),transparent_31%),linear-gradient(to_top,rgba(8,9,11,0.46),transparent_46%)]" aria-hidden />
            <span className="pointer-events-none absolute right-0 top-0 h-10 w-10 border-r border-t border-[var(--accent-primary)]/85" aria-hidden />
          </div>
          <dl className="absolute inset-x-3 bottom-3 grid grid-cols-1 border border-white/15 bg-[var(--background-primary)]/95 shadow-2xl shadow-black/40 sm:inset-x-5 sm:grid-cols-3 md:inset-x-4">
            <div className="flex min-w-0 items-center gap-3 px-4 py-4 sm:px-5"><Briefcase size={19} className="shrink-0 text-[var(--accent-primary)]" strokeWidth={1.6} aria-hidden /><div className="min-w-0"><dt className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Current role</dt><dd className="mt-1 truncate text-sm font-medium text-[var(--text-primary)]">{current?.role ?? "—"}</dd></div></div>
            <div className="flex min-w-0 items-center gap-3 border-t border-white/10 px-4 py-4 sm:border-l sm:border-t-0 sm:px-5"><MapPin size={19} className="shrink-0 text-[var(--accent-primary)]" strokeWidth={1.6} aria-hidden /><div className="min-w-0"><dt className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Location</dt><dd className="mt-1 truncate text-sm font-medium text-[var(--text-primary)]">{current?.location ?? "—"}</dd></div></div>
            <div className="flex min-w-0 items-center gap-3 border-t border-white/10 px-4 py-4 sm:border-l sm:border-t-0 sm:px-5"><CalendarDays size={19} className="shrink-0 text-[var(--accent-primary)]" strokeWidth={1.6} aria-hidden /><div><dt className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Experience entries</dt><dd className="mt-1 text-sm font-medium text-[var(--text-primary)]">{experiences.length}</dd></div></div>
          </dl>
        </div>
      </div>
    </section>
  );
}
