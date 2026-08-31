import assert from "node:assert/strict"
import test from "node:test"

import { findSearchMatches, matchesSearchTokens, normalizeForSearch, searchTokens } from "../lib/text-search"

test("normalizing folds case, diacritics, and runs of whitespace", () => {
  assert.equal(normalizeForSearch("  Käufe   WIEDERherstellen \n"), "kaufe wiederherstellen")
})

test("a blank query has no tokens and therefore matches everything", () => {
  assert.deepEqual(searchTokens("   "), [])
  assert.equal(matchesSearchTokens("anything at all", searchTokens("   ")), true)
})

test("tokens are ANDed, so word order and distance do not matter", () => {
  const answer = "Open Settings and tap Restore Purchases on the screen that appears."
  assert.equal(matchesSearchTokens(answer, searchTokens("restore purchase")), true)
  assert.equal(matchesSearchTokens(answer, searchTokens("purchases settings")), true)
  assert.equal(matchesSearchTokens(answer, searchTokens("restore refund")), false)
})

test("a German reader finds the answer without typing the umlaut", () => {
  assert.equal(matchesSearchTokens("tippe auf „Käufe wiederherstellen“", searchTokens("kaufe")), true)
})

test("match ranges point back into the original text, umlauts included", () => {
  const text = "Tippe auf „Käufe wiederherstellen“."
  const [range, ...rest] = findSearchMatches(text, searchTokens("kaufe"))

  assert.deepEqual(rest, [])
  assert.ok(range)
  assert.equal(text.slice(range.start, range.end), "Käufe")
})

test("every occurrence of every token is found", () => {
  const text = "Settings → Songs Folder, then the songs folder again"
  const ranges = findSearchMatches(text, searchTokens("songs"))

  assert.deepEqual(
    ranges.map((range) => text.slice(range.start, range.end)),
    ["Songs", "songs"],
  )
})

test("tokens that meet in the middle of a word become one range", () => {
  const text = "wiederherstellen"
  const ranges = findSearchMatches(text, searchTokens("wieder herstellen"))

  assert.deepEqual(
    ranges.map((range) => text.slice(range.start, range.end)),
    ["wiederherstellen"],
  )
})

test("no tokens means no highlights", () => {
  assert.deepEqual(findSearchMatches("anything", searchTokens("")), [])
})
