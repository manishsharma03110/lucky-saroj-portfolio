import Link from "next/link";
import { InstagramIcon, YoutubeIcon, LinkedinIcon, BehanceIcon, VimeoIcon } from "@/components/ui/BrandIcons";
import { Container } from "@/components/ui/Container";
import { getSiteSettings } from "@/lib/db/queries";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Me", href: "/about" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Experience", href: "/experience" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

const PORTFOLIO_LINKS = [
  { label: "YouTube", href: "/portfolio?category=youtube" },
  { label: "Reels", href: "/portfolio?category=reels" },
  { label: "Commercial", href: "/portfolio?category=commercial" },
  { label: "Cinematic", href: "/portfolio?category=cinematic" },
];

const SERVICE_LINKS = [
  { label: "Video Editing", href: "/services" },
  { label: "YouTube Editing", href: "/services" },
  { label: "Short Form Editing", href: "/services" },
  { label: "Cinematic Editing", href: "/services" },
  { label: "Motion Graphics", href: "/services" },
  { label: "Color Grading", href: "/services" },
];

export async function Footer() {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  const socials = [
    { icon: InstagramIcon, url: settings?.instagramUrl, label: "Instagram" },
    { icon: YoutubeIcon, url: settings?.youtubeUrl, label: "YouTube" },
    { icon: LinkedinIcon, url: settings?.linkedinUrl, label: "LinkedIn" },
    { icon: BehanceIcon, url: settings?.behanceUrl, label: "Behance" },
    { icon: VimeoIcon, url: settings?.vimeoUrl, label: "Vimeo" },
  ].filter((s) => s.url);

  return (
    <footer className="mt-24 border-t border-white/10 bg-[var(--color-ink)] text-white/70">
      <Container className="grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/20 font-display text-sm font-bold text-white">
              {settings?.logoText ?? "LS"}
            </span>
            <span className="font-display text-sm font-semibold uppercase tracking-wide text-white">
              {settings?.siteName ?? "Lucky Saroj"}
            </span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed">
            {settings?.footerDescription}
          </p>
          {socials.length > 0 && (
            <div className="mt-6 flex gap-3">
              {socials.map(({ icon: Icon, url, label }) => (
                <a
                  key={label}
                  href={url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          )}
        </div>

        <FooterColumn title="Quick Links" links={QUICK_LINKS} />
        <FooterColumn title="Portfolio" links={PORTFOLIO_LINKS} />
        <FooterColumn title="Services" links={SERVICE_LINKS} />
      </Container>

      <Container>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs text-white/50 sm:flex-row">
          <p>
            © {year} {settings?.siteName ?? "Lucky Saroj"}. All Rights Reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms &amp; Conditions
            </Link>
            <Link href="/admin/login" className="hover:text-white">
              Admin Login →
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-white">
        {title}
      </h3>
      <ul className="space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="transition-colors hover:text-[var(--color-accent)]">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
