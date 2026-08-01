import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/site-config"

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/docs", "/faq", "/press", "/privacy"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: path === "" ? "monthly" : "yearly",
    priority: path === "" ? 1 : 0.6,
  }))
}
