"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { PopupContactForm } from "./PopupContactForm";

const SESSION_KEY = "contact-popup-shown";
export const CONTACT_POPUP_HERO_IMAGE = "/uploads/contact/contact-popup-hero.png";

export function ContactPopup() {
  const [open, setOpen] = useState(false);
  const [imageAvailable, setImageAvailable] = useState(true);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => restoreFocusRef.current?.focus());
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const timer = window.setTimeout(() => {
      restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpen(true);
      sessionStorage.setItem(SESSION_KEY, "1");
    }, 5000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>('input:not([type="hidden"]), button, textarea')?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')).filter((element) => !element.hasAttribute("hidden"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.24 }} className="fixed inset-0 z-[100] flex min-h-[100dvh] items-center justify-center overflow-hidden bg-black/88 p-3 backdrop-blur-md sm:p-4">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_50%,rgba(59,130,246,0.11),transparent_34%),radial-gradient(circle_at_72%_44%,rgba(59,130,246,0.10),transparent_36%)] blur-3xl" aria-hidden="true" />
          <motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="contact-popup-title" aria-describedby="contact-popup-description" initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.99 }} transition={{ duration: reduceMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }} className="relative max-h-[92dvh] w-[calc(100vw-24px)] max-w-[500px] overflow-x-hidden overflow-y-auto rounded-[18px] border border-white/15 bg-[var(--background-primary)] text-white shadow-[0_28px_90px_rgba(0,0,0,0.82),0_0_38px_rgba(59,130,246,0.12)] [scrollbar-color:var(--border-primary)_transparent] [scrollbar-width:thin] sm:max-h-[87dvh] sm:w-[calc(100vw-32px)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 hover:[&::-webkit-scrollbar-thumb]:bg-white/20" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={close} aria-label="Close contact form" className="absolute right-3.5 top-3.5 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/65 text-white shadow-[0_0_12px_rgba(255,255,255,0.05)] backdrop-blur-md transition-[border-color,background-color] hover:border-[var(--accent-primary)]/65 hover:bg-[var(--surface-primary)]/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] motion-reduce:transition-none"><X size={20} aria-hidden="true" /></button>
            <div className="relative min-h-[218px] overflow-hidden bg-[var(--surface-primary)] sm:min-h-[238px] [@media(max-height:800px)]:sm:min-h-[205px] [@media(max-height:700px)]:sm:min-h-[188px]">
              {imageAvailable && <Image src={CONTACT_POPUP_HERO_IMAGE} alt="" fill sizes="(max-width: 520px) calc(100vw - 24px), 500px" className="object-cover object-[center_44%]" onError={() => setImageAvailable(false)} />}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,5,7,0.88)_0%,rgba(3,5,7,0.38)_58%,rgba(3,5,7,0.16)_100%)]" aria-hidden="true" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--background-primary)_0%,rgba(8,9,11,0.96)_12%,rgba(8,9,11,0.72)_25%,rgba(8,9,11,0.18)_58%,rgba(8,9,11,0.14)_100%)]" aria-hidden="true" />
              <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-4 sm:px-7 sm:pb-5 [@media(max-height:800px)]:sm:pb-3.5">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-white/88">Get in touch</p>
                <h2 id="contact-popup-title" className="mt-1.5 max-w-[12ch] font-display text-[clamp(2.25rem,10vw,2.75rem)] font-bold uppercase leading-[0.84] tracking-[0] text-[var(--text-primary)] [@media(max-height:700px)]:sm:text-[2.25rem]">Let&apos;s talk<span className="relative mt-1 block w-max max-w-full -rotate-2 font-display text-[0.62em] font-medium italic normal-case leading-[0.92] text-[var(--accent-primary)] after:absolute after:-bottom-1 after:left-2 after:h-px after:w-[88%] after:-rotate-2 after:bg-[var(--accent-primary)]">About Your Project</span></h2>
                <p id="contact-popup-description" className="mt-3 max-w-[25rem] text-[0.72rem] leading-[1.45] text-white/72 [@media(max-height:700px)]:sm:mt-2 [@media(max-height:700px)]:sm:text-[0.68rem]">Have a project in mind? I&apos;d love to hear from you. Let&apos;s create something amazing together.</p>
              </div>
            </div>
            <PopupContactForm />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
