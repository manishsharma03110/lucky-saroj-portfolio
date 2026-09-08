const STEPS = [
  { step: "01", title: "Brief & Footage", desc: "Share your raw footage, goals and any reference edits." },
  { step: "02", title: "Rough Cut", desc: "A first pass structuring the story, pacing and key moments." },
  { step: "03", title: "Refine", desc: "Sound design, color and motion graphics layered in with your feedback." },
  { step: "04", title: "Deliver", desc: "Final export in the formats you need, ready to publish." },
];

export function ProcessTimeline() {
  return <section className="border-y border-white/10 bg-[var(--background-secondary)] py-16 sm:py-20 lg:py-24" aria-labelledby="services-process-title">
    <div className="mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12 2xl:px-16">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">How we work</p>
      <h2 id="services-process-title" className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em] text-[var(--text-primary)] sm:text-5xl">My Process</h2>
      <ol className="mt-10 grid grid-cols-1 border-t border-white/10 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
        {STEPS.map((item) => <li key={item.step} className="border-b border-white/10 py-6 sm:px-5 sm:odd:border-r lg:border-r lg:px-6 lg:last:border-r-0">
          <span className="text-xs font-semibold text-[var(--accent-primary)]">{item.step}</span>
          <h3 className="min-h-7 font-display text-lg font-semibold text-[var(--text-primary)]">{item.title}</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{item.desc}</p>
        </li>)}
      </ol>
    </div>
  </section>;
}
