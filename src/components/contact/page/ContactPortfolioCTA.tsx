"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

export function ContactPortfolioCTA() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section className="bg-[var(--background-primary)] pb-16 sm:pb-20" aria-labelledby="contact-portfolio-title" initial={reduceMotion ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}>
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12">
        <div className="group relative grid overflow-hidden rounded-lg border border-[var(--accent-primary)]/30 bg-[var(--surface-primary)] p-6 transition-[border-color,box-shadow] duration-500 hover:border-[var(--accent-primary)]/50 hover:shadow-[0_0_38px_rgba(59,130,246,0.08)] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-7 sm:p-8 motion-reduce:transition-none">
          <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_72%_65%,rgba(59,130,246,0.16)_0,transparent_24%),radial-gradient(circle,rgba(59,130,246,0.22)_1px,transparent_1.5px)] [background-position:center,70%_50%] [background-size:auto,18px_18px] [mask-image:linear-gradient(to_left,black,transparent_58%)]" aria-hidden />
          <span className="relative grid size-14 place-items-center rounded-full border border-[var(--accent-primary)]/65 text-[var(--accent-primary)] shadow-[0_0_22px_rgba(59,130,246,0.16)]"><Play size={20} fill="currentColor" aria-hidden /></span>
          <div className="relative mt-5 min-w-0 sm:mt-0">
            <h2 id="contact-portfolio-title" className="font-display text-2xl font-semibold tracking-[-0.035em] text-[var(--text-primary)]">Have a project to discuss?</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Explore the work and see how different stories have been shaped.</p>
          </div>
          <Link href="/portfolio" className="relative mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-[var(--accent-primary)]/55 px-6 py-3 text-sm font-semibold text-[var(--accent-hover)] transition-[background-color,border-color] duration-300 hover:border-[var(--accent-hover)] hover:bg-[var(--accent-primary)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] sm:mt-0 motion-reduce:transition-none">View My Work <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden /></Link>
        </div>
      </div>
    </motion.section>
  );
}
