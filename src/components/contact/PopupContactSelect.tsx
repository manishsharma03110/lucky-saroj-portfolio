"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, MessageSquare } from "lucide-react";

export function PopupContactSelect({ id, name, placeholder, options, describedBy, onValueChange }: { id: string; name: string; placeholder: string; options: readonly string[]; describedBy?: string; onValueChange?: (value: string) => void }) {
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
    const nextValue = options[index];
    setValue(nextValue);
    setActiveIndex(index);
    setOpen(false);
    onValueChange?.(nextValue);
    requestAnimationFrame(() => buttonRef.current?.focus());
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => (current + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
    } else if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      choose(activeIndex);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative min-w-0">
      <input type="hidden" name={name} value={value} />
      <button ref={buttonRef} id={id} type="button" role="combobox" aria-controls={listId} aria-expanded={open} aria-haspopup="listbox" aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined} aria-describedby={describedBy} aria-required="true" onClick={() => setOpen((current) => !current)} onKeyDown={handleKeyDown} className={`flex min-h-[2.875rem] w-full items-center gap-3 rounded-[7px] border bg-black/20 px-4 text-left text-xs transition-[border-color,box-shadow,background-color] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/25 motion-reduce:transition-none sm:text-sm [@media(max-height:800px)]:sm:min-h-11 ${open ? "border-[var(--accent-primary)]/80 bg-[var(--surface-primary)] shadow-[0_0_22px_rgba(59,130,246,0.11)]" : "border-white/18 hover:border-white/30"}`}>
        <MessageSquare size={17} className="shrink-0 text-[var(--accent-primary)]" aria-hidden="true" />
        <span className={value ? "min-w-0 flex-1 truncate text-white" : "min-w-0 flex-1 truncate text-white/55"}>{value || placeholder}</span>
        <ChevronDown size={17} className={`shrink-0 text-white/80 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && <div id={listId} role="listbox" aria-label={placeholder} className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-40 max-h-56 overflow-y-auto rounded-[9px] border border-[var(--accent-primary)]/40 bg-[var(--surface-primary)] p-1.5 shadow-[0_20px_55px_rgba(0,0,0,0.72)]">
        {options.map((option, index) => <button key={option} id={`${listId}-${index}`} type="button" tabIndex={-1} role="option" aria-selected={value === option} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(index)} className={`flex min-h-10 w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-white outline-none ${activeIndex === index ? "bg-[var(--accent-primary)]/14" : "hover:bg-white/[0.05]"}`}><span>{option}</span>{value === option && <Check size={15} className="text-[var(--accent-primary)]" aria-hidden="true" />}</button>)}
      </div>}
    </div>
  );
}
