import type { Metadata } from "next";
import Image from "next/image";
import { ServicesShowcase } from "@/components/services/ServicesShowcase";
import { ProcessTimeline } from "@/components/services/ProcessTimeline";
import { ServicesTools } from "@/components/services/ServicesTools";
import { getAboutTools, getServices } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  const [services, tools] = await Promise.all([getServices(false), getAboutTools()]);
  const uniqueTools = tools.filter(
    (tool, index) => tools.findIndex((candidate) => candidate.name.trim().toLowerCase() === tool.name.trim().toLowerCase()) === index
  );
  return (
    <main className="overflow-hidden bg-[var(--background-primary)] text-[var(--text-primary)]">
      <section className="relative flex min-h-[35rem] items-center overflow-hidden border-b border-white/10 py-14 sm:min-h-[37rem] sm:py-20 lg:min-h-[39rem] lg:py-24">
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:76px_76px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_2%_52%,rgba(59,130,246,0.22),transparent_29%),linear-gradient(90deg,rgba(8,9,11,0.04),rgba(8,9,11,0.78)_55%,rgba(8,9,11,0.98))]" aria-hidden />
        <span className="pointer-events-none absolute left-5 top-8 h-9 w-9 border-l border-t border-[var(--accent-primary)]/75 sm:left-8 lg:left-12" aria-hidden />
        <span className="pointer-events-none absolute bottom-8 right-5 h-9 w-9 border-b border-r border-[var(--accent-primary)]/75 sm:right-8 lg:right-12" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-[1280px] gap-10 px-5 sm:px-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center md:gap-10 lg:gap-14 lg:px-12">
          <div>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]"><span className="h-px w-10 bg-current" aria-hidden />Services</p>
            <h1 className="mt-7 max-w-[12ch] font-display text-[clamp(2.75rem,5.3vw,5rem)] font-semibold leading-[0.96] tracking-[-0.05em]">How I can help tell your story</h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">From YouTube documentaries to fast-paced social reels, I offer end-to-end post-production so you can focus on creating — I’ll handle the edit.</p>
          </div>
          <div className="relative min-h-72 overflow-hidden border border-white/10 bg-[var(--background-secondary)] sm:min-h-96 md:min-h-[29rem]">
            <Image src="/uploads/About/about-hero-editor.png" alt="Video editor working at a desktop editing setup" fill preload sizes="(max-width: 767px) 100vw, 55vw" className="object-cover object-center" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,11,0.7),transparent_30%),linear-gradient(to_top,rgba(8,9,11,0.48),transparent_45%)]" aria-hidden />
            <span className="pointer-events-none absolute right-0 top-0 h-10 w-10 border-r border-t border-[var(--accent-primary)]/80" aria-hidden />
            <div className="absolute bottom-5 right-5 flex items-center gap-3 border border-white/15 bg-[var(--background-primary)]/90 px-4 py-3 backdrop-blur-sm"><span className="font-display text-2xl font-semibold text-[var(--accent-primary)]">{services.length}</span><span className="text-[0.65rem] uppercase leading-4 tracking-[0.16em] text-[var(--text-primary)]">Active<br />{services.length === 1 ? "service" : "services"}</span></div>
          </div>
        </div>
      </section>
      <ServicesShowcase services={services} />
      <ProcessTimeline />
      {uniqueTools.length > 0 && <ServicesTools tools={uniqueTools} />}
    </main>
  );
}
