import type { MetadataRoute } from "next";
import { absoluteSiteUrl, resolveSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/"],
    },
    sitemap: absoluteSiteUrl("/sitemap.xml"),
    host: resolveSiteUrl().origin,
  };
}
