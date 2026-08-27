import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionHeading";

export function ServicesCTA() {
  return (
    <Section spacing="sm" className="border-t border-[var(--cine-border)] bg-[var(--cine-void)]">
      <Container className="flex flex-col items-center text-center">
        <Eyebrow marker="rec" className="mb-6">
          00:04:00:00 — READY?
        </Eyebrow>
        <h2 className="cine-display max-w-xl text-3xl text-[var(--cine-text-primary)] sm:text-4xl lg:text-5xl">
          Ready to start your next edit?
        </h2>
        <p className="cine-body mt-4 max-w-md text-base">
          Tell me about your footage and what you need — I&rsquo;ll get back
          to you with next steps.
        </p>
        <Button
          href="/contact"
          variant="cine-solid"
          withArrow
          className="!rounded-md !px-8 !py-4 mt-10"
        >
          Book a Project
        </Button>
      </Container>
    </Section>
  );
}
