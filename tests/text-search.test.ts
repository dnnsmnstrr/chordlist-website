import assert from "node:assert/strict"
import test from "node:test"

import { matchesSearchTokens, normalizeForSearch, searchTokens } from "../lib/text-search"

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
