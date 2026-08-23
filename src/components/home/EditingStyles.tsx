import { Film, Clapperboard, Briefcase, Camera, Sparkles, MonitorPlay } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { getCategories } from "@/lib/db/queries";

// Icon chosen per category name where a sensible match exists — purely
// presentational, no content invented (falls back to a generic film icon).
const ICONS: Record<string, typeof Film> = {
  youtube: MonitorPlay,
  reels: Clapperboard,
  commercial: Briefcase,
  cinematic: Camera,
  "motion-graphics": Sparkles,
  "short-films": Film,
};

export async function EditingStyles() {
  const categories = await getCategories();
  if (categories.length === 0) return null;

  return (
    <Section spacing="lg" className="bg-[var(--cine-surface)]">
      <Container>
        <SectionHeading
          eyebrow="00:02:10:00 — WHAT I EDIT"
          title="Every format, every platform"
          className="mb-14"
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => {
            const Icon = ICONS[category.slug] ?? Film;
            return (
              <Card
                key={category.id}
                hover={false}
                className="group flex flex-col items-center gap-3 border-[var(--cine-border)] bg-[var(--cine-void)] py-8 text-center transition-colors duration-300 hover:border-[var(--cine-accent)]"
              >
                <Icon
                  size={22}
                  strokeWidth={1.5}
                  className="text-[var(--cine-text-secondary)] transition-colors group-hover:text-[var(--cine-accent)]"
                />
                <span className="cine-eyebrow !text-[var(--cine-text-primary)] group-hover:!text-[var(--cine-accent)]">
                  {category.name}
                </span>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
