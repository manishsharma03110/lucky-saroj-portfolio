"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Clock3, Mail, MapPin, MessageCircle, Phone, Timer, UserRound, WalletCards } from "lucide-react";
import { BehanceIcon, InstagramIcon, LinkedinIcon, VimeoIcon, YoutubeIcon } from "@/components/ui/BrandIcons";

type SocialLink = { label: string; href?: string | null };

type ContactInfoCopy = {
  infoEyebrow: string;
  infoHeadingBefore: string;
  infoHeadingAccent: string;
  infoDescription: string;
  officialDetailsLabel: string;
  nameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  whatsappLabel: string;
  locationLabel: string;
  availabilityLabel: string;
  followLabel: string;
  workingTermsLabel: string;
  paymentTermsLabel: string;
  turnaroundTimeLabel: string;
};

export function ContactInfo({
  name, email, phone, whatsapp, location, availability, paymentTerms, turnaroundTime, socialLinks = [], copy,
}: {
  name: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  location?: string | null;
  availability?: string | null;
  paymentTerms?: string | null;
  turnaroundTime?: string | null;
  socialLinks?: SocialLink[];
  copy: ContactInfoCopy;
}) {
  const reduceMotion = useReducedMotion();
  const whatsappHref = whatsapp?.trim() ? (/^https?:\/\//i.test(whatsapp) ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, "")}`) : undefined;
  const items = [
    { icon: UserRound, label: copy.nameLabel, value: name },
    { icon: Mail, label: copy.emailLabel, value: email, href: email ? `mailto:${email}` : undefined },
    { icon: Phone, label: copy.phoneLabel, value: phone, href: phone ? `tel:${phone.replace(/[^+\d]/g, "")}` : undefined },
    { icon: MessageCircle, label: copy.whatsappLabel, value: whatsapp, href: whatsappHref, external: true },
    { icon: MapPin, label: copy.locationLabel, value: location },
    { icon: Clock3, label: copy.availabilityLabel, value: availability },
  ].filter((item) => Boolean(item.value?.trim()));
  const populatedSocialLinks = socialLinks.filter((item) => Boolean(item.href?.trim()));
  const workingTerms = [
    { icon: WalletCards, label: copy.paymentTermsLabel, value: paymentTerms },
    { icon: Timer, label: copy.turnaroundTimeLabel, value: turnaroundTime },
  ].filter((item) => Boolean(item.value?.trim()));
  const socialIcons = { Instagram: InstagramIcon, YouTube: YoutubeIcon, LinkedIn: LinkedinIcon, Behance: BehanceIcon, Vimeo: VimeoIcon };

  return (
    <motion.aside className="min-w-0 lg:py-12" initial={reduceMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}>
      <div className="flex items-center gap-3"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">{copy.infoEyebrow}</p><span className="h-px w-8 bg-[var(--accent-primary)]/65" aria-hidden /></div>
      <h2 id="contact-details-heading" className="mt-5 max-w-sm font-display text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-[var(--text-primary)]">{copy.infoHeadingBefore} <span className="text-[var(--accent-primary)]">{copy.infoHeadingAccent}</span></h2>
      <p className="mt-6 max-w-sm text-sm leading-7 text-[var(--text-secondary)] sm:text-base">{copy.infoDescription}</p>

      {items.length > 0 && (
        <motion.div className="mt-9" initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.08 }}>
          <div className="flex items-center gap-3"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">{copy.officialDetailsLabel}</p><span className="h-px w-8 bg-[var(--accent-primary)]/45" aria-hidden /></div>
          <div className="relative mt-3 border-y border-white/10 before:absolute before:bottom-5 before:left-5 before:top-5 before:w-px before:bg-gradient-to-b before:from-[var(--accent-primary)]/65 before:via-[var(--accent-primary)]/35 before:to-transparent">
            {items.map(({ icon: Icon, label, value, href, external }) => (
              <div key={label} className="group grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4 border-b border-white/10 py-4 last:border-b-0">
                <span className="relative z-10 grid size-10 place-items-center rounded-md border border-[var(--accent-primary)]/25 bg-[var(--surface-primary)] text-[var(--accent-primary)] transition-[border-color,box-shadow,transform] duration-200 group-hover:-translate-y-0.5 group-hover:border-[var(--accent-primary)]/60 group-hover:shadow-[0_0_18px_rgba(59,130,246,0.12)] motion-reduce:transition-none"><Icon size={17} strokeWidth={1.6} aria-hidden /></span>
                <div className="min-w-0"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>{href ? <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="mt-1.5 block break-words text-sm font-medium text-[var(--accent-hover)] transition-colors hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]">{value}</a> : <p className="mt-1.5 break-words text-sm font-medium leading-6 text-[var(--accent-hover)]">{value}</p>}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {populatedSocialLinks.length > 0 && (
        <motion.div className="relative mt-8 overflow-hidden border-t border-white/10 pt-7 before:pointer-events-none before:absolute before:-bottom-16 before:left-1/2 before:size-40 before:-translate-x-1/2 before:rounded-full before:bg-[var(--accent-primary)]/[0.04] before:blur-3xl" initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.14 }}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">{copy.followLabel}</p>
          <div className="relative mt-4 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {populatedSocialLinks.map(({ label, href }) => { const Icon = socialIcons[label as keyof typeof socialIcons]; return <a key={label} href={href!} target="_blank" rel="noopener noreferrer" className="group flex min-w-0 items-center gap-3 rounded-md border border-white/10 bg-white/[0.015] px-3 py-3 text-[var(--text-primary)] transition-[border-color,background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--accent-primary)]/55 hover:bg-[var(--accent-primary)]/[0.04] hover:shadow-[0_8px_24px_rgba(59,130,246,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] motion-reduce:transform-none motion-reduce:transition-none">{Icon ? <Icon size={16} className="shrink-0 text-[var(--accent-primary)]" aria-hidden /> : <span className="grid size-4 shrink-0 place-items-center text-[0.65rem] font-semibold text-[var(--accent-primary)]" aria-hidden>X</span>}<span className="min-w-0 flex-1 truncate text-xs font-medium">{label}</span><ArrowUpRight size={14} className="shrink-0 text-[var(--text-muted)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent-primary)] motion-reduce:transition-none" aria-hidden /></a>; })}
          </div>
        </motion.div>
      )}

      {workingTerms.length > 0 && (
        <motion.div className="mt-8 border-t border-white/10 pt-7" initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.18 }}>
          <div className="flex items-center gap-3"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">{copy.workingTermsLabel}</p><span className="h-px w-8 bg-[var(--accent-primary)]/45" aria-hidden /></div>
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {workingTerms.map(({ icon: Icon, label, value }) => <div key={label} className="group min-w-0 rounded-xl border border-white/10 bg-white/[0.015] p-4 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-px hover:border-[var(--accent-primary)]/45 hover:shadow-[0_8px_24px_rgba(59,130,246,0.07)] motion-reduce:transform-none motion-reduce:transition-none"><span className="grid size-9 place-items-center rounded-md border border-[var(--accent-primary)]/25 bg-[var(--surface-primary)] text-[var(--accent-primary)] transition-[border-color,box-shadow] duration-300 group-hover:border-[var(--accent-primary)]/55 group-hover:shadow-[0_0_16px_rgba(59,130,246,0.12)] motion-reduce:transition-none"><Icon size={16} strokeWidth={1.6} aria-hidden /></span><p className="mt-3 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p><p className="mt-1.5 break-words text-sm leading-6 text-[var(--text-primary)]">{value}</p></div>)}
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
}
