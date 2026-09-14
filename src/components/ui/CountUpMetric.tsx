"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function splitMetric(value: string) {
  const normalized = value.trim();
  const match = normalized.match(/^([\d,.]+)(.*)$/);
  if (!match) return null;
  const numeric = Number(match[1].replace(/,/g, ""));
  if (!Number.isFinite(numeric)) return null;
  const decimals = match[1].includes(".") ? match[1].split(".")[1]?.length ?? 0 : 0;
  return { numeric, suffix: match[2] ?? "", decimals };
}

export function CountUpMetric({ value, className = "" }: { value: string; className?: string }) {
  const parsed = useMemo(() => splitMetric(value), [value]);
  const ref = useRef<HTMLElement>(null);
  const [display, setDisplay] = useState(parsed ? `0${parsed.suffix}` : value);

  useEffect(() => {
    if (!parsed || !ref.current) {
      setDisplay(value);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    const node = ref.current;
    let frame = 0;
    let started = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started) return;
        started = true;
        observer.disconnect();

        const duration = 1050;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = parsed.numeric * eased;
          const formatted = current.toLocaleString("en", {
            minimumFractionDigits: parsed.decimals,
            maximumFractionDigits: parsed.decimals,
          });
          setDisplay(`${formatted}${parsed.suffix}`);
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.45 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [parsed, value]);

  return (
    <dd ref={ref} aria-label={value} className={className}>
      {display}
    </dd>
  );
}
