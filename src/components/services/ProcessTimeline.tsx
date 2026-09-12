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
  return <section className="border-y border-white/10 bg-[var(--background-secondary)] py-16 sm:py-20 lg:py-24" aria-labelledby="services-process-title">
    <div className="mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12 2xl:px-16">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">{eyebrow}</p>
      <h2 id="services-process-title" className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em] text-[var(--text-primary)] sm:text-5xl">{heading}</h2>
      <ol className="mt-10 grid grid-cols-1 border-t border-white/10 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
        {steps.map((item, index) => <li key={`${index}-${item.title}`} className="border-b border-white/10 py-6 sm:px-5 sm:odd:border-r lg:border-r lg:px-6 lg:last:border-r-0">
          <span className="text-xs font-semibold text-[var(--accent-primary)]">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="min-h-7 font-display text-lg font-semibold text-[var(--text-primary)]">{item.title}</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{item.description}</p>
        </li>)}
      </ol>
    </div>
  </section>;
}
