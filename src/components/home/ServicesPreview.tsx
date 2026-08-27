import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { getServices } from "@/lib/db/queries";

// Note: despite living in components/home/, this component is currently
// only imported by the Services page — Home's own service-format section is
// EditingStyles.tsx. Left in this location/name to avoid an unrelated file
// move outside the approved Phase 4 scope.
export async function ServicesPreview({ heading = "Full Service Catalog" }: { heading?: string }) {
  // Dedicated Services page: show every active service, not just the
  // featured subset Home's preview used to show.
  const services = await getServices(false);

  return (
    <Section spacing="md" className="bg-[var(--cine-void)]">
      <Container>
        <SectionHeading
          eyebrow="00:01:00:00 — WHAT I OFFER"
          title={heading}
          className="mb-14"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = (Icons[service.icon as keyof typeof Icons] as LucideIcon) ?? Icons.Clapperboard;
            // When the last card is alone in the final row of the 3-column
            // desktop grid (i.e. total isn't a multiple of 3), center it
            // instead of leaving it stranded on the left.
            const isOrphan = index === services.length - 1 && services.length % 3 === 1;
            return (
              <Card
                key={service.id}
                className={
                  "border-[var(--cine-border)] bg-[var(--cine-surface)]" +
                  (isOrphan ? " lg:col-start-2" : "")
                }
              >
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-[var(--cine-radius-sm)] bg-[var(--cine-accent-soft)] text-[var(--cine-accent)]">
                  <Icon size={22} strokeWidth={1.5} />
                </span>
                <h3 className="cine-display text-lg text-[var(--cine-text-primary)]">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="cine-body mt-2 text-sm">{service.description}</p>
                )}
              </Card>
            );
          })}
        </div>

        {services.length === 0 && (
          <p className="cine-body text-sm">No active services yet.</p>
        )}
      </Container>
    </Section>
  );
}
