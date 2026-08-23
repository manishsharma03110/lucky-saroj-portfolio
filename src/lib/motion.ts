import type { Variants } from "framer-motion";

// Restrained, purposeful motion only — no gimmicks. Every variant here is
// meant to be reused across future redesigned sections rather than each
// component inventing its own timing/easing.

export const CINE_EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: CINE_EASE },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: CINE_EASE },
  },
};

/** Reveals content from behind a moving mask — used for headings/media. */
export const revealMask: Variants = {
  hidden: { clipPath: "inset(0 0 100% 0)" },
  visible: {
    clipPath: "inset(0 0 0% 0)",
    transition: { duration: 0.7, ease: CINE_EASE },
  },
};

/** Wrap a list of children with this to stagger their `fadeUp`/`fadeIn` children. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/** Standard viewport trigger for scroll-linked reveals — fires once, slightly
 * before the element is fully in view, so motion feels anticipatory rather
 * than delayed. */
export const viewportOnce = { once: true, margin: "-80px 0px" } as const;
