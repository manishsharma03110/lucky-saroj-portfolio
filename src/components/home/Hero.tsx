import Image from "next/image";
import { ArrowDown, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HeroScrollMotion } from "@/components/ui/HeroScrollMotion";
import motionStyles from "@/components/ui/DynamicMotion.module.css";
import { resolveHeroImageUrl } from "@/lib/media/hero-image";
import { canUseOptimizedImage } from "@/lib/media/image-source";

export function Hero({
  heading,
  subheading,
  description,
  heroImageUrl,
  heroImageAlt,
  primaryLabel,
  primaryUrl,
  showreelLabel,
  showreelUrl,
  hasShowreel,
}: {
  heading: string;
  subheading: string;
  description: string;
  heroImageUrl?: string | null;
  heroImageAlt: string;
  primaryLabel: string;
  primaryUrl: string;
  showreelLabel: string;
  showreelUrl: string;
  hasShowreel: boolean;
}) {
  const visualUrl = resolveHeroImageUrl(heroImageUrl);
  const optimizedVisual = canUseOptimizedImage(visualUrl);

  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-[var(--background-primary)]">
      <div className="absolute inset-0 -z-20 overflow-hidden bg-[var(--surface-primary)]" aria-hidden={heroImageAlt ? undefined : "true"}>
        <HeroScrollMotion>
          {optimizedVisual ? (
            <Image src={visualUrl} alt={heroImageAlt} fill priority sizes="100vw" className={`${motionStyles.heroVisual} object-cover object-[70%_center] sm:object-center lg:object-[60%_center]`} />
          ) : (
            <div className={`${motionStyles.heroVisual} h-full w-full bg-cover bg-[70%_center] sm:bg-center lg:bg-[60%_center]`} style={{ backgroundImage: `url('${visualUrl}')` }} role={heroImageAlt ? "img" : undefined} aria-label={heroImageAlt || undefined} />
          )}
        </HeroScrollMotion>
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,9,11,0.98)_0%,rgba(8,9,11,0.88)_38%,rgba(8,9,11,0.38)_70%,rgba(8,9,11,0.22)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(8,9,11,0.62)_0%,rgba(8,9,11,0.8)_42%,rgba(8,9,11,0.98)_78%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-[var(--background-primary)] to-transparent" aria-hidden />
      <div className={`${motionStyles.heroAmbient} pointer-events-none absolute -left-32 top-1/3 -z-10 h-80 w-80 rounded-full bg-[var(--accent-glow)] blur-[120px]`} aria-hidden />
      <div className="pointer-events-none absolute right-[7%] top-[14%] -z-10 h-64 w-64 rounded-full bg-[rgba(59,130,246,0.08)] blur-[110px]" aria-hidden />

      <div className="mx-auto flex min-h-[650px] w-full max-w-[1560px] items-end px-5 pb-16 pt-28 sm:min-h-[720px] sm:px-8 sm:pb-20 sm:pt-32 md:min-h-[760px] lg:min-h-[820px] lg:items-center lg:px-12 lg:py-28 xl:min-h-[860px] 2xl:px-16">
        <div className={`${motionStyles.heroContent} max-w-[940px] 2xl:max-w-[1020px]`}>
          {subheading && <p className="mb-5 flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--accent-text)] sm:mb-6 sm:text-xs lg:text-[0.8rem]"><span className="h-px w-9 bg-[var(--accent-primary)] sm:w-10" aria-hidden />{subheading}</p>}
          {heading && <h1 className="max-w-[11ch] text-balance font-display text-[clamp(3.4rem,7.6vw,7.5rem)] font-semibold leading-[0.88] tracking-[-0.062em] text-[var(--text-primary)]">{heading}</h1>}
          {description && <p className="mt-6 max-w-[36rem] text-pretty text-[1rem] leading-7 text-white/68 sm:mt-7 sm:text-lg sm:leading-8 2xl:max-w-[40rem]">{description}</p>}
          <div className="mt-8 flex flex-col items-start gap-3 sm:mt-10 sm:flex-row">
            <Button href={primaryUrl} variant="cine-solid" withArrow className="min-h-12 !rounded-md !bg-[var(--accent-primary)] !px-7 !py-3.5 !font-semibold !text-[var(--background-primary)] motion-safe:transition-all motion-safe:duration-300 hover:-translate-y-0.5 hover:!bg-[var(--accent-hover)] hover:shadow-[0_12px_36px_rgba(59,130,246,0.2)]">{primaryLabel}</Button>
            {hasShowreel && (
              <Button href={showreelUrl} variant="cine-outline" className="min-h-12 gap-2 !rounded-md !border-white/25 !px-7 !py-3.5 !text-[var(--text-primary)] motion-safe:transition-all motion-safe:duration-300 hover:-translate-y-0.5 hover:!border-[var(--accent-primary)] hover:!text-[var(--accent-hover)]">
                <Play size={16} fill="currentColor" aria-hidden="true" /> {showreelLabel}
              </Button>
            )}
          </div>
          <span className="mt-10 block h-px w-24 bg-[var(--public-accent-gradient)] sm:mt-12 sm:w-28" aria-hidden />
        </div>
      </div>

      <div className={`${motionStyles.scrollCue} pointer-events-none absolute bottom-6 right-5 hidden items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/45 sm:flex sm:right-8 lg:bottom-8 lg:right-12 2xl:right-16`} aria-hidden="true">
        <span>Scroll</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/15 backdrop-blur-sm">
          <ArrowDown size={14} />
        </span>
      </div>
    </section>
  );
}
