import type { Metadata } from "next";
import { ExperienceCapabilities } from "@/components/experience/ExperienceCapabilities";
import { ExperienceHero } from "@/components/experience/ExperienceHero";
import { ExperienceList } from "@/components/experience/ExperienceList";
import { Button } from "@/components/ui/Button";
import { getAboutSkills, getExperiences, getSiteSettings } from "@/lib/db/queries";
import { getPageContent } from "@/lib/db/page-content-service";
import { getPageSeo } from "@/lib/db/page-seo-service";
import { createCmsPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, settings] = await Promise.all([getPageSeo("experience"), getSiteSettings()]);
  return createCmsPageMetadata(seo, settings?.ogImageUrl);
}

export default async function ExperiencePage() {
  const [experiences, skills, page] = await Promise.all([getExperiences(), getAboutSkills(), getPageContent("experience")]);
  const copy = page.content;

  return (
    <main className="overflow-hidden bg-[var(--background-primary)] text-[var(--text-primary)]">
      <ExperienceHero
        experiences={experiences}
        eyebrow={copy.heroEyebrow}
        heading={copy.heroHeading}
        description={copy.heroDescription}
        heroImageUrl={copy.heroImageUrl}
        heroImageAlt={copy.heroImageAlt}
        primaryLabel={copy.heroPrimaryLabel}
        primaryUrl={copy.heroPrimaryUrl}
        secondaryLabel={copy.heroSecondaryLabel}
        secondaryUrl={copy.heroSecondaryUrl}
      />
      <ExperienceList experiences={experiences} />
      <ExperienceCapabilities skills={skills} />

      <section className="bg-[var(--background-primary)] py-14 sm:py-18 lg:py-20">
        <div className="relative mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12">
          <div className="relative grid gap-8 overflow-hidden border border-white/10 bg-[var(--surface-primary)] px-6 py-9 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_1px_auto] lg:items-center lg:gap-10 lg:px-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_50%,rgba(59,130,246,0.14),transparent_31%)]" aria-hidden />
            <div className="relative border-l border-[var(--accent-primary)]/65 pl-6 sm:pl-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">{copy.ctaEyebrow}</p>
              <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-[-0.045em] text-[var(--text-primary)] sm:text-4xl">{copy.ctaHeading}</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[var(--text-secondary)]">{copy.ctaDescription}</p>
            </div>
            <span className="relative hidden h-full w-px bg-[var(--accent-primary)]/45 lg:block" aria-hidden />
            <div className="relative flex flex-col gap-3 sm:flex-row lg:justify-end"><Button href={copy.ctaPrimaryUrl} variant="cine-solid" withArrow className="!rounded-md !px-7 !py-3.5">{copy.ctaPrimaryLabel}</Button><Button href={copy.ctaSecondaryUrl} variant="cine-outline" withArrow className="!rounded-md !px-7 !py-3.5">{copy.ctaSecondaryLabel}</Button></div>
          </div>
        </div>
      </section>
    </main>
  );
}
