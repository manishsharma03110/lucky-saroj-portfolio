import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { getServices } from "@/lib/db/queries";

export async function ServicesPreview({ heading = "My Expertise" }: { heading?: string }) {
  const services = await getServices(true);

  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="mb-12 text-center">
          <p className="timecode mb-3">WHAT I DO</p>
          <h2 className="font-display text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
            {heading}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = (Icons[service.icon as keyof typeof Icons] as LucideIcon) ?? Icons.Clapperboard;
            return (
              <div
                key={service.id}
                className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-6 transition-shadow hover:shadow-md"
              >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                  <Icon size={20} />
                </span>
                <h3 className="font-display text-base font-semibold text-[var(--color-ink)]">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Button href="/contact">Let&rsquo;s Work Together</Button>
        </div>
      </Container>
    </section>
  );
}
