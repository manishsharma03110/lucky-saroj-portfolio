import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function PortfolioCTA() {
  return (
    <section className="relative overflow-hidden border-t border-[var(--cine-border)] bg-[var(--surface-primary)] py-14 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute bottom-0 right-[8%] h-64 w-64 rounded-full bg-[var(--accent-primary)]/[0.05] blur-3xl" aria-hidden />
      <Container>
        <div className="relative flex max-w-5xl flex-col items-start gap-8 border-l border-[var(--accent-primary)]/55 pl-6 sm:pl-9 md:flex-row md:items-end md:justify-between md:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--cine-accent)]">Next project</p>
            <h2 className="cine-display mt-4 max-w-3xl text-4xl text-[var(--cine-text-primary)] sm:text-5xl">
              Bring the next story into focus.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--text-secondary)]">Share the brief, the footage, or simply the idea. We can shape the next piece together.</p>
          </div>
          <Button href="/contact" variant="cine-solid" withArrow className="shrink-0 !rounded-md !px-8 !py-4">
            Start a Conversation
          </Button>
        </div>
      </Container>
    </section>
  );
}
