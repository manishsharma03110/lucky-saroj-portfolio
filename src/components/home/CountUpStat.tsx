"use client";

import { useEffect, useRef } from "react";

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
  const rootRef = useRef<HTMLDivElement | null>(null);
  const valueRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const valueNode = valueRef.current;
    const targetValue = target;

    if (!root || !valueNode || targetValue == null) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      valueNode.textContent = fallback;
      return;
    }

    let frameId = 0;
    let hasStarted = false;
    const duration = 1050;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasStarted) return;
        hasStarted = true;
        observer.disconnect();

        const startTime = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - (1 - progress) ** 3;
          valueNode.textContent = formatNumber(targetValue * eased);
          if (progress < 1) frameId = requestAnimationFrame(tick);
          else valueNode.textContent = fallback;
        };

        frameId = requestAnimationFrame(tick);
      },
      { threshold: 0.45 }
    );

    observer.observe(root);
    return () => {
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [target, fallback]);

  return (
    <div ref={rootRef} className="min-w-0 border-white/10 px-3 py-4 text-center odd:border-r sm:border-r sm:px-5 sm:py-5 sm:last:border-r-0">
      <dd className="text-[1.75rem] font-semibold tracking-[-0.04em] text-[var(--accent-primary)] lg:text-3xl" aria-label={fallback}>
        <span ref={valueRef} aria-hidden="true">{fallback}</span>
      </dd>
      <dt className="mt-1 text-[0.7rem] uppercase tracking-[0.16em] text-[var(--text-secondary)]">{label}</dt>
    </div>
  );
}
