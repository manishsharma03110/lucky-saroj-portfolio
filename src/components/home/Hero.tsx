import Image from "next/image";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { resolveHeroImageUrl } from "@/lib/media/hero-image";
import { canUseOptimizedImage } from "@/lib/media/image-source";

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
  const visualUrl = resolveHeroImageUrl(heroImageUrl);
  const optimizedVisual = canUseOptimizedImage(visualUrl);

  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-[var(--background-primary)]">
      <div className="absolute inset-0 -z-20 overflow-hidden bg-[var(--surface-primary)]" aria-hidden="true">
        {optimizedVisual ? (
          <Image
            src={visualUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="scale-[1.01] object-cover object-[70%_center] motion-safe:transition-transform motion-safe:duration-[1600ms] sm:object-center lg:object-[60%_center]"
          />
        ) : (
          <div
            className="h-full w-full scale-[1.01] bg-cover bg-[70%_center] motion-safe:transition-transform motion-safe:duration-[1600ms] sm:bg-center lg:bg-[60%_center]"
            style={{ backgroundImage: `url('${visualUrl}')` }}
          />
        )}
      </div>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,9,11,0.98)_0%,rgba(8,9,11,0.88)_38%,rgba(8,9,11,0.38)_70%,rgba(8,9,11,0.22)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(8,9,11,0.62)_0%,rgba(8,9,11,0.8)_42%,rgba(8,9,11,0.98)_78%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-[var(--background-primary)] to-transparent"
        aria-hidden
      />
      <div className="pointer-events-none absolute -left-32 top-1/3 -z-10 h-80 w-80 rounded-full bg-[var(--accent-glow)] blur-[120px]" aria-hidden />

      <div className="mx-auto flex min-h-[570px] w-full max-w-[1560px] items-end px-5 pb-12 pt-24 sm:min-h-[640px] sm:px-8 sm:pb-16 sm:pt-28 md:min-h-[680px] lg:min-h-[720px] lg:items-center lg:px-12 lg:py-24 xl:min-h-[760px] 2xl:px-16">
        <div className="max-w-[760px] 2xl:max-w-[860px]">
        {subheading && <p className="mb-5 flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--accent-text)] sm:mb-6 sm:text-xs lg:text-[0.8rem]"><span className="h-px w-9 bg-[var(--accent-primary)] sm:w-10" aria-hidden />{subheading}</p>}
        {heading && <h1 className="max-w-[12ch] text-balance font-display text-[clamp(2.65rem,6.2vw,6rem)] font-semibold leading-[0.94] tracking-[-0.052em] text-[var(--text-primary)] 2xl:text-[6.5rem]">{heading}</h1>}
        {description && <p className="mt-5 max-w-[34rem] text-pretty text-[0.98rem] leading-7 text-white/68 sm:mt-6 sm:text-lg sm:leading-8 2xl:max-w-[38rem]">{description}</p>}
        <div className="mt-7 flex flex-col items-start gap-3 sm:mt-9 sm:flex-row">
          <Button href="/portfolio" variant="cine-solid" withArrow className="min-h-12 !rounded-md !bg-[var(--accent-primary)] !px-6 !py-3 !font-semibold !text-[var(--background-primary)] hover:!bg-[var(--accent-hover)] sm:px-7">
            View My Work
          </Button>
          {hasShowreel && (
            <Button href="#showreel" variant="cine-outline" className="min-h-12 gap-2 !rounded-md !border-white/25 !px-6 !py-3 !text-[var(--text-primary)] hover:!border-[var(--accent-primary)] hover:!text-[var(--accent-hover)] sm:px-7">
              <Play size={16} fill="currentColor" aria-hidden="true" /> Watch Showreel
            </Button>
          )}
        </div>
        <span className="mt-9 block h-px w-20 bg-[var(--public-accent-gradient)] sm:mt-11 sm:w-24" aria-hidden />
        </div>
      </div>
    </section>
  );
}
