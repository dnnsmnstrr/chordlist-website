import { matchesSearchTokens, searchTokens } from "@/lib/text-search"

/**
 * The site-wide search: every page that has a search of its own, in one index.
 *
 * Each page's search still filters its own content in place — that is where a reader is looking,
 * so those results come first. This adds what the rest of the site has to say underneath, so a
 * question typed into /support can land on the docs passage or blog post that answers it.
 *
 * Pure and client-safe. The index itself is built on the server (lib/site-search-index.ts), because
 * blog posts are read from disk, and served per language by app/api/search/[language].
 */

export const siteSearchPages = ["docs", "faq", "support", "blog"] as const
export type SiteSearchPage = (typeof siteSearchPages)[number]

export type SiteSearchEntry = {
  page: SiteSearchPage
  href: string
  title: string
  /** Plain text: inline markup is stripped when the index is built. */
  text: string
  /** Words this entry also matches on, and that nothing renders. */
  keywords: readonly string[]
}

/** How many results from elsewhere are listed under a page's own. */
export const SITE_SEARCH_LIMIT = 5

/**
 * The entries matching a query, from every page but the one being searched, best first.
 *
 * Every word has to appear somewhere, as on each page's own search. A match in the title outranks
 * one only in the text or keywords, and otherwise the index order — page by page, in reading order —
 * decides, so results from one page stay together.
 */
export function searchSite(
  entries: readonly SiteSearchEntry[],
  query: string,
  options: { exclude?: SiteSearchPage; limit?: number } = {},
): SiteSearchEntry[] {
  const tokens = searchTokens(query)
  if (tokens.length === 0) return []

  return entries
    .filter((entry) => entry.page !== options.exclude)
    .filter((entry) => matchesSearchTokens(`${entry.title} ${entry.text} ${entry.keywords.join(" ")}`, tokens))
    .map((entry, order) => ({ entry, order, rank: matchesSearchTokens(entry.title, tokens) ? 0 : 1 }))
    .sort((left, right) => left.rank - right.rank || left.order - right.order)
    .slice(0, options.limit ?? SITE_SEARCH_LIMIT)
    .map(({ entry }) => entry)
}
