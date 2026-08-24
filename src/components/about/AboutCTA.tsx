import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionHeading";

export function AboutCTA() {
  return (
    <Section spacing="lg" className="border-t border-[var(--cine-border)] bg-[var(--cine-void)]">
      <Container className="flex flex-col items-center text-center">
        <Eyebrow className="mb-6">00:03:00:00 — NEXT STEP</Eyebrow>
        <h2 className="cine-display max-w-xl text-3xl text-[var(--cine-text-primary)] sm:text-4xl lg:text-5xl">
          Want to work together?
        </h2>
        <p className="cine-body mt-4 max-w-md text-base">
          I&rsquo;m always happy to talk through a new project, whatever
          stage it&rsquo;s at.
        </p>
        <Button
          href="/contact"
          variant="cine-solid"
          withArrow
          className="!rounded-md !px-8 !py-4 mt-10"
        >
          Get In Touch
        </Button>
      </Container>
    </Section>
  );
}
