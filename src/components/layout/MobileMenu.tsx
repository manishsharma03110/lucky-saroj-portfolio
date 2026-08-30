"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

export function MobileMenu({
  open,
  onClose,
  links,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  links: { label: string; href: string }[];
  pathname: string;
}) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (open) requestAnimationFrame(() => firstLinkRef.current?.focus());
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <AnimatePresence>
      {open && (
        <motion.nav
          id="mobile-navigation"
          initial={reduceMotion ? false : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeInOut" }}
          className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-white/10 bg-[var(--color-ink)] lg:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1 px-6 py-4">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    ref={link.href === "/" ? firstLinkRef : undefined}
                    href={link.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-3 py-3 text-base font-medium transition-colors",
                      active ? "text-[var(--color-accent)]" : "text-white/85 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2">
              <Link
                href="/contact"
                onClick={onClose}
                aria-label="Let's Talk — Contact"
                className="block rounded-full bg-[var(--color-accent)] px-4 py-3 text-center text-sm font-medium text-white"
              >
                Let&rsquo;s Talk
              </Link>
            </li>
          </ul>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
