import { getPublishedPosts } from "@/lib/blog"
import { siteConfig } from "@/lib/site-config"
import { blogCopy, locale } from "@/locales/en"

export const revalidate = 3600

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET() {
  const posts = await getPublishedPosts()
  const feedUrl = `${siteConfig.url}/blog/rss.xml`

  // Description only, not full content: the click-through to the site is the point.
  const items = posts
    .map((post) => {
      const url = `${siteConfig.url}${post.href}`
      const categories = post.tags.map((tag) => `      <category>${escapeXml(blogCopy.tags[tag])}</category>`)

      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <description>${escapeXml(post.description)}</description>`,
        `      <pubDate>${new Date(post.publishedISO).toUTCString()}</pubDate>`,
        ...categories,
        "    </item>",
      ].join("\n")
    })
    .join("\n")

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(blogCopy.metadata.feedTitle)}</title>`,
    `    <link>${siteConfig.url}/blog</link>`,
    `    <description>${escapeXml(blogCopy.metadata.description)}</description>`,
    `    <language>${locale.htmlLang}</language>`,
    `    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n")

  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  })
}
