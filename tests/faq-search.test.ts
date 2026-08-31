import assert from "node:assert/strict"
import test from "node:test"

import { faqSearchText, matchingFaqEntries } from "../lib/faq"
import { supportCopy as de } from "../locales/de"
import { faqCopy, supportCopy as en } from "../locales/en"

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

/** Both searchable lists, so neither can lose its aliases quietly. */
const searchableQuestions = [
  ["support (en)", en.questions],
  ["support (de)", de.questions],
  ["faq", faqCopy.questions],
] as const

const faqQueries: ReadonlyArray<[query: string, questionContains: string]> = [
  ["where are my files", "Where are my songs stored"],
  ["icloud drive", "Where are my songs stored"],
  ["export", "without"],
  ["obsidian", "without"],
  ["airplane mode", "offline"],
  ["privacy", "analytics"],
  ["telemetry", "analytics"],
  ["opt out", "analytics"],
  ["release date", "When is it out"],
  ["price", "cost"],
  ["subscription", "cost"],
  ["ipad", "devices"],
  ["android", "Android"],
]

/**
 * A German reader who knows the app's English wording — or who read the App Store listing — should
 * not have to translate their own question before searching.
 */
const englishQueriesOnGermanCopy: ReadonlyArray<[query: string, questionContains: string]> = [
  ["refund", "Geld zurück"],
  ["money back", "Geld zurück"],
  ["unlock", "freigeschaltet"],
  ["restore purchases", "freigeschaltet"],
  ["shipping", "chordlink-Bestellung"],
  ["crash", "Fehler"],
  ["import", "Songs in"],
]

test("every searchable question carries aliases", () => {
  for (const [label, questions] of searchableQuestions) {
    for (const question of questions) {
      assert.ok((question.keywords?.length ?? 0) > 0, `${label}: "${question.question}" has no aliases`)
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

test("FAQ queries reach the question they are about", () => {
  for (const [query, questionContains] of faqQueries) {
    const matches = matchingFaqEntries(faqCopy.questions, query)
    assert.ok(
      matches.some((match) => match.question.includes(questionContains)),
      `"${query}" did not find the FAQ question about "${questionContains}"`,
    )
  }
})

test("English queries reach the German question they are about", () => {
  for (const [query, questionContains] of englishQueriesOnGermanCopy) {
    const matches = matchingFaqEntries(de.questions, query)
    assert.ok(
      matches.some((match) => match.question.includes(questionContains)),
      `"${query}" did not find the German question about "${questionContains}"`,
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
