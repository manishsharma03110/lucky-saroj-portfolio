const STEPS = [
  { step: "01", title: "Brief & Footage", desc: "Share your raw footage, goals and any reference edits." },
  { step: "02", title: "Rough Cut", desc: "A first pass structuring the story, pacing and key moments." },
  { step: "03", title: "Refine", desc: "Sound design, color and motion graphics layered in with your feedback." },
  { step: "04", title: "Deliver", desc: "Final export in the formats you need, ready to publish." },
];

export function ProcessTimeline() {
  return <section className="border-y border-white/10 bg-[var(--background-secondary)] py-16 sm:py-20 lg:py-24" aria-labelledby="services-process-title">
    <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">How we work</p>
      <h2 id="services-process-title" className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em] text-[var(--text-primary)] sm:text-5xl">My Process</h2>
      <ol className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
        {STEPS.map((item, index) => <li key={item.step} className="relative">
          <div className="relative mb-5 flex items-center gap-3"><span className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full border border-[var(--accent-primary)] bg-[var(--background-secondary)] text-xs font-semibold text-[var(--accent-primary)]">{item.step}</span>{index < STEPS.length - 1 && <span className="absolute left-9 right-[-2.5rem] top-1/2 hidden h-px -translate-y-1/2 bg-white/10 lg:block" aria-hidden />}</div>
          <h3 className="min-h-7 font-display text-lg font-semibold text-[var(--text-primary)]">{item.title}</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{item.desc}</p>
        </li>)}
      </ol>
    </div>
  </section>;
}
