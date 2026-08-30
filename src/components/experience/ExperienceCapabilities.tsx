import { AudioLines, BookOpen, Clapperboard, Clock3, Film, GraduationCap, MessageSquare, Mic, ScanLine, Sparkles, WandSparkles } from "lucide-react";

type Skill = { id: string; name: string };

function iconForSkill(name: string) {
  const value = name.toLowerCase();
  if (value.includes("prompt")) return MessageSquare;
  if (value.includes("voice")) return Mic;
  if (value.includes("sound") || value.includes("audio")) return AudioLines;
  if (value.includes("story")) return BookOpen;
  if (value.includes("pacing") || value.includes("rhythm")) return Clock3;
  if (value.includes("education")) return GraduationCap;
  if (value.includes("visual effect")) return WandSparkles;
  if (value.includes("motion")) return ScanLine;
  if (value.includes("ai")) return Sparkles;
  if (value.includes("cinematic")) return Film;
  return Clapperboard;
}

export function ExperienceCapabilities({ skills }: { skills: Skill[] }) {
  if (skills.length === 0) return null;
  const centerFinalTile = skills.length % 5 === 1;
  return (
    <section className="border-t border-white/10 bg-[var(--background-secondary)] py-14 sm:py-18 lg:py-20" aria-labelledby="experience-capabilities-title">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12">
        <p id="experience-capabilities-title" className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">What I work across</p>
        <ul className="mt-8 grid grid-cols-1 gap-3 min-[430px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {skills.map((skill, index) => { const Icon = iconForSkill(skill.name); return <li key={skill.id} className={`group flex min-h-14 min-w-0 items-center gap-3 rounded-md border border-white/10 bg-[var(--surface-primary)] px-4 py-3 transition-colors duration-300 hover:border-[var(--accent-primary)]/40 hover:bg-[var(--surface-primary)] motion-reduce:transition-none ${centerFinalTile && index === skills.length - 1 ? "lg:col-start-3" : ""}`}><span className="grid size-8 shrink-0 place-items-center rounded border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"><Icon size={16} strokeWidth={1.6} aria-hidden /></span><span className="min-w-0 break-words text-sm text-[var(--text-primary)]">{skill.name}</span></li>; })}
        </ul>
      </div>
    </section>
  );
}
