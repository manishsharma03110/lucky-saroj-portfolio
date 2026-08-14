import { Mail, Phone, MapPin, Clock } from "lucide-react";

export function ContactInfo({
  email,
  phone,
  location,
  availability,
}: {
  email: string;
  phone: string;
  location: string;
  availability: string;
}) {
  const items = [
    { icon: Mail, label: "Email", value: email },
    { icon: Phone, label: "Phone", value: phone },
    { icon: MapPin, label: "Location", value: location },
    { icon: Clock, label: "Available For", value: availability },
  ];

  return (
    <div className="rounded-2xl bg-[var(--color-ink)] p-8 text-white">
      <p className="timecode mb-2 !text-white/50">LET&rsquo;S WORK TOGETHER</p>
      <h2 className="mb-3 font-display text-2xl font-bold">Have a project in mind?</h2>
      <p className="mb-8 text-sm leading-relaxed text-white/70">
        I&rsquo;m always open to discussing new projects, creative ideas or opportunities to
        be part of your visions.
      </p>
      <div className="space-y-5">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
              <Icon size={16} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>
              <p className="text-sm font-medium">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
