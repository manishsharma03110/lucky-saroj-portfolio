import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function CTA() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="scrubber mb-14" />
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-[var(--color-ink)] px-8 py-16 text-center text-white sm:px-16">
          <p className="timecode !text-[var(--color-accent)]">LET&rsquo;S WORK TOGETHER</p>
          <h2 className="max-w-xl font-display text-3xl font-bold sm:text-4xl">
            Have a project in mind?
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-white/70">
            I&rsquo;m always open to discussing new projects, creative ideas or opportunities
            to be part of your vision.
          </p>
          <Button href="/contact">Send Me a Message</Button>
        </div>
      </Container>
    </section>
  );
}
