"use client";
import { useEffect, useRef, type ReactNode } from "react";

export function HeroParallax({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: no-preference) and (pointer: fine)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (ref.current) ref.current.style.transform = query.matches
        ? `translate3d(0, ${Math.min(window.scrollY, 800) * 0.08}px, 0) scale(1.08)`
        : "";
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", schedule, { passive: true });
    query.addEventListener("change", schedule);
    update();
    return () => {
      window.removeEventListener("scroll", schedule);
      query.removeEventListener("change", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);
  return <div ref={ref} className="absolute inset-0">{children}</div>;
}
