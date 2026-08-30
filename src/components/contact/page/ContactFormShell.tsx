"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Send } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";

export function ContactFormShell({ projectCategories }: { projectCategories: string[] }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section aria-labelledby="contact-form-heading" className="min-w-0" initial={reduceMotion ? false : { opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }}>
      <div className="relative overflow-hidden rounded-lg border border-[var(--accent-primary)]/20 bg-[var(--background-primary)] p-5 shadow-[0_0_45px_rgba(59,130,246,0.035)] transition-[border-color,box-shadow] duration-500 hover:border-[var(--accent-primary)]/30 hover:shadow-[0_0_55px_rgba(59,130,246,0.06)] sm:p-8 lg:p-9 motion-reduce:transition-none">
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 bg-[var(--accent-primary)]/[0.04] blur-3xl" aria-hidden />
        <div className="relative mb-8 flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[var(--accent-primary)]/55 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] shadow-[0_0_22px_rgba(59,130,246,0.12)]"><Send size={20} strokeWidth={1.5} aria-hidden /></span>
          <div>
            <h2 id="contact-form-heading" className="font-display text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] sm:text-4xl">Send a Message</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)] sm:text-base">Tell me about your project.</p>
          </div>
        </div>
        <div className="relative min-w-0"><ContactForm projectCategories={projectCategories} /></div>
      </div>
    </motion.section>
  );
}
