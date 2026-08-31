/**
 * The matching behind the support page's question search.
 *
 * Two decisions, both about not making a reader guess how to phrase a query:
 *
 * - **Diacritics are folded**, so "kaufe" finds "Käufe". A German reader searching from a phone
 *   keyboard should not have to reproduce an umlaut to find the answer about their purchase.
 * - **Tokens are ANDed, not matched as a phrase**, so "restore purchase" finds an answer that says
 *   "Restore Purchases" three words after "restoring". Word order is the part people misremember.
 *
 * Kept apart from the component so it can be tested as what it is: string matching.
 */

/** Lower case, diacritics removed, whitespace collapsed. */
export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

/** The query's words, normalized. An empty or blank query has none. */
export function searchTokens(query: string): string[] {
  const normalized = normalizeForSearch(query)
  return normalized === "" ? [] : normalized.split(" ")
}

/** Whether every token appears somewhere in the text. No tokens matches everything. */
export function matchesSearchTokens(text: string, tokens: readonly string[]): boolean {
  if (tokens.length === 0) return true

  const haystack = normalizeForSearch(text)
  return tokens.every((token) => haystack.includes(token))
}
