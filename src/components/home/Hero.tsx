import { Play } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Hero({
  heading,
  subheading,
  description,
  heroImageUrl,
  hasShowreel,
}: {
  heading: string;
  subheading: string;
  description: string;
  heroImageUrl?: string | null;
  hasShowreel: boolean;
}) {
  const visualUrl = heroImageUrl || "/uploads/HomePage/Video Editor Banner.png";

  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-[var(--background-primary)]">
      <div className="absolute inset-0 -z-20 bg-[var(--surface-primary)]">
        <div
          className="h-full w-full bg-cover bg-[68%_center] sm:bg-center lg:bg-[58%_center]"
          style={{ backgroundImage: `url('${visualUrl}')` }}
          role="img"
          aria-label={heading || "Video editing workspace"}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,9,11,0.98)_0%,rgba(8,9,11,0.88)_38%,rgba(8,9,11,0.38)_70%,rgba(8,9,11,0.22)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(8,9,11,0.62)_0%,rgba(8,9,11,0.8)_42%,rgba(8,9,11,0.98)_78%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-[var(--background-primary)] to-transparent"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-5 border border-white/[0.06] sm:inset-8 lg:inset-10" aria-hidden>
        <span className="absolute -left-px -top-px h-7 w-7 border-l border-t border-[var(--accent-primary)]/65" />
        <span className="absolute -right-px -top-px h-7 w-7 border-r border-t border-white/25" />
        <span className="absolute -bottom-px -left-px h-7 w-7 border-b border-l border-white/25" />
        <span className="absolute -bottom-px -right-px h-7 w-7 border-b border-r border-[var(--accent-primary)]/65" />
      </div>

      <div className="mx-auto flex min-h-[620px] w-full max-w-[1360px] items-end px-5 pb-16 pt-28 sm:min-h-[680px] sm:px-8 sm:pb-20 lg:min-h-[720px] lg:items-center lg:px-12 lg:py-24">
        <div className="max-w-[700px]">
        {subheading && <p className="mb-6 flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)] sm:text-xs"><span className="h-px w-9 bg-current" aria-hidden />{subheading}</p>}
        {heading && <h1 className="max-w-[13ch] font-display text-[clamp(2.75rem,5.4vw,5.25rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-[var(--text-primary)]">{heading}</h1>}
        {description && <p className="mt-7 max-w-[570px] text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">{description}</p>}
        <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
          <Button href="/portfolio" variant="cine-solid" withArrow className="w-full !rounded-md !bg-[var(--accent-primary)] !px-7 !py-3.5 !font-semibold !text-[var(--background-primary)] hover:!bg-[var(--accent-hover)] sm:w-auto">
            View My Work
          </Button>
          {hasShowreel && (
            <Button href="#showreel" variant="cine-outline" className="w-full gap-2 !rounded-md !border-white/25 !px-7 !py-3.5 !text-[var(--text-primary)] hover:!border-[var(--accent-primary)] hover:!text-[var(--accent-hover)] sm:w-auto">
              <Play size={16} fill="currentColor" aria-hidden="true" /> Watch Showreel
            </Button>
          )}
        </div>
        <div className="mt-12 hidden max-w-lg items-end gap-4 sm:flex" aria-hidden>
          <span className="text-[0.65rem] uppercase tracking-[0.22em] text-[var(--text-secondary)]">Story / Rhythm / Detail</span>
          <span className="mb-1 h-px flex-1 bg-white/15"><span className="block h-px w-2/5 bg-[var(--accent-primary)]" /></span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--accent-primary)]/55 text-[var(--accent-primary)]"><Play size={11} fill="currentColor" /></span>
        </div>
        </div>
      </div>
    </section>
  );
}
