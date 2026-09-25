"use client";
import { type ReactNode, useEffect, useRef } from "react";
import { useMotionPreference } from "./useMotionPreference";
import styles from "./DepthSurface.module.css";

export function DepthSurface({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const motion = useMotionPreference();
  const reset = () => {
    cancelAnimationFrame(frame.current);
    ref.current?.style.removeProperty("--depth-x");
    ref.current?.style.removeProperty("--depth-y");
  };
  useEffect(() => {
    if (!motion) reset();
    return () => cancelAnimationFrame(frame.current);
  }, [motion]);
  return <div ref={ref} data-depth-surface className={`${styles.surface} ${className}`}
    onPointerMove={(event) => {
      if (!motion || event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const node = event.currentTarget;
      const { clientX, clientY } = event;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const box = node.getBoundingClientRect();
        if (!box.width || !box.height) return;
        node.style.setProperty("--depth-x", `${Math.max(-3, Math.min(3, -((clientY - box.top) / box.height - .5) * 6))}deg`);
        node.style.setProperty("--depth-y", `${Math.max(-3, Math.min(3, ((clientX - box.left) / box.width - .5) * 6))}deg`);
      });
    }}
    onPointerLeave={reset} onPointerCancel={reset} onBlur={reset}>{children}</div>;
}
