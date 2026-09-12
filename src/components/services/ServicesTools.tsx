type Tool = { id: string; name: string };

function monogram(name: string) {
  const words = name.trim().split(/\s+/);
  return (words.length > 1 ? words.map((word) => word[0]).join("") : name.slice(0, 2)).slice(0, 2).toUpperCase();
}

export function ServicesTools({ tools, eyebrow, heading }: { tools: Tool[]; eyebrow: string; heading: string }) {
  const desktopColumns = tools.length <= 10 ? "lg:grid-cols-5" : "lg:grid-cols-6";

  return (
    <section className="bg-[var(--background-primary)] pb-12 pt-16 sm:pb-14 sm:pt-20 lg:pb-16 lg:pt-20" aria-labelledby="services-tools-title">
      <div className="mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12 2xl:px-16">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">{eyebrow}</p>
        <h2 id="services-tools-title" className="mt-4 font-display text-3xl font-semibold tracking-[-0.045em] text-[var(--text-primary)] sm:text-4xl">{heading}</h2>
        <ul className={`mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 ${desktopColumns}`}>
          {tools.map((tool) => (
            <li key={tool.id} className="group flex min-h-14 min-w-0 items-center gap-3 border-b border-white/10 px-1 py-3 text-left transition-colors duration-300 hover:text-[var(--accent-hover)] motion-reduce:transition-none">
              <span className="grid size-9 shrink-0 place-items-center text-xs font-bold tracking-[-0.01em] text-[var(--accent-primary)]">{monogram(tool.name)}</span>
              <span className="min-w-0 break-words text-sm leading-5 text-[var(--text-primary)]">{tool.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
