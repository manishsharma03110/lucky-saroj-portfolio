"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  parseContactOptionsConfig,
  type ContactOptionGroup,
  type ContactOptionsConfig,
} from "@/lib/contact/contact-options-config";

const GROUPS: { key: ContactOptionGroup; title: string; description: string }[] = [
  { key: "budgetRanges", title: "Budget ranges", description: "Used by the full contact form and contact popup." },
  { key: "videoTypes", title: "Video types", description: "Used by the full contact form." },
  { key: "projectTimelines", title: "Project timelines", description: "Used by the full contact form." },
  { key: "popupProjectTypes", title: "Popup project types", description: "Used by the site-wide contact popup." },
];

function nextId(group: ContactOptionGroup) {
  return `${group}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ContactOptionsEditor({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const [config, setConfig] = useState<ContactOptionsConfig>(() => parseContactOptionsConfig(defaultValue));
  const serialized = useMemo(() => JSON.stringify(config), [config]);

  function updateGroup(group: ContactOptionGroup, updater: (items: ContactOptionsConfig[ContactOptionGroup]) => ContactOptionsConfig[ContactOptionGroup]) {
    setConfig((current) => ({ ...current, [group]: updater(current[group]) }));
  }

  return (
    <div className="space-y-5 rounded-xl border border-white/10 bg-[#0d0f13] p-4 sm:p-5">
      <input type="hidden" name={name} value={serialized} />
      <div>
        <p className="text-sm font-semibold text-[#f5f7fa]">Contact form select options</p>
        <p className="mt-1 text-xs leading-5 text-[#9298a3]">Edit labels, enable or disable choices, change their order, or add and remove options. Disabled choices stay in CMS but are hidden from visitors.</p>
      </div>

      <div className="space-y-5">
        {GROUPS.map((group) => (
          <section key={group.key} className="rounded-xl border border-white/8 bg-[#121419] p-4">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-[#f5f7fa]">{group.title}</h4>
                <p className="mt-1 text-xs text-[#626975]">{group.description}</p>
              </div>
              <button
                type="button"
                onClick={() => updateGroup(group.key, (items) => [...items, { id: nextId(group.key), label: "New option", enabled: true }])}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#3b82f6]/35 bg-[#3b82f6]/10 px-3 text-xs font-semibold text-[#60a5fa] hover:bg-[#3b82f6]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa]"
              >
                <Plus size={14} aria-hidden="true" /> Add option
              </button>
            </div>

            <div className="space-y-2">
              {config[group.key].map((option, index) => (
                <div key={option.id} className="grid gap-2 rounded-lg border border-white/7 bg-[#08090b] p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-[#9298a3]">
                    <input
                      type="checkbox"
                      checked={option.enabled}
                      onChange={(event) => updateGroup(group.key, (items) => items.map((item) => item.id === option.id ? { ...item, enabled: event.target.checked } : item))}
                      className="h-4 w-4 accent-[#3b82f6]"
                    />
                    Enabled
                  </label>

                  <input
                    type="text"
                    value={option.label}
                    maxLength={120}
                    aria-label={`${group.title} option ${index + 1}`}
                    onChange={(event) => updateGroup(group.key, (items) => items.map((item) => item.id === option.id ? { ...item, label: event.target.value } : item))}
                    className="min-h-10 w-full rounded-lg border border-[#242832] bg-[#121419] px-3 text-sm text-[#f5f7fa] outline-none focus:border-[#60a5fa] focus:ring-2 focus:ring-[#3b82f6]/20"
                  />

                  <div className="flex items-center gap-1 sm:justify-end">
                    <button type="button" aria-label={`Move ${option.label} up`} disabled={index === 0} onClick={() => updateGroup(group.key, (items) => { const next = [...items]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; })} className="grid h-9 w-9 place-items-center rounded-lg text-[#9298a3] hover:bg-white/5 hover:text-white disabled:opacity-30"><ArrowUp size={15} aria-hidden="true" /></button>
                    <button type="button" aria-label={`Move ${option.label} down`} disabled={index === config[group.key].length - 1} onClick={() => updateGroup(group.key, (items) => { const next = [...items]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; return next; })} className="grid h-9 w-9 place-items-center rounded-lg text-[#9298a3] hover:bg-white/5 hover:text-white disabled:opacity-30"><ArrowDown size={15} aria-hidden="true" /></button>
                    <button type="button" aria-label={`Delete ${option.label}`} onClick={() => updateGroup(group.key, (items) => items.filter((item) => item.id !== option.id))} className="grid h-9 w-9 place-items-center rounded-lg text-[#9298a3] hover:bg-red-400/10 hover:text-red-300"><Trash2 size={15} aria-hidden="true" /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
