/**
 * docs/launch-copy.md, prepared for the admin page at /marketing-copy.
 *
 * The file is written to be read on GitHub, so its links are relative to `docs/`. On the site those
 * resolve to nothing, so they are rewritten before rendering: a social asset opens in the social
 * editor, which loads it by slug, and every other repository file opens on GitHub.
 */

export const marketingCopyPath = "docs/launch-copy.md"

const repositoryBlobUrl = "https://github.com/dnnsmnstrr/chordlist-website/blob/main"

/** Where a link written relative to `docs/` should point from the site. Absolute links are kept. */
export function resolveDocLink(href: string): string {
  if (/^([a-z][a-z0-9+.-]*:|#|\/)/i.test(href)) return href

  const [target = "", anchor] = href.split("#", 2)
  const segments = ["docs"]
  for (const part of target.split("/")) {
    if (part === "..") segments.pop()
    else if (part && part !== ".") segments.push(part)
  }
  const path = segments.join("/")
  const fragment = anchor ? `#${anchor}` : ""

  const socialAsset = /^content\/social\/([a-z0-9-]+)\.md$/.exec(path)
  if (socialAsset) return `/social/editor?slug=${socialAsset[1]}`

  return `${repositoryBlobUrl}/${path}${fragment}`
}

/**
 * Rewrites every inline Markdown link and drops the leading `# Title`, which the page sets as its
 * own heading. Link targets in this file never contain spaces or parentheses, which is what keeps
 * a pattern this simple correct.
 */
export function prepareMarketingCopy(source: string): string {
  return source
    .replace(/^# [^\n]*\n+/, "")
    .replace(/\]\(([^)\s]+)\)/g, (_, href: string) => `](${resolveDocLink(href)})`)
}
