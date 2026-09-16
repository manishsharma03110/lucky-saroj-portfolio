"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

type NavItem = { label: string; href: string };
const FALLBACK: NavItem[] = [
  { label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Portfolio", href: "/portfolio" },
  { label: "Services", href: "/services" }, { label: "Experience", href: "/experience" }, { label: "Contact", href: "/contact" },
];

function parse(value: string): NavItem[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return FALLBACK;
    const items = parsed.filter((item): item is NavItem => Boolean(item && typeof item === "object" && typeof (item as NavItem).label === "string" && typeof (item as NavItem).href === "string"));
    return items.length ? items : FALLBACK;
  } catch { return FALLBACK; }
}

export function NavigationLinksEditor({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [items, setItems] = useState<NavItem[]>(() => parse(defaultValue));
  const serialized = useMemo(() => JSON.stringify(items), [items]);
  const update = (index: number, patch: Partial<NavItem>) => setItems((current) => current.map((item, i) => i === index ? { ...item, ...patch } : item));
  const move = (index: number, delta: number) => setItems((current) => { const target = index + delta; if (target < 0 || target >= current.length) return current; const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next; });
  const remove = (index: number) => setItems((current) => current.filter((_, i) => i !== index));
  const add = () => setItems((current) => [...current, { label: "New link", href: "/" }]);

  return <div className="space-y-4 lg:col-span-2">
    <input type="hidden" name={name} value={serialized} />
    <div><p className="text-sm font-semibold text-[var(--text-primary)]">Primary navigation links</p><p className="mt-1 text-sm text-[var(--text-secondary)]">Add, remove, edit, or reorder links. The public header styling is unchanged.</p></div>
    <div className="space-y-3">{items.map((item, index) => <div key={`${index}-${item.href}`} className="grid gap-3 rounded-lg border border-white/10 p-4 md:grid-cols-[1fr_1.4fr_auto] md:items-end">
      <div><Label htmlFor={`nav-label-${index}`}>Label</Label><Input id={`nav-label-${index}`} value={item.label} maxLength={80} onChange={(event) => update(index, { label: event.target.value })} /></div>
      <div><Label htmlFor={`nav-href-${index}`}>URL</Label><Input id={`nav-href-${index}`} value={item.href} maxLength={300} onChange={(event) => update(index, { href: event.target.value })} /></div>
      <div className="flex gap-2"><Button type="button" variant="cine-outline" aria-label="Move link up" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={16} /></Button><Button type="button" variant="cine-outline" aria-label="Move link down" disabled={index === items.length - 1} onClick={() => move(index, 1)}><ArrowDown size={16} /></Button><Button type="button" variant="cine-outline" aria-label="Remove link" onClick={() => remove(index)}><Trash2 size={16} /></Button></div>
    </div>)}</div>
    <Button type="button" variant="cine-outline" onClick={add}><Plus size={16} /> Add New Link</Button>
  </div>;
}
