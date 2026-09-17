"use client";

import { useState,type ReactNode } from "react";
type Tab="content"|"projects"|"settings"|"seo";
export function PageEditorTabs({content,projects,settings,seo}:{content:ReactNode;projects?:ReactNode;settings?:ReactNode;seo:ReactNode}){
  const [tab,setTab]=useState<Tab>("content");const tabs:[Tab,string,ReactNode|undefined][]=[["content","Content",content],["projects","Projects",projects],["settings","Settings",settings],["seo","SEO Settings",seo]];const available=tabs.filter(([, ,panel])=>panel!==undefined);
  return <div><div role="tablist" aria-label="Page editor" className="mb-6 flex flex-wrap gap-2 border-b border-white/10">{available.map(([key,label])=><button key={key} type="button" role="tab" aria-selected={tab===key} onClick={()=>setTab(key)} className={`px-4 py-3 text-sm font-medium ${tab===key?"border-b-2 border-[var(--accent-primary)] text-[var(--text-primary)]":"text-[var(--text-secondary)]"}`}>{label}</button>)}</div>{available.map(([key,,panel])=><div key={key} role="tabpanel" hidden={tab!==key}>{panel}</div>)}</div>;
}
