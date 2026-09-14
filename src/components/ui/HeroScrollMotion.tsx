"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { type ReactNode, useRef } from "react";

export function HeroScrollMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.035, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 0.94, 0.88]);

  return (
    <motion.div
      ref={ref}
      className="absolute inset-0 will-change-transform"
      style={reduceMotion ? undefined : { y, scale, opacity }}
    >
      {children}
    </motion.div>
  );
}
