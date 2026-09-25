"use client";
import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import styles from "./DynamicMotion.module.css";

export function MotionReveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    if (node.getBoundingClientRect().top <= window.innerHeight) return;
    node.dataset.revealPending = "true";
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      delete node.dataset.revealPending;
      observer.disconnect();
    }, { threshold: 0, rootMargin: "0px 0px 24px 0px" });
    observer.observe(node);
    return () => { observer.disconnect(); delete node.dataset.revealPending; };
  }, []);
  return <div ref={ref} className={`${styles.reveal} ${className}`} style={{ "--motion-delay": `${delay}ms` } as CSSProperties}>{children}</div>;
}
