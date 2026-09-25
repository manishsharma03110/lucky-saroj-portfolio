import Image from "next/image";
import styles from "./Hero.module.css";

import { Button } from "@/components/ui/Button";
import motionStyles from "@/components/ui/DynamicMotion.module.css";
import { resolveHeroImageUrl } from "@/lib/media/hero-image";

export function Hero({ heading, subheading, description, heroImageUrl, heroImageAlt, primaryLabel, primaryUrl, showreelLabel, showreelUrl, hasShowreel }: { heading:string; subheading:string; description:string; heroImageUrl?:string|null; heroImageAlt:string; primaryLabel:string; primaryUrl:string; showreelLabel:string; showreelUrl:string; hasShowreel:boolean; }) {
  const visualUrl = resolveHeroImageUrl(heroImageUrl);
  return (
    <section data-hero className={`${styles.hero} relative isolate overflow-hidden border-b border-white/10 bg-[var(--background-primary)]`}>
      <div data-hero-background className={`${styles.imageFrame} absolute inset-0 -z-20 origin-center overflow-hidden bg-[var(--surface-primary)]`} aria-hidden={heroImageAlt ? undefined : "true"}>
        <Image src={visualUrl} alt={heroImageAlt} fill loading="eager" fetchPriority="high" quality={75} sizes="100vw" className={styles.image} />
      </div>
      <div className={`${styles.overlay} pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(var(--background-rgb),0.98)_0%,rgba(var(--background-rgb),0.88)_38%,rgba(var(--background-rgb),0.38)_70%,rgba(var(--background-rgb),0.22)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(var(--background-rgb),0.62)_0%,rgba(var(--background-rgb),0.8)_42%,rgba(var(--background-rgb),0.98)_78%)]`} aria-hidden />
      <div className={`${styles.overlay} pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-[var(--background-primary)] to-transparent`} aria-hidden />
      
      <div className={`${styles.contentWrap} mx-auto flex min-h-[min(720px,calc(100svh-4rem))] w-full max-w-[1560px] items-end px-[clamp(1rem,5vw,2rem)] pb-[clamp(2.75rem,8vh,4rem)] pt-20 sm:min-h-[680px] sm:px-8 sm:pb-20 sm:pt-28 md:min-h-[720px] lg:min-h-[790px] lg:items-center lg:px-12 lg:py-28 xl:min-h-[840px] 2xl:min-h-[880px] 2xl:px-16`}>
        <div className={`${styles.copy} ${motionStyles.heroContent} max-w-[860px] 2xl:max-w-[980px]`}>
          {subheading&&<p className="mb-5 flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--accent-text)] sm:mb-6 sm:text-xs lg:text-[0.8rem]"><span className="h-px w-9 bg-[var(--accent-primary)] sm:w-10" aria-hidden/>{subheading}</p>}
          {heading&&<h1 className="max-w-[11ch] text-balance font-display text-[clamp(2.65rem,13vw,4.25rem)] sm:text-[clamp(3.15rem,7.4vw,7.5rem)] font-semibold leading-[0.89] tracking-[-0.062em] text-[var(--text-primary)] 2xl:text-[8rem]">{heading}</h1>}
          {description&&<p className="mt-5 max-w-[36rem] text-pretty text-[0.94rem] leading-6 sm:mt-7 sm:text-lg sm:leading-8 text-[var(--text-secondary)] 2xl:max-w-[40rem]">{description}</p>}
          <div className="mt-8 flex flex-col items-start gap-3 sm:mt-10 sm:flex-row"><Button href={primaryUrl} variant="cine-solid" withArrow className="min-h-12 !rounded-md !bg-[var(--accent-primary)] !px-6 !py-3 !font-semibold !text-white sm:px-7">{primaryLabel}</Button>{hasShowreel&&<Button href={showreelUrl} variant="cine-outline" className="min-h-12 gap-2 !rounded-md !border-white/35 !px-6 !py-3 !text-[var(--text-primary)] sm:px-7">{showreelLabel}</Button>}</div>
          <span className="mt-10 block h-px w-20 bg-[var(--public-accent-gradient)] sm:mt-12 sm:w-24" aria-hidden/>
        </div>
      </div>
      <a href="#home-selected-work" aria-label="Scroll to selected work" className={`${styles.scroll} ${motionStyles.scrollCue} absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-hover)] md:flex`}><span>Scroll</span><span aria-hidden="true">↓</span></a>
    </section>
  );
}
