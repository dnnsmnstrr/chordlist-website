import { Marked, type Tokens } from "marked"

import { siteConfig } from "@/lib/site-config"

/**
 * Renders trusted, repo-committed Markdown to HTML.
 *
 * The output is passed to `dangerouslySetInnerHTML` by `components/blog-markdown.tsx`,
 * and raw HTML in the source is passed through on purpose so an author can drop in a
 * `<picture>` or a sized `<img>`. That is safe only because blog posts are files in
 * this repository. Never feed this function user-submitted or fetched input — that
 * would need a sanitiser (`rehype-sanitize`) which we deliberately do not have.
 */

/** Turns "File and folder format" into "file-and-folder-format". */
export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function isExternal(href: string) {
  return /^https?:\/\//.test(href) && !href.startsWith(siteConfig.url)
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

const marked = new Marked({ gfm: true })

marked.use({
  renderer: {
    // Deep-linkable sections, matching the scroll-margin the docs page uses.
    // The post title is the page's <h1>, so a post's "##" is already the right
    // level. Clamp to 2 so a stray "#" cannot emit a second <h1>.
    heading({ tokens, depth }: Tokens.Heading) {
      const text = this.parser.parseInline(tokens)
      const level = Math.min(Math.max(depth, 2), 6)
      return `<h${level} id="${slugifyHeading(text)}">${text}</h${level}>\n`
    },

    // External links get the same treatment as the docs page's ExternalLink helper.
    link({ href, title, tokens }: Tokens.Link) {
      const text = this.parser.parseInline(tokens)
      const titleAttribute = title ? ` title="${escapeAttribute(title)}"` : ""
      const target = isExternal(href) ? ' target="_blank" rel="noopener noreferrer"' : ""
      return `<a href="${escapeAttribute(href)}"${titleAttribute}${target}>${text}</a>`
    },

    // A Markdown image title becomes the caption: ![alt](/path.png "caption")
    image({ href, title, text }: Tokens.Image) {
      const image =
        `<img src="${escapeAttribute(href)}" alt="${escapeAttribute(text)}"` +
        ` loading="lazy" decoding="async" />`

      if (!title) return image

      return `<figure>${image}<figcaption>${escapeAttribute(title)}</figcaption></figure>`
    },
  },
})

export function renderMarkdown(source: string) {
  return marked.parse(source, { async: false })
}
