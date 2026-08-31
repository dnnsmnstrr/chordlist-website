import { plainInlineText } from "@/lib/inline-markup"
import { matchesSearchTokens, searchTokens } from "@/lib/text-search"

export type FaqEntry = {
  question: string
  answer: string
  /**
   * Words the question should also match in a search, and that nothing renders.
   *
   * A reader with a broken purchase types "subscription", "money back", or "abo" — the words they
   * arrived with, not the ones the answer happens to use. Aliases are per language and per
   * question, in the locale files beside the wording they belong to, so translating them is part of
   * translating the page rather than a lookup table someone has to remember to widen.
   *
   * They are search terms, not claims: "subscription" belongs on the unlock answer even though the
   * purchase is one-time, because that is the word a reader who believes otherwise will type, and
   * the answer they land on is what corrects them.
   */
  keywords?: readonly string[]
  /**
   * Rendered under the answer. The href travels with the label because a translated answer points
   * at a translated target — /de/chordlink/terms rather than /chordlink/terms — so the two cannot
   * be split without pairing them again per language.
   */
  link?: { href: string; label: string }
}

/**
 * Everything a search may match an entry on, as one string.
 *
 * Inline markup is stripped first, so a <code> tag can never sit between a query and its match:
 * "songs folder" finds the answer that renders it as a menu path.
 */
export function faqSearchText(entry: FaqEntry): string {
  return plainInlineText(
    [entry.question, entry.answer, entry.link?.label ?? "", ...(entry.keywords ?? [])].join(" "),
  )
}

/** The entries matching a query, in their original order. A blank query matches all of them. */
export function matchingFaqEntries(entries: readonly FaqEntry[], query: string): readonly FaqEntry[] {
  const tokens = searchTokens(query)
  if (tokens.length === 0) return entries

  return entries.filter((entry) => matchesSearchTokens(faqSearchText(entry), tokens))
}
