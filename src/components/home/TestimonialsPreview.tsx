import { Quote } from "lucide-react";
import { getPublishedTestimonials } from "@/lib/db/queries";
import type { HomePageContent } from "@/lib/db/home-content-service";

function Attribution({
  name,
  designation,
  company,
  profileImageUrl,
}: {
  name: string;
  designation?: string | null;
  company?: string | null;
  profileImageUrl?: string | null;
}) {
  const detail = [designation, company].filter(Boolean).join(" · ");

  return (
    <div className="flex min-w-0 items-center gap-3">
      {profileImageUrl && (
        <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[var(--surface-elevated)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profileImageUrl} alt={`${name} profile`} className="h-full w-full object-cover" />
        </span>
      )}
      <cite className="min-w-0 not-italic">
        <span className="block font-medium text-[var(--text-primary)]">{name}</span>
        {detail && <span className="mt-1 block text-sm text-[var(--text-muted)]">{detail}</span>}
      </cite>
    </div>
  );
}

export async function TestimonialsPreview({ content }: { content: HomePageContent }) {
  const testimonials = await getPublishedTestimonials(true);
  if (testimonials.length === 0) return null;

  const [featured, secondary] = testimonials.slice(0, 2);

  return (
    <section className="relative overflow-hidden bg-[var(--background-primary)] py-16 md:py-20 lg:py-24 2xl:py-28">
      <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[var(--accent-primary)]/[0.035] blur-3xl" aria-hidden />

      <div className="relative mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12 2xl:px-16">
        <div className={`grid items-stretch gap-5 ${secondary ? "lg:grid-cols-[minmax(0,1.62fr)_minmax(280px,0.78fr)] lg:gap-6" : ""}`}>
          <div className="min-w-0">
            <header className="mb-8 max-w-3xl sm:mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">{content.testimonialsEyebrow}</p>
              <h2 className="mt-4 text-[2.25rem] font-semibold leading-[1] tracking-[-0.045em] text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
                {content.testimonialsHeading}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                {content.testimonialsDescription}
              </p>
            </header>

            <article className="relative overflow-hidden rounded-[12px] border border-white/10 bg-[var(--surface-primary)] px-6 pb-7 pt-9 shadow-[0_24px_80px_rgba(0,0,0,0.2)] sm:px-9 sm:pb-9 sm:pt-11 lg:min-h-[340px] lg:px-11">
              <span className="absolute left-0 top-0 h-1 w-28 bg-[var(--accent-primary)]" aria-hidden />
              <span className="absolute bottom-5 right-5 h-7 w-7 border-b border-r border-white/15" aria-hidden />

              <Quote size={38} strokeWidth={1.25} className="text-[var(--accent-primary)]" aria-hidden />
              <blockquote className="mt-7 max-w-[32ch] text-[1.3rem] font-medium leading-[1.45] tracking-[-0.03em] text-[var(--text-primary)] sm:text-[1.6rem] lg:text-[2rem]">
                &ldquo;{featured.testimonialText}&rdquo;
              </blockquote>

              <footer className="mt-9 flex items-center gap-5 border-t border-white/10 pt-5 sm:mt-11">
                <span className="h-px w-10 shrink-0 bg-[var(--accent-primary)]/75" aria-hidden />
                <Attribution name={featured.clientName} designation={featured.designation} company={featured.company} profileImageUrl={featured.profileImageUrl} />
              </footer>
            </article>
          </div>

          {secondary && (
            <article className="relative flex flex-col justify-between overflow-hidden rounded-[12px] border border-white/[0.08] bg-[var(--background-secondary)] px-6 py-8 sm:px-8 lg:mt-16 lg:min-h-[390px] lg:px-7 lg:py-9 2xl:mt-20 2xl:min-h-[420px]">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <Quote size={25} strokeWidth={1.25} className="text-[var(--accent-primary)]/80" aria-hidden />
                  <span className="text-[0.65rem] font-medium tracking-[0.2em] text-[var(--text-muted)]" aria-hidden>02</span>
                </div>
                <blockquote className="mt-7 max-w-[30ch] text-xl font-medium leading-[1.55] tracking-[-0.025em] text-[var(--text-primary)] sm:text-[1.375rem]">
                  &ldquo;{secondary.testimonialText}&rdquo;
                </blockquote>
              </div>

              <footer className="mt-9 border-t border-white/[0.08] pt-5">
                <Attribution name={secondary.clientName} designation={secondary.designation} company={secondary.company} profileImageUrl={secondary.profileImageUrl} />
              </footer>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
