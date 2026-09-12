"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { MobileMenu } from "./MobileMenu";
import motionStyles from "@/components/ui/DynamicMotion.module.css";

export function Header({
  logoText = "LS",
  logoImageUrl,
  siteName = "Lucky Saroj",
  roleLabel = "Video Editor",
  ctaLabel = "Let’s Talk",
  ctaUrl = "/contact",
  navLabels = {},
}: {
  logoText?: string;
  logoImageUrl?: string | null;
  siteName?: string;
  roleLabel?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  navLabels?: Partial<Record<"home" | "about" | "portfolio" | "services" | "experience" | "contact", string>>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navLinks = [
    { label: navLabels.home || "Home", href: "/" },
    { label: navLabels.about || "About", href: "/about" },
    { label: navLabels.portfolio || "Portfolio", href: "/portfolio" },
    { label: navLabels.services || "Services", href: "/services" },
    { label: navLabels.experience || "Experience", href: "/experience" },
    { label: navLabels.contact || "Contact", href: "/contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      requestAnimationFrame(() => menuButtonRef.current?.focus());
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className={cn("sticky top-0 z-50 text-white", motionStyles.glassHeader, scrolled && motionStyles.glassHeaderScrolled)}>
      <Container className="flex h-16 max-w-[1560px] items-center justify-between px-5 sm:h-[4.5rem] sm:px-8 lg:h-20 lg:px-12">
        <Link href="/" className={cn("flex min-h-11 items-center gap-3", motionStyles.logoLink)}>
          <span className={cn("flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border border-white/20 font-display text-sm font-bold", motionStyles.logoMark)}>
            {logoImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoImageUrl} alt={`${siteName} logo`} className="h-full w-full object-contain" />
            ) : (
              logoText
            )}
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-sm font-semibold uppercase tracking-wide">{siteName}</span>
            <span className="timecode !text-white/50">{roleLabel}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 xl:gap-9 lg:flex" aria-label="Primary">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-[0.9375rem] font-medium hover:text-[var(--color-accent)]",
                  motionStyles.navLink,
                  active ? cn("text-[var(--color-accent)]", motionStyles.navLinkActive) : "text-white/80"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Button href={ctaUrl} className="!px-5 !py-2.5 motion-safe:transition-transform motion-safe:duration-300 hover:-translate-y-0.5">{ctaLabel}</Button>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-md text-white transition-all duration-300 hover:bg-white/[0.04] hover:text-[var(--color-accent)] lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </Container>

      <MobileMenu open={open} onClose={() => setOpen(false)} links={navLinks} pathname={pathname} />
    </header>
  );
}
