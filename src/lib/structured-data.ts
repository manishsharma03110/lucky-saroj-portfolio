import { absoluteSiteUrl } from "@/lib/seo";

export type PersonJsonLdInput = {
  name: string;
  jobTitle: string;
  sameAs?: Array<string | null | undefined>;
};

export function personJsonLd(input: PersonJsonLdInput) {
  const sameAs = (input.sameAs ?? []).map((value) => value?.trim()).filter((value): value is string => Boolean(value));
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: input.name,
    jobTitle: input.jobTitle,
    url: absoluteSiteUrl("/"),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function portfolioItemListJsonLd(projects: Array<{ title: string; slug: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: project.title,
      url: absoluteSiteUrl(`/portfolio/${project.slug}`),
    })),
  };
}

export function projectCreativeWorkJsonLd(input: {
  title: string;
  slug: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  clientName?: string | null;
}) {
  const image = input.thumbnailUrl?.trim() ? absoluteSiteUrl(input.thumbnailUrl) : undefined;
  const url = absoluteSiteUrl(`/portfolio/${input.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": input.videoUrl ? "VideoObject" : "CreativeWork",
    name: input.title,
    url,
    ...(input.description ? { description: input.description } : {}),
    ...(image ? { thumbnailUrl: image, image } : {}),
    ...(input.videoUrl ? { contentUrl: input.videoUrl } : {}),
    ...(input.createdAt ? { dateCreated: input.createdAt.toISOString() } : {}),
    ...(input.updatedAt ? { dateModified: input.updatedAt.toISOString() } : {}),
    creator: {
      "@type": "Person",
      name: "Lucky Saroj",
      url: absoluteSiteUrl("/"),
    },
    ...(input.clientName ? { about: input.clientName } : {}),
  };
}

export function servicesJsonLd(services: Array<{ name: string; description?: string | null }>) {
  return {
    "@context": "https://schema.org",
    "@graph": services.map((service) => ({
      "@type": "Service",
      name: service.name,
      ...(service.description ? { description: service.description } : {}),
      provider: {
        "@type": "Person",
        name: "Lucky Saroj",
        url: absoluteSiteUrl("/"),
      },
      areaServed: "Worldwide",
      url: absoluteSiteUrl("/services"),
    })),
  };
}
