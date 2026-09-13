export function ProcessTimeline({
  eyebrow = "How we work",
  heading = "My Process",
  steps = [
    { title: "Brief & Footage", description: "Share your raw footage, goals and any reference edits." },
    { title: "Rough Cut", description: "A first pass structuring the story, pacing and key moments." },
    { title: "Refine", description: "Sound design, color and motion graphics layered in with your feedback." },
    { title: "Deliver", description: "Final export in the formats you need, ready to publish." },
  ],
}: {
  eyebrow?: string;
  heading?: string;
  steps?: { title: string; description: string }[];
}) {
  return <section className="border-y border-white/10 bg-[var(--background-secondary)] py-14 sm:py-16 lg:py-24" aria-labelledby="services-process-title">
    <div className="mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12 2xl:px-16">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">{eyebrow}</p>
      <h2 id="services-process-title" className="mt-4 max-w-[14ch] font-display text-[clamp(2.25rem,3.2vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-[var(--text-primary)]">{heading}</h2>
      <ol className="mt-10 grid grid-cols-1 border-t border-white/10 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
        {steps.map((item, index) => <li key={`${index}-${item.title}`} className="border-b border-white/10 py-6 sm:px-5 sm:odd:border-r lg:border-r lg:px-6 lg:last:border-r-0">
          <span className="text-xs font-semibold tracking-[0.18em] text-[var(--accent-primary)]">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="mt-3 min-h-7 font-display text-xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">{item.title}</h3>
          <p className="mt-3 text-base leading-7 text-[var(--text-secondary)]">{item.description}</p>
        </li>)}
      </ol>
    </div>
  </section>;
}
