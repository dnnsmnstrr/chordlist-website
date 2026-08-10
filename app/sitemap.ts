import type { MetadataRoute } from "next"

import { getPublishedPosts } from "@/lib/blog"
import { siteConfig } from "@/lib/site-config"

/** Matches the blog routes, so a scheduled post enters the sitemap when it goes live. */
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts()

  const pages: MetadataRoute.Sitemap = ["", "/docs", "/blog", "/faq", "/press", "/screens", "/privacy"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: path === "" ? "monthly" : path === "/blog" ? "weekly" : "yearly",
    priority: path === "" ? 1 : path === "/blog" ? 0.7 : 0.6,
  }))

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.url}${post.href}`,
    lastModified: new Date(post.publishedISO),
    changeFrequency: "yearly",
    priority: 0.5,
  }))

  return [...pages, ...postPages]
}
