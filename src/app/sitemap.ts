import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/db/queries";
import { absoluteSiteUrl } from "@/lib/seo";

const STATIC_ROUTES = ["/", "/about", "/portfolio", "/services", "/experience", "/contact"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublishedProjects();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: absoluteSiteUrl(path),
    changeFrequency: path === "/" || path === "/portfolio" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/portfolio" ? 0.9 : 0.7,
  }));

  const projectEntries: MetadataRoute.Sitemap = projects.map(({ project }) => ({
    url: absoluteSiteUrl(`/portfolio/${project.slug}`),
    lastModified: project.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticEntries, ...projectEntries];
}
