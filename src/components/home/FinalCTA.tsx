import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionHeading";

export function FinalCTA() {
  return (
    <Section spacing="lg" className="border-t border-[var(--cine-border)] bg-[var(--cine-void)]">
      <Container className="flex flex-col items-center text-center">
        <Eyebrow marker="rec" className="mb-7">
          00:06:00:00 — LET&rsquo;S TALK
        </Eyebrow>
        <h2 className="cine-display max-w-2xl text-4xl text-[var(--cine-text-primary)] sm:text-5xl lg:text-6xl">
          Have a story to tell?
        </h2>
        <p className="cine-display mt-1 max-w-2xl text-4xl text-[var(--cine-accent)] sm:text-5xl lg:text-6xl">
          Let&rsquo;s edit it.
        </p>
        <Button
          href="/contact"
          variant="cine-solid"
          withArrow
          className="!rounded-md !px-9 !py-4 mt-12"
        >
          Start a Project
        </Button>
      </Container>
    </Section>
  );
}
