import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/db/queries";
import { getAllPageSeo } from "@/lib/db/page-seo-service";
import { absoluteSiteUrl } from "@/lib/seo";

const STATIC_ROUTES = {
  home: "/",
  about: "/about",
  portfolio: "/portfolio",
  services: "/services",
  experience: "/experience",
  contact: "/contact",
} as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, pageSeo] = await Promise.all([getPublishedProjects(), getAllPageSeo()]);
  const staticEntries: MetadataRoute.Sitemap = pageSeo
    .filter((seo) => seo.robotsIndex)
    .map((seo) => {
      const path = STATIC_ROUTES[seo.pageKey];
      return {
        url: absoluteSiteUrl(path),
        changeFrequency: path === "/" || path === "/portfolio" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : path === "/portfolio" ? 0.9 : 0.7,
      };
    });

  const projectEntries: MetadataRoute.Sitemap = projects.map(({ project }) => ({
    url: absoluteSiteUrl(`/portfolio/${project.slug}`),
    lastModified: project.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticEntries, ...projectEntries];
}
