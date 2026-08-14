import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { getSiteSettings } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <section className="py-16 md:py-24">
      <Container>
        <p className="timecode mb-4">00:00:00:06 — LET&rsquo;S WORK TOGETHER</p>
        <h1 className="mb-12 font-display text-4xl font-bold text-[var(--color-ink)] sm:text-5xl">
          Have a project in mind?
        </h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr]">
          <ContactInfo
            email={settings?.contactEmail ?? "hello@luckysaroj.com"}
            phone={settings?.contactPhone ?? "+91 12345 67890"}
            location={settings?.location ?? "India"}
            availability={settings?.availability ?? "Freelance / Full-time / Remote"}
          />
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
