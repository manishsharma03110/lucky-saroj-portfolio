import type { Metadata } from "next";
import Image from "next/image";
import { ServicesShowcase } from "@/components/services/ServicesShowcase";
import { ProcessTimeline } from "@/components/services/ProcessTimeline";
import { ServicesTools } from "@/components/services/ServicesTools";
import { getAboutTools, getServices, getSiteSettings } from "@/lib/db/queries";
import { getPageContent } from "@/lib/db/page-content-service";
import { getPageSeo } from "@/lib/db/page-seo-service";
import { createCmsPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, settings] = await Promise.all([getPageSeo("services"), getSiteSettings()]);
  return createCmsPageMetadata(seo, settings?.ogImageUrl);
}

export default async function ServicesPage() {
  const [services, tools, page] = await Promise.all([getServices(false), getAboutTools(), getPageContent("services")]);
  const copy = page.content;
  const uniqueTools = tools.filter(
    (tool, index) => tools.findIndex((candidate) => candidate.name.trim().toLowerCase() === tool.name.trim().toLowerCase()) === index
  );
  const processSteps = [1, 2, 3, 4].map((index) => ({
    title: copy[`process${index}Title`],
    description: copy[`process${index}Description`],
  }));
  const heroImageUrl = copy.heroImageUrl || "/uploads/About/about-hero-editor.png";
  const heroImageAlt = copy.heroImageAlt || "Video editor working at a desktop editing setup";
  const activeServiceLabel = services.length === 1
    ? (copy.activeServiceSingular || "Active service")
    : (copy.activeServicePlural || "Active services");

  return (
    <main className="overflow-hidden bg-[var(--background-primary)] text-[var(--text-primary)]">
      <section className="relative flex items-center overflow-hidden border-b border-white/10 py-12 sm:py-16 lg:py-20 2xl:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_3%_50%,var(--accent-glow),transparent_31%)] opacity-60" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-[1480px] gap-10 px-5 sm:px-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center md:gap-12 lg:gap-16 lg:px-12 2xl:gap-24 2xl:px-16">
          <div>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]"><span className="h-px w-10 bg-current" aria-hidden />{copy.heroEyebrow}</p>
            <h1 className="mt-7 max-w-[12ch] text-balance font-display text-[clamp(2.75rem,5.3vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.052em]">{copy.heroHeading}</h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">{copy.heroDescription}</p>
          </div>
          <div className="relative aspect-[16/11] overflow-hidden rounded-[10px] border border-white/10 bg-[var(--background-secondary)] sm:aspect-[16/10] md:aspect-[4/3]">
            <Image src={heroImageUrl} alt={heroImageAlt} fill preload sizes="(max-width: 767px) 100vw, 55vw" className="object-cover object-center" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,11,0.7),transparent_30%),linear-gradient(to_top,rgba(8,9,11,0.48),transparent_45%)]" aria-hidden />
            <div className="absolute bottom-5 right-5 border-l border-[var(--accent-primary)]/60 bg-[var(--background-primary)]/90 px-4 py-3 backdrop-blur-sm"><span className="font-display text-2xl font-semibold text-[var(--accent-primary)]">{services.length}</span><span className="ml-3 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-primary)]">{activeServiceLabel}</span></div>
          </div>
        </div>
      </section>
      <ServicesShowcase services={services} />
      <ProcessTimeline eyebrow={copy.processEyebrow} heading={copy.processHeading} steps={processSteps} />
      {uniqueTools.length > 0 && <ServicesTools tools={uniqueTools} />}
    </main>
  );
}
