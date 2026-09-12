"use client";

import { type ReactNode, useEffect, useRef } from "react";
import styles from "./PageMotionBoundary.module.css";

export function PageMotionBoundary({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>(":scope > section, :scope > aside"));
    if (items.length === 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.setAttribute("data-motion-visible", "true"));
      return;
    }

    items.forEach((item, index) => {
      item.dataset.motionIndex = String(index % 4);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).setAttribute("data-motion-visible", "true");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -7% 0px" }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <main ref={ref} className={`${styles.boundary} ${className}`}>
      {children}
    </main>
  );
}
