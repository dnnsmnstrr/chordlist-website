import assert from "node:assert/strict"
import test from "node:test"

import { faqSearchText, matchingFaqEntries } from "../lib/faq"
import { supportCopy as de } from "../locales/de"
import { supportCopy as en } from "../locales/en"

/** The question a query should find, named by a distinctive word in it. */
const englishQueries: ReadonlyArray<[query: string, questionContains: string]> = [
  ["import", "get my songs into"],
  ["ultimate guitar", "get my songs into"],
  ["missing songs", "not showing up"],
  ["icloud sync", "not showing up"],
  ["subscription", "did not unlock"],
  ["restore purchase", "did not unlock"],
  ["new iphone", "did not unlock"],
  ["money back", "refund"],
  ["charged twice", "refund"],
  ["shipping", "chordlink order"],
  ["nfc tag", "chordlink order"],
  ["crash", "report a bug"],
  ["feature request", "report a bug"],
]

const germanQueries: ReadonlyArray<[query: string, questionContains: string]> = [
  ["importieren", "Songs in"],
  ["synchronisieren", "tauchen nicht auf"],
  ["abo", "freigeschaltet"],
  ["wiederherstellen", "freigeschaltet"],
  ["geld zuruck", "Geld zurück"],
  ["versand", "chordlink-Bestellung"],
  ["absturz", "Fehler"],
]

test("every support question carries aliases, in both languages", () => {
  for (const [language, copy] of [
    ["en", en],
    ["de", de],
  ] as const) {
    for (const question of copy.questions) {
      assert.ok(
        (question.keywords?.length ?? 0) > 0,
        `${language}: "${question.question}" has no search aliases`,
      )
    }
  }
})

test("English queries reach the question they are about", () => {
  for (const [query, questionContains] of englishQueries) {
    const matches = matchingFaqEntries(en.questions, query)
    assert.ok(
      matches.some((match) => match.question.includes(questionContains)),
      `"${query}" did not find the question about "${questionContains}"`,
    )
  }
})

test("German queries reach the question they are about, umlauts optional", () => {
  for (const [query, questionContains] of germanQueries) {
    const matches = matchingFaqEntries(de.questions, query)
    assert.ok(
      matches.some((match) => match.question.includes(questionContains)),
      `"${query}" did not find the question about "${questionContains}"`,
    )
  }
})

test("a query with no bearing on support matches nothing", () => {
  assert.deepEqual(matchingFaqEntries(en.questions, "ukulele tuning"), [])
})

test("aliases are searched but never part of what a reader is shown", () => {
  const unlock = en.questions[2]
  assert.ok(unlock)
  assert.ok(faqSearchText(unlock).includes("subscription"))
  assert.ok(!unlock.answer.includes("subscription"))
})
