type Tool = { id: string; name: string };

function monogram(name: string) {
  const words = name.trim().split(/\s+/);
  return (words.length > 1 ? words.map((word) => word[0]).join("") : name.slice(0, 2)).slice(0, 2).toUpperCase();
}

export function ServicesTools({ tools }: { tools: Tool[] }) {
  const desktopColumns = tools.length <= 10 ? "lg:grid-cols-5" : "lg:grid-cols-6";

  return (
    <section className="bg-[var(--background-primary)] pb-12 pt-16 sm:pb-14 sm:pt-20 lg:pb-16 lg:pt-20" aria-labelledby="services-tools-title">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">Tools & technologies</p>
        <h2 id="services-tools-title" className="mt-4 font-display text-3xl font-semibold tracking-[-0.045em] text-[var(--text-primary)] sm:text-4xl">The tools behind the work.</h2>
        <ul className={`mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 ${desktopColumns}`}>
          {tools.map((tool) => (
            <li key={tool.id} className="group relative flex h-32 min-w-0 flex-col items-center justify-center overflow-hidden border border-white/10 bg-[var(--surface-primary)] px-3 py-4 text-center transition-colors duration-300 hover:border-[var(--accent-primary)]/45 motion-reduce:transition-none">
              <span className="grid size-11 shrink-0 place-items-center rounded-md border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 text-xs font-bold tracking-[-0.01em] text-[var(--accent-primary)] transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:transition-none">{monogram(tool.name)}</span>
              <span className="mt-3 line-clamp-2 min-h-10 max-w-full text-xs leading-5 text-[var(--text-primary)]">{tool.name}</span>
              <span className="absolute bottom-0 h-px w-10 bg-[var(--accent-primary)]/70 opacity-60 transition-[width,opacity] duration-300 group-hover:w-16 group-hover:opacity-100 motion-reduce:transition-none" aria-hidden />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
