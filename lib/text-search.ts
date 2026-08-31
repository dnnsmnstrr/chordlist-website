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

export type SearchMatchRange = {
  start: number
  /** Exclusive, as with String.prototype.slice. */
  end: number
}

/**
 * The folded form of a string, plus where each of its characters came from.
 *
 * `normalizeForSearch` cannot be reused here: NFD turns "ä" into two code points, so every offset
 * after it would be wrong. Folding one character at a time and recording its source index keeps a
 * position in the folded text translatable back into the original, which is what lets a query for
 * "kaufe" highlight the "Käufe" the reader is actually looking at.
 */
function foldWithSourceIndexes(text: string): { folded: string; sourceIndexes: number[] } {
  let folded = ""
  const sourceIndexes: number[] = []

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index] ?? ""
    const foldedCharacter = character
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLocaleLowerCase()

    for (const piece of foldedCharacter) {
      folded += piece
      sourceIndexes.push(index)
    }
  }

  return { folded, sourceIndexes }
}

/**
 * Where each token occurs in the text, as ranges into the original string.
 *
 * Overlapping and touching ranges are merged, so two tokens that meet in the middle of a word are
 * one highlight rather than two boxes with a seam.
 */
export function findSearchMatches(text: string, tokens: readonly string[]): SearchMatchRange[] {
  if (tokens.length === 0) return []

  const { folded, sourceIndexes } = foldWithSourceIndexes(text)
  const ranges: SearchMatchRange[] = []

  for (const token of tokens) {
    if (token === "") continue

    let from = folded.indexOf(token)
    while (from !== -1) {
      const start = sourceIndexes[from]
      const lastIndex = sourceIndexes[from + token.length - 1]
      if (start !== undefined && lastIndex !== undefined) ranges.push({ start, end: lastIndex + 1 })

      from = folded.indexOf(token, from + token.length)
    }
  }

  ranges.sort((left, right) => left.start - right.start)

  return ranges.reduce<SearchMatchRange[]>((merged, range) => {
    const previous = merged[merged.length - 1]
    if (previous && range.start <= previous.end) {
      previous.end = Math.max(previous.end, range.end)
      return merged
    }

    merged.push({ ...range })
    return merged
  }, [])
}
