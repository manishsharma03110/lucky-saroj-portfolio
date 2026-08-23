import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

/**
 * Consistent generous vertical rhythm for cinematic sections. Complements
 * the existing `Container` (which handles horizontal max-width/padding) —
 * use them together: `<Section><Container>...</Container></Section>`.
 * Not used by any existing page yet.
 */
export function Section({
  children,
  id,
  spacing = "lg",
  className,
}: {
  children: ReactNode;
  id?: string;
  spacing?: "sm" | "md" | "lg";
  className?: string;
}) {
  const spacingClasses = {
    sm: "py-12 md:py-16",
    md: "py-16 md:py-24",
    lg: "py-24 md:py-32",
  };

  return (
    <section id={id} className={cn(spacingClasses[spacing], className)}>
      {children}
    </section>
  );
}
