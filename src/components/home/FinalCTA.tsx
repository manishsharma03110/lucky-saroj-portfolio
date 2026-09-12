import { Button } from "@/components/ui/Button";
import type { HomePageContent } from "@/lib/db/home-content-service";

export function FinalCTA({ content }: { content: HomePageContent }) {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-[var(--surface-primary)] py-16 md:py-20 lg:py-24 2xl:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_110%,var(--accent-glow),transparent_42%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-[12%] hidden w-px bg-white/10 lg:block" aria-hidden />
      <div className="relative mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12 2xl:px-16">
        <div className="relative max-w-[940px] border-l border-[var(--accent-primary)]/55 pl-5 sm:pl-8 lg:pl-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">{content.finalCtaEyebrow}</p>
          <h2 className="mt-5 text-[clamp(2.4rem,4.8vw,4.75rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-[var(--text-primary)]">
            {content.finalCtaHeading}
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
            {content.finalCtaDescription}
          </p>
          <Button
            href={content.finalCtaButtonUrl}
            variant="cine-solid"
            withArrow
            className="mt-8 !rounded-md !bg-[var(--accent-primary)] !px-7 !py-3.5 !font-semibold !text-[var(--background-primary)] hover:!bg-[var(--accent-hover)]"
          >
            {content.finalCtaButtonLabel}
          </Button>
          <div className="mt-12 flex items-center gap-3" aria-hidden><span className="h-px w-10 bg-[var(--accent-primary)]" /><span className="h-px w-28 bg-white/15" /><span className="h-2 w-2 rotate-45 border border-[var(--accent-primary)]" /></div>
        </div>
      </div>
    </section>
  );
}
