import Link from "next/link";
import { ArrowUpRight, CircleDot, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { BehanceIcon, InstagramIcon, LinkedinIcon, VimeoIcon, YoutubeIcon } from "@/components/ui/BrandIcons";
import { Container } from "@/components/ui/Container";
import { getServices, getSiteSettings } from "@/lib/db/queries";

const EXPLORE_LINKS = [
  { label: "Home", href: "/" }, { label: "About Me", href: "/about" },
  { label: "Portfolio", href: "/portfolio" }, { label: "Experience", href: "/experience" },
  { label: "Services", href: "/services" }, { label: "Contact", href: "/contact" },
];

export async function Footer() {
  const [settings, services] = await Promise.all([getSiteSettings(), getServices()]);
  const year = new Date().getFullYear();
  const siteName = settings?.siteName ?? "Lucky Saroj";
  const logoText = settings?.logoText ?? "LS";
  const expertise = services.slice(0, 6).map((service) => ({ label: service.name, href: "/services" }));
  const contactRows = [
    settings?.contactEmail ? { icon: Mail, label: "Email", value: settings.contactEmail, href: `mailto:${settings.contactEmail}` } : null,
    settings?.contactPhone ? { icon: Phone, label: "Phone", value: settings.contactPhone, href: `tel:${settings.contactPhone.replace(/[^\d+]/g, "")}` } : null,
    settings?.location ? { icon: MapPin, label: "Location", value: settings.location } : null,
    settings?.availability ? { icon: CircleDot, label: "Availability", value: settings.availability } : null,
  ].filter((row): row is NonNullable<typeof row> => Boolean(row));
  const socials = [
    { icon: InstagramIcon, url: settings?.instagramUrl, label: "Instagram" },
    { icon: YoutubeIcon, url: settings?.youtubeUrl, label: "YouTube" },
    { icon: LinkedinIcon, url: settings?.linkedinUrl, label: "LinkedIn" },
    { icon: BehanceIcon, url: settings?.behanceUrl, label: "Behance" },
    { icon: VimeoIcon, url: settings?.vimeoUrl, label: "Vimeo" },
    { url: settings?.twitterUrl, label: "X / Twitter" },
  ].filter((social) => social.url);

  return (
    <footer className="relative isolate overflow-hidden border-t border-white/10 bg-[var(--background-primary)] text-[var(--text-secondary)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-80 bg-[radial-gradient(circle_at_78%_0%,rgba(59,130,246,0.12),transparent_48%)]" aria-hidden="true" />

      <Container className="relative z-10 grid gap-10 py-14 sm:py-14 md:py-[3.75rem] lg:grid-cols-[minmax(0,1.85fr)_minmax(280px,1fr)] lg:items-center lg:gap-14 lg:py-[4.25rem]">
        <div className="relative z-10 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">Have a project in mind?</p>
          <h2 className="mt-5 max-w-[13ch] font-display text-[clamp(2.5rem,5vw,5rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-[var(--text-primary)] md:text-[clamp(2.5rem,4.6vw,4.55rem)]">
            <span className="block">Let&apos;s create</span>
            <span className="block">something</span>
            <span className="block text-[var(--accent-primary)]">worth watching.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--text-secondary)]">Share the project and what you want the final edit to communicate.</p>
          <Link href="/contact" className="group mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-[var(--accent-primary)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--background-primary)] transition-[background-color,box-shadow] duration-300 hover:bg-[var(--accent-hover)] hover:shadow-[0_0_24px_rgba(59,130,246,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background-primary)]">
            Start a project
            <ArrowUpRight size={17} aria-hidden="true" className="transition-transform duration-300 motion-reduce:transition-none group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>
        <div className="relative z-0 hidden self-stretch items-center justify-center lg:flex" aria-hidden="true">
          <span className="select-none font-display text-[clamp(10rem,18vw,18rem)] font-bold leading-none tracking-[-0.09em] text-white/[0.055]">{logoText}</span>
          <span className="absolute right-0 top-0 h-12 w-12 border-r border-t border-[var(--accent-primary)]/30" />
        </div>
      </Container>

      <Container className="relative"><div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" /></Container>

      <Container className="relative grid gap-10 py-11 sm:py-12 lg:grid-cols-[minmax(0,1.45fr)_minmax(180px,0.7fr)_minmax(180px,0.85fr)] lg:gap-12">
        <section aria-labelledby="footer-identity-title">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--accent-primary)]/40 bg-white/[0.025] font-display text-sm font-bold text-[var(--text-primary)]">{logoText}</span>
            <div>
              <h2 id="footer-identity-title" className="font-display text-base font-semibold uppercase tracking-[0.06em] text-[var(--text-primary)]">{siteName}</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Video Editor &amp; Visual Storyteller</p>
            </div>
          </div>
          {contactRows.length > 0 && <div className="mt-6 grid gap-2.5 sm:grid-cols-2" aria-label="Contact details">{contactRows.map((row) => <ContactRow key={row.label} {...row} />)}</div>}
        </section>
        <FooterNavigation title="Explore" label="Footer site navigation" links={EXPLORE_LINKS} />
        {expertise.length > 0 && <FooterNavigation title="Expertise" label="Footer services navigation" links={expertise} />}
      </Container>

      {socials.length > 0 && (
        <Container className="relative">
          <section className="border-t border-white/15 py-8" aria-labelledby="footer-social-title">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">Social presence</p>
                <h2 id="footer-social-title" className="mt-2 font-display text-xl font-semibold text-[var(--text-primary)]">Follow my work</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:justify-end">
                {socials.map(({ icon: Icon, url, label }) => (
                  <a key={label} href={url ?? undefined} target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-11 items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm text-[var(--text-primary)] transition-[border-color,background-color,color,transform] duration-300 motion-reduce:transition-none hover:-translate-y-px hover:border-[var(--accent-primary)]/55 hover:bg-[var(--accent-primary)]/[0.06] hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]">
                    <span className="inline-flex min-w-0 items-center gap-2.5">{Icon && <Icon size={15} aria-hidden="true" />}<span className="truncate">{label}</span></span>
                    <ArrowUpRight size={15} aria-hidden="true" className="shrink-0 transition-transform duration-300 motion-reduce:transition-none group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                ))}
              </div>
            </div>
          </section>
        </Container>
      )}

      <Container className="relative">
        <div className="flex flex-col gap-3 border-t border-white/10 py-4 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {siteName}. All rights reserved. <span className="text-white/25">·</span> Video Editor</p>
          <Link href="/admin/login" className="group inline-flex min-h-10 w-fit items-center gap-1.5 py-2 transition-colors hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]">Admin <ArrowUpRight size={13} aria-hidden="true" className="transition-transform duration-300 motion-reduce:transition-none group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
        </div>
      </Container>
    </footer>
  );
}

function ContactRow({ icon: Icon, label, value, href }: { icon: LucideIcon; label: string; value: string; href?: string }) {
  const content = <><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-white/10 bg-[var(--surface-primary)] text-[var(--accent-primary)] transition-colors group-hover:border-[var(--accent-primary)]/50" aria-hidden="true"><Icon size={16} /></span><span className="min-w-0"><span className="block text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">{label}</span><span className="mt-1 block break-words text-sm leading-5 text-[var(--text-primary)]">{value}</span></span></>;
  const className = "group flex min-h-16 items-center gap-3 rounded-md border border-white/10 bg-white/[0.015] p-3 transition-[border-color,background-color,transform] duration-300 motion-reduce:transition-none";
  return href ? <a href={href} className={`${className} hover:-translate-y-px hover:border-[var(--accent-primary)]/40 hover:bg-[var(--accent-primary)]/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]`}>{content}</a> : <div className={className}>{content}</div>;
}

function FooterNavigation({ title, label, links }: { title: string; label: string; links: { label: string; href: string }[] }) {
  return <nav aria-label={label}><h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">{title}</h2><ul className="mt-4 grid grid-cols-2 gap-x-6 sm:grid-cols-1">{links.map((link) => <li key={link.label}><Link href={link.href} className="group inline-flex min-h-9 items-center gap-2 py-1.5 text-sm text-[var(--text-primary)] transition-colors hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"><span className="h-px w-0 bg-[var(--accent-primary)] transition-[width] duration-300 motion-reduce:transition-none group-hover:w-3" aria-hidden="true" />{link.label}</Link></li>)}</ul></nav>;
}
