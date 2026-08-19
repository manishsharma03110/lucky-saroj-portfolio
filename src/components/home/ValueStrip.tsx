import { Zap, Sparkle, HeartHandshake, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/Container";

const ITEMS = [
  { icon: Zap, title: "Engage", desc: "Capture attention" },
  { icon: Sparkle, title: "Inspire", desc: "Tell meaningful stories" },
  { icon: HeartHandshake, title: "Connect", desc: "Build strong emotions" },
  { icon: TrendingUp, title: "Convert", desc: "Drive real impact" },
];

export function ValueStrip() {
  return (
    <section className="border-y border-[var(--color-line)] bg-[var(--color-paper-dim)] py-14">
      <Container>
        <p className="timecode mb-8 text-center">I CREATE VIDEOS THAT</p>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {ITEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--color-accent)]">
                <Icon size={20} />
              </span>
              <h3 className="font-display text-sm font-semibold text-[var(--color-ink)]">{title}</h3>
              <p className="mt-1 text-xs text-[var(--color-muted)]">{desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
