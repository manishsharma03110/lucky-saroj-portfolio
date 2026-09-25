"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);

function snapshot(): Theme { return document.documentElement.dataset.theme === "light" ? "light" : "dark"; }
function subscribe(notify: () => void) {
  const sync = (event: StorageEvent) => {
    if (event.key !== "portfolio-theme" && event.key !== null) return;
    document.documentElement.dataset.theme = event.newValue === "light" ? "light" : "dark";
    notify();
  };
  window.addEventListener("storage", sync);
  window.addEventListener("portfolio-theme-change", notify);
  return () => { window.removeEventListener("storage", sync); window.removeEventListener("portfolio-theme-change", notify); };
}
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, snapshot, (): Theme => "dark");
  const toggle = () => {
    const next = snapshot() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("portfolio-theme", next); } catch { /* In-memory switching remains available. */ }
    window.dispatchEvent(new Event("portfolio-theme-change"));
  };
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function ThemeToggle() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("ThemeToggle requires ThemeProvider");
  const light = context.theme === "light";
  return <button type="button" className="theme-toggle" onClick={context.toggle}
    aria-label="Light mode" aria-pressed={light} title={light ? "Switch to dark mode" : "Switch to light mode"}>
    {light ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
    <span>{light ? "Dark" : "Light"}</span>
  </button>;
}
