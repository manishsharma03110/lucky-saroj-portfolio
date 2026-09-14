"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./RouteTransition.module.css";

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <div key={pathname} className={styles.route}>{children}</div>;
}
