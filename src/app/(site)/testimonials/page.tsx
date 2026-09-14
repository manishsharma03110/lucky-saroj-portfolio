import type { Metadata } from "next";
import Image from "next/image";
import { Quote } from "lucide-react";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { PageMotionBoundary } from "@/components/ui/PageMotionBoundary";
import { getPublishedTestimonials, getSiteSettings } from "@/lib/db/queries";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return createPageMetadata({
    title: "Testimonials",
    description: "Read client feedback about Lucky Saroj's video editing, post-production and visual storytelling work.",
    path: "/testimonials",
    image: settings?.ogImageUrl,
    robotsIndex: true,
  });
}

export default async function TestimonialsPage() {
  const testimonials = await getPublishedTestimonials(false);

  return (
    <PageMotionBoundary className="bg-[var(--background-primary)] text-[var(--text-primary)]">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Testimonials" }]} />
      <section className="border-b border-white/10 py-14 sm:py-16 lg:py-24">
        <div className="mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12 2xl:px-16">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">Client perspective</p>
          <h1 className="mt-5 max-w-[12ch] font-display text-[clamp(2.75rem,5vw,5.25rem)] font-semibold leading-[0.96] tracking-[-0.052em]">The work, in their words.</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">Published feedback from clients across editing, post-production and story-driven video work.</p>
        </div>
      </section>
      {testimonials.length > 0 ? (
        <section className="py-14 sm:py-16 lg:py-24">
          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 sm:px-8 md:grid-cols-2 lg:px-12 2xl:px-16">
            {testimonials.map((testimonial, index) => (
              <article key={testimonial.id} className={`relative overflow-hidden rounded-[12px] border border-white/10 bg-[var(--surface-primary)] p-6 sm:p-8 ${index % 3 === 0 ? "md:col-span-2" : ""}`}>
                <Quote size={28} strokeWidth={1.25} className="text-[var(--accent-primary)]" aria-hidden />
                <blockquote className="mt-6 max-w-[42ch] text-xl font-medium leading-[1.55] tracking-[-0.025em] text-[var(--text-primary)] sm:text-2xl">&ldquo;{testimonial.testimonialText}&rdquo;</blockquote>
                <div className="mt-8 flex items-center gap-4 border-t border-white/10 pt-5">
                  {testimonial.profileImageUrl && <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/10"><Image src={testimonial.profileImageUrl} alt={`${testimonial.clientName} profile`} fill sizes="44px" className="object-cover" /></span>}
                  <div><p className="font-semibold text-[var(--text-primary)]">{testimonial.clientName}</p><p className="mt-1 text-sm text-[var(--text-muted)]">{[testimonial.designation, testimonial.company].filter(Boolean).join(" · ")}</p></div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </PageMotionBoundary>
  );
}
