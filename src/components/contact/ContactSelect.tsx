"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

type ContactSelectProps = {
  id: string;
  name: string;
  placeholder: string;
  options: readonly string[];
  required?: boolean;
  describedBy?: string;
};

export function ContactSelect({ id, name, placeholder, options, required, describedBy }: ContactSelectProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, []);

  function choose(index: number) {
    setValue(options[index]);
    setActiveIndex(index);
    setOpen(false);
    requestAnimationFrame(() => buttonRef.current?.focus());
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setOpen(true);
      setActiveIndex((current) => (current + direction + options.length) % options.length);
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      choose(activeIndex);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative min-w-0" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
      <input type="hidden" name={name} value={value} />
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-controls={listId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={`flex min-h-[3.25rem] w-full items-center justify-between gap-3 rounded-md border px-4 text-left text-sm transition-[border-color,box-shadow,background-color] duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/15 motion-reduce:transition-none ${open ? "border-[var(--accent-primary)] bg-[var(--surface-primary)] shadow-[0_0_18px_rgba(59,130,246,0.10)]" : "border-white/10 bg-[var(--surface-primary)] hover:border-white/20"}`}
      >
        <span className={value ? "min-w-0 truncate text-[var(--text-primary)]" : "min-w-0 truncate text-[var(--text-muted)]"}>{value || placeholder}</span>
        <ChevronDown size={17} className={`shrink-0 text-[var(--text-secondary)] transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180 text-[var(--accent-primary)]" : ""}`} aria-hidden />
      </button>

      {open && (
        <div id={listId} role="listbox" aria-label={placeholder} className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-50 max-h-60 overflow-y-auto rounded-md border border-[var(--accent-primary)]/35 bg-[var(--surface-primary)] p-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.55)]">
          {options.map((option, index) => (
            <button
              key={option}
              id={`${listId}-${index}`}
              type="button"
              tabIndex={-1}
              role="option"
              aria-selected={value === option}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(index)}
              className={`flex min-h-10 w-full items-center justify-between gap-3 rounded px-3 py-2 text-left text-sm text-[var(--text-primary)] outline-none transition-colors duration-150 motion-reduce:transition-none ${activeIndex === index ? "bg-[var(--accent-primary)]/12" : "hover:bg-white/[0.05]"}`}
            >
              <span>{option}</span>
              {value === option && <Check size={15} className="shrink-0 text-[var(--accent-primary)]" aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
