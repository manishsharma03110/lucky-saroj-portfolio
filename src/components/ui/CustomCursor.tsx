"use client";

import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorLabel = null | "watch" | "play";

const CursorContext = createContext<{ setLabel: (label: CursorLabel) => void } | null>(null);
const CURSOR_MEDIA_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function subscribeToCursorMediaQuery(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(CURSOR_MEDIA_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getCursorMediaQuerySnapshot() {
  return window.matchMedia(CURSOR_MEDIA_QUERY).matches;
}

function getServerCursorMediaQuerySnapshot() {
  return false;
}

export function CustomCursorProvider({ children }: { children: ReactNode }) {
  const [label, setLabel] = useState<CursorLabel>(null);
  const enabled = useSyncExternalStore(
    subscribeToCursorMediaQuery,
    getCursorMediaQuerySnapshot,
    getServerCursorMediaQuerySnapshot
  );
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { damping: 30, stiffness: 400, mass: 0.5 });
  const springY = useSpring(y, { damping: 30, stiffness: 400, mass: 0.5 });
  const bodyClassAdded = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    document.body.classList.add("cine-cursor-active");
    bodyClassAdded.current = true;

    const handleMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", handleMove);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      if (bodyClassAdded.current) document.body.classList.remove("cine-cursor-active");
    };
  }, [enabled, x, y]);

  return (
    <CursorContext.Provider value={{ setLabel }}>
      {children}
      {enabled && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-[200] flex items-center justify-center"
          style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
        >
          <motion.div
            animate={{
              width: label ? 72 : 10,
              height: label ? 72 : 10,
              backgroundColor: label ? "var(--cine-accent)" : "rgba(245,244,242,0.9)",
            }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center rounded-full"
          >
            {label && <span className="cine-eyebrow !text-[0.6rem] !text-[var(--background-primary)]">{label.toUpperCase()}</span>}
          </motion.div>
        </motion.div>
      )}
    </CursorContext.Provider>
  );
}

export function useCursorLabel(label: Exclude<CursorLabel, null>) {
  const ctx = useContext(CursorContext);
  if (!ctx) return { onPointerEnter: undefined, onPointerLeave: undefined };
  return {
    onPointerEnter: () => ctx.setLabel(label),
    onPointerLeave: () => ctx.setLabel(null),
  };
}
