import type { MetadataRoute } from "next"

import { getPublishedPosts } from "@/lib/blog"
import { siteConfig } from "@/lib/site-config"
import { defaultLanguage, dictionary, homeHref, languages } from "@/locales"

/** Matches the blog routes, so a scheduled post enters the sitemap when it goes live. */
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts()

  const pages: MetadataRoute.Sitemap = ["", "/docs", "/blog", "/faq", "/press", "/screens", "/privacy"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: path === "" ? "monthly" : path === "/blog" ? "weekly" : "yearly",
    priority: path === "" ? 1 : path === "/blog" ? 0.7 : 0.6,
  }))

  // The home page in every language other than the default, which is already "" above. Listed with
  // the same `alternates.languages` set the pages themselves advertise, so the sitemap and the
  // hreflang tags cannot disagree about which translations exist.
  const homeAlternates = Object.fromEntries(
    languages.map((language) => [dictionary(language).locale.htmlLang, `${siteConfig.url}${homeHref[language]}`]),
  )

  const translatedHomes: MetadataRoute.Sitemap = languages
    .filter((language) => language !== defaultLanguage)
    .map((language) => ({
      url: `${siteConfig.url}${homeHref[language]}`,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages: homeAlternates },
    }))

  const englishHome = pages[0]
  if (englishHome) englishHome.alternates = { languages: homeAlternates }

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.url}${post.href}`,
    lastModified: new Date(post.publishedISO),
    changeFrequency: "yearly",
    priority: 0.5,
  }))

  return [...pages, ...translatedHomes, ...postPages]
}
