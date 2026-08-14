"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
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
  return (
    <AnimatePresence>
      {open && (
        <motion.nav
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden border-t border-white/10 bg-[var(--color-ink)] lg:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1 px-6 py-4">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "block rounded-md px-3 py-3 text-base font-medium",
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
