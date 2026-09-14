"use client";

import { useEffect, useRef, useState } from "react";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function CountUpStat({
  target,
  label,
  fallback,
}: {
  target?: number | null;
  label: string;
  fallback: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(target != null ? "0" : fallback);

  useEffect(() => {
    if (target == null) return;
    const node = ref.current;
    if (!node) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      setDisplay(formatNumber(target));
      return;
    }

    let frame = 0;
    let started = false;
    const duration = 1050;

    const animate = (startTime: number) => {
      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(formatNumber(target * eased));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started) return;
        started = true;
        animate(performance.now());
        observer.disconnect();
      },
      { threshold: 0.45 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target]);

  return (
    <div ref={ref} className="border-white/10 py-4 odd:border-r sm:border-r sm:px-5 sm:py-5 sm:first:pl-0 sm:last:border-r-0">
      <dd className="text-[1.75rem] font-semibold tracking-[-0.04em] text-[var(--accent-primary)] lg:text-3xl" aria-label={fallback}>
        <span aria-hidden="true">{display}</span>
      </dd>
      <dt className="mt-1 text-[0.7rem] uppercase tracking-[0.16em] text-[var(--text-secondary)]">{label}</dt>
    </div>
  );
}
