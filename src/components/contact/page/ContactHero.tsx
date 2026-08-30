"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const reveal = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } };

export function ContactHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[var(--background-primary)]" aria-labelledby="contact-title">
      <motion.div className="pointer-events-none absolute right-[8%] top-[18%] h-80 w-80 rounded-full bg-[var(--accent-primary)]/[0.08] blur-3xl" aria-hidden animate={reduceMotion ? { opacity: 0.45 } : { opacity: [0.35, 0.65, 0.35], scale: [1, 1.06, 1] }} transition={reduceMotion ? { duration: 0 } : { duration: 10, repeat: Infinity, ease: "easeInOut" }} />
      <div className="relative mx-auto grid w-full max-w-[1280px] gap-10 px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-16 lg:min-h-[38rem] lg:grid-cols-[minmax(0,0.78fr)_minmax(32rem,1.22fr)] lg:items-center lg:gap-12 lg:px-12 lg:pb-24 lg:pt-20">
        <motion.div initial={reduceMotion ? false : "hidden"} animate="visible" variants={reveal} transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--accent-primary)]" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">Contact</p>
          </div>
          <h1 id="contact-title" className="mt-6 max-w-[9ch] font-display text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[var(--text-primary)] sm:text-6xl lg:text-[4.25rem] xl:text-[4.6rem]">
            Let&rsquo;s create something <span className="text-[var(--accent-primary)]">impactful</span> together.
          </h1>
          <p className="mt-7 max-w-md text-base leading-8 text-[var(--text-secondary)]">
            Have a project in mind or want to discuss an idea? I&rsquo;d love to hear from you. Let&rsquo;s bring your story to life.
          </p>
        </motion.div>

        <motion.div className="min-w-0" initial={reduceMotion ? false : "hidden"} animate="visible" variants={reveal} transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}>
          <div className="group relative aspect-[16/10] overflow-hidden rounded-md border border-white/10 bg-[var(--surface-primary)] sm:aspect-[16/9] lg:aspect-[16/10]">
            <Image src="/uploads/About/about-hero-editor.png" alt="Video editor working at a professional editing workstation" fill preload sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover object-[52%_center] transition-transform duration-1000 ease-out group-hover:scale-[1.015] motion-reduce:transition-none" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--background-primary)]/45 via-transparent to-[var(--background-primary)]/10" aria-hidden />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--background-primary)]/55 via-transparent to-transparent" aria-hidden />
            <span className="absolute left-5 top-5 size-8 border-l border-t border-[var(--accent-primary)]/75" aria-hidden />
            <span className="absolute bottom-5 right-5 size-8 border-b border-r border-[var(--accent-primary)]/75" aria-hidden />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
