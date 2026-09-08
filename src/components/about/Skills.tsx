import {
  Aperture,
  AudioLines,
  BookOpen,
  Clapperboard,
  Gauge,
  GraduationCap,
  Layers3,
  MonitorPlay,
  Palette,
  Scissors,
  Sparkles,
} from "lucide-react";

type Item = { id: string; name: string };

function iconForSkill(name: string) {
  const value = name.toLowerCase();
  if (value.includes("story")) return BookOpen;
  if (value.includes("sound") || value.includes("audio")) return AudioLines;
  if (value.includes("color")) return Palette;
  if (value.includes("motion") || value.includes("effect") || value.includes("ai")) return Sparkles;
  if (value.includes("education")) return GraduationCap;
  if (value.includes("pacing") || value.includes("rhythm")) return Gauge;
  if (value.includes("edit") || value.includes("cut")) return Scissors;
  return Clapperboard;
}

function iconForTool(name: string) {
  const value = name.toLowerCase();
  if (value.includes("premiere")) return MonitorPlay;
  if (value.includes("after effects")) return Layers3;
  if (value.includes("resolve") || value.includes("color")) return Palette;
  if (value.includes("photoshop")) return Aperture;
  if (value.includes("audition") || value.includes("audio")) return AudioLines;
  if (value.includes("cinema")) return Clapperboard;
  return null;
}

function monogram(name: string) {
  const words = name.trim().split(/\s+/);
  return (words.length > 1 ? words.map((word) => word[0]).join("") : name.slice(0, 2)).slice(0, 2).toUpperCase();
}

export function Skills({ biography, skills, tools }: { biography?: string | null; skills: Item[]; tools: Item[] }) {
  if (!biography && skills.length === 0 && tools.length === 0) return null;

  return (
    <section className="bg-[var(--background-primary)] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto grid w-full max-w-[1480px] gap-10 px-5 sm:px-8 md:grid-cols-2 lg:gap-16 lg:px-12 2xl:px-16">
        {biography && (
          <div className="md:col-span-2 lg:col-span-1 lg:pr-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">My story</p>
            <h2 className="mt-4 max-w-[12ch] font-display text-[clamp(2.35rem,3.3vw,3.25rem)] font-semibold leading-none tracking-[-0.045em] text-[var(--text-primary)]">Craft first. Technology in service of the story.</h2>
            <p className="mt-6 max-w-[680px] whitespace-pre-line text-[0.97rem] leading-7 text-[var(--text-secondary)]">{biography}</p>
          </div>
        )}

        {skills.length > 0 && (
          <div className="border-t border-white/10 pt-6 md:border-t-0 md:pt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">Skills</p>
            <ul className="mt-5 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {skills.map((skill) => {
                const Icon = iconForSkill(skill.name);
                return <li key={skill.id} className="flex min-h-12 min-w-0 items-center gap-3 border-b border-white/10 py-3 text-sm leading-5 text-[var(--text-primary)]"><span className="flex h-8 w-8 shrink-0 items-center justify-center text-[var(--accent-primary)]"><Icon size={17} strokeWidth={1.5} aria-hidden /></span><span className="min-w-0">{skill.name}</span></li>;
              })}
            </ul>
          </div>
        )}

        {tools.length > 0 && (
          <div className="border-t border-white/10 pt-6 md:border-t-0 md:pt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary)]">Tools I use</p>
            <ul className="mt-5 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {tools.map((tool) => {
                const Icon = iconForTool(tool.name);
                return <li key={tool.id} className="flex min-h-12 min-w-0 items-center gap-3 border-b border-white/10 py-3 text-sm leading-5 text-[var(--text-primary)]"><span className="flex h-8 w-8 shrink-0 items-center justify-center text-[0.65rem] font-bold text-[var(--accent-primary)]">{Icon ? <Icon size={17} strokeWidth={1.5} aria-hidden /> : monogram(tool.name)}</span><span className="min-w-0">{tool.name}</span></li>;
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
