import { Marquee } from "@/components/ui/Marquee";

const TERMS = [
  "VIDEO EDITING",
  "STORYTELLING",
  "MOTION GRAPHICS",
  "COLOR",
  "SOUND DESIGN",
  "SHORT FORM",
  "LONG FORM",
];

export function SkillsMarquee() {
  return (
    <div className="border-y border-[var(--cine-border)] bg-[var(--cine-void)] py-6">
      <Marquee durationSeconds={32}>
        {TERMS.map((term) => (
          <span
            key={term}
            className="cine-display flex items-center gap-16 text-2xl text-[var(--cine-text-secondary)] sm:text-3xl"
          >
            {term}
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--cine-accent)]" aria-hidden />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
