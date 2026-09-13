"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const reveal = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } };

export function ContactHero({
  eyebrow = "Contact",
  titleBefore = "Let’s create something",
  titleAccent = "impactful",
  titleAfter = "together.",
  description = "Have a project in mind or want to discuss an idea? I’d love to hear from you. Let’s bring your story to life.",
  heroImageUrl,
  heroImageAlt = "Video editor working at a professional editing workstation",
}: {
  eyebrow?: string;
  titleBefore?: string;
  titleAccent?: string;
  titleAfter?: string;
  description?: string;
  heroImageUrl?: string | null;
  heroImageAlt?: string;
}) {
  const reduceMotion = useReducedMotion();
  const imageUrl = heroImageUrl || "/uploads/About/about-hero-editor.png";

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[var(--background-primary)]" aria-labelledby="contact-title">
      <motion.div className="pointer-events-none absolute right-[8%] top-[18%] h-80 w-80 rounded-full bg-[var(--accent-primary)]/[0.08] blur-3xl" aria-hidden animate={reduceMotion ? { opacity: 0.45 } : { opacity: [0.35, 0.65, 0.35], scale: [1, 1.06, 1] }} transition={reduceMotion ? { duration: 0 } : { duration: 10, repeat: Infinity, ease: "easeInOut" }} />
      <div className="relative mx-auto grid w-full max-w-[1480px] gap-10 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,0.86fr)_minmax(28rem,1.14fr)] lg:items-center lg:gap-16 lg:px-12 lg:py-24 2xl:px-16">
        <motion.div initial={reduceMotion ? false : "hidden"} animate="visible" variants={reveal} transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}>
          <div className="flex items-center gap-3"><span className="h-px w-10 bg-[var(--accent-primary)]" aria-hidden /><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">{eyebrow}</p></div>
          <h1 id="contact-title" className="mt-6 max-w-[13ch] text-balance font-display text-[clamp(2.75rem,5vw,5.25rem)] font-semibold leading-[0.96] tracking-[-0.052em] text-[var(--text-primary)]">
            {titleBefore} <span className="text-[var(--accent-primary)]">{titleAccent}</span> {titleAfter}
          </h1>
          <p className="mt-7 max-w-[38rem] text-base leading-8 text-[var(--text-secondary)] sm:text-lg">{description}</p>
        </motion.div>

        <motion.div className="min-w-0" initial={reduceMotion ? false : "hidden"} animate="visible" variants={reveal} transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}>
          <div className="group relative aspect-[16/11] overflow-hidden rounded-md border border-white/10 bg-[var(--surface-primary)] sm:aspect-[16/10] lg:aspect-[16/11]">
            <Image src={imageUrl} alt={heroImageAlt} fill preload sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover object-[52%_center] transition-transform duration-1000 ease-out group-hover:scale-[1.015] motion-reduce:transition-none" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--background-primary)]/35 via-transparent to-[var(--background-primary)]/10" aria-hidden />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--background-primary)]/50 via-transparent to-transparent" aria-hidden />
            <span className="absolute left-5 top-5 size-8 border-l border-t border-[var(--accent-primary)]/75" aria-hidden />
            <span className="absolute bottom-5 right-5 size-8 border-b border-r border-[var(--accent-primary)]/75" aria-hidden />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
