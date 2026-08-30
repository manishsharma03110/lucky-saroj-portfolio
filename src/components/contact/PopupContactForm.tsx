"use client";

import { useActionState, useState, type ComponentType, type InputHTMLAttributes } from "react";
import { ArrowRight, CheckCircle2, Mail, Phone, ShieldCheck, SquarePen, Star, User, Wallet, Zap } from "lucide-react";
import { submitContactForm, type ContactFormState } from "@/lib/actions/contact";
import { BUDGET_RANGES } from "./contactConfig";
import { PopupContactSelect } from "./PopupContactSelect";

const initialState: ContactFormState = { status: "idle" };
const POPUP_PROJECT_TYPES = [
  "YouTube Video",
  "Reels / Shorts",
  "Brand / Commercial Video",
  "Social Media Ad",
  "Corporate Video",
  "Event / Wedding Video",
  "Podcast / Talking Head",
  "Music Video",
  "Documentary / Short Film",
  "Motion Graphics",
  "Other",
] as const;
const fieldClass = "min-h-[2.875rem] w-full rounded-[7px] border border-white/18 bg-black/20 py-2 pl-11 pr-4 text-xs text-white placeholder:text-white/55 transition-[border-color,box-shadow,background-color] hover:border-white/30 focus:border-[var(--accent-primary)]/80 focus:bg-[var(--surface-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/25 motion-reduce:transition-none sm:text-sm [@media(max-height:800px)]:sm:min-h-11";
const errorClass = "mt-1.5 text-xs text-red-300";
type PopupIcon = ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;

function PopupField({ id, name, label, icon: Icon, error, ...props }: { id: string; name: string; label: string; icon: PopupIcon; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return <div><label htmlFor={id} className="sr-only">{label}</label><div className="relative"><Icon size={17} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--accent-primary)]" aria-hidden={true} /><input id={id} name={name} aria-describedby={error ? `${id}-error` : undefined} className={fieldClass} {...props} /></div>{error && <p id={`${id}-error`} className={errorClass}>{error}</p>}</div>;
}

export function PopupContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);
  const [projectType, setProjectType] = useState("");
  const [budget, setBudget] = useState("");

  if (state.status === "success") {
    return <div className="flex min-h-[390px] flex-col items-center justify-center px-6 py-14 text-center" role="status" aria-live="polite"><span className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--accent-primary)]/45 bg-[var(--accent-primary)]/10"><CheckCircle2 size={32} className="text-[var(--accent-primary)]" aria-hidden="true" /></span><h3 className="mt-6 font-display text-3xl font-semibold text-white">Message sent</h3><p className="mt-3 max-w-md text-sm leading-6 text-white/65">{state.message}</p></div>;
  }

  return (
    <form action={formAction} className="relative -mt-px space-y-2 bg-[linear-gradient(to_bottom,var(--background-primary)_0%,var(--background-primary)_4rem)] px-5 pb-4 pt-2 sm:px-7 sm:pb-5 [@media(max-height:800px)]:sm:space-y-1.5 [@media(max-height:800px)]:sm:pb-3" aria-label="Project inquiry form">
      <input type="hidden" name="videoType" value={projectType} />
      <input type="hidden" name="budgetRange" value={budget || "Let's Discuss"} />
      <PopupField id="popup-name" name="name" label="Your Name" icon={User} placeholder="Your Name" autoComplete="name" required maxLength={120} error={state.fieldErrors?.name} />
      <PopupField id="popup-email" name="email" label="Your Email" icon={Mail} placeholder="Your Email" type="email" autoComplete="email" required error={state.fieldErrors?.email} />
      <PopupField id="popup-phone" name="phone" label="Phone Number" icon={Phone} placeholder="Phone Number" type="tel" autoComplete="tel" required maxLength={20} error={state.fieldErrors?.phone} />
      <div><label htmlFor="popup-project-type" className="sr-only">Project Type</label><PopupContactSelect id="popup-project-type" name="projectType" placeholder="Project Type" options={POPUP_PROJECT_TYPES} onValueChange={setProjectType} describedBy={state.fieldErrors?.projectType ? "popup-project-type-error" : undefined} />{state.fieldErrors?.projectType && <p id="popup-project-type-error" className={errorClass}>{state.fieldErrors.projectType}</p>}</div>
      <div><label htmlFor="popup-budget" className="sr-only">Your Budget (Optional)</label><div className="relative"><Wallet size={17} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--accent-primary)]" aria-hidden="true" /><select id="popup-budget" value={budget} onChange={(event) => setBudget(event.target.value)} className={`${fieldClass} appearance-none`}><option value="">Your Budget (Optional)</option>{BUDGET_RANGES.map((option) => <option key={option} value={option} className="bg-[var(--surface-primary)] text-white">{option}</option>)}</select></div></div>
      <div><label htmlFor="popup-message" className="sr-only">Your Message</label><div className="relative"><SquarePen size={17} className="pointer-events-none absolute left-4 top-3.5 z-10 text-[var(--accent-primary)]" aria-hidden="true" /><textarea id="popup-message" name="message" rows={4} placeholder="Your Message" required maxLength={4000} aria-describedby={state.fieldErrors?.message ? "popup-message-error" : undefined} className={`${fieldClass} min-h-[5.5rem] resize-y py-3 [@media(max-height:800px)]:sm:min-h-[5.125rem]`} /></div>{state.fieldErrors?.message && <p id="popup-message-error" className={errorClass}>{state.fieldErrors.message}</p>}</div>
      {state.status === "error" && state.message && !state.fieldErrors && <p className="rounded-md border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-200" role="alert">{state.message}</p>}
      <button type="submit" disabled={pending} className="group flex min-h-12 w-full items-center justify-center gap-2.5 rounded-[7px] bg-[linear-gradient(110deg,var(--accent-primary),var(--accent-active))] px-5 py-2.5 text-xs font-semibold uppercase text-white shadow-[0_8px_26px_rgba(59,130,246,0.18)] transition-[filter,box-shadow,transform] hover:-translate-y-px hover:brightness-110 hover:shadow-[0_10px_32px_rgba(59,130,246,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-hover)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background-primary)] disabled:pointer-events-none disabled:opacity-60 motion-reduce:transform-none motion-reduce:transition-none sm:text-sm [@media(max-height:800px)]:sm:min-h-11">{pending ? "Sending..." : "Let's Talk"}<ArrowRight size={17} className="shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" /></button>
      <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 pt-0.5 text-[0.625rem] text-white/58 sm:flex-nowrap sm:text-[0.65rem]" aria-label="Service benefits"><Trust icon={Zap} label="Quick response" /><span className="text-white/20" aria-hidden="true">•</span><Trust icon={ShieldCheck} label="Project details kept private" /><span className="text-white/20" aria-hidden="true">•</span><Trust icon={Star} label="Professional communication" /></div>
    </form>
  );
}

function Trust({ icon: Icon, label }: { icon: PopupIcon; label: string }) {
  return <span className="inline-flex items-center gap-1 whitespace-nowrap"><Icon size={14} className="shrink-0 text-[var(--accent-primary)]" aria-hidden={true} />{label}</span>;
}
