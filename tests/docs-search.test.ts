import assert from "node:assert/strict"
import test from "node:test"

import {
  docsFigureIds,
  docsQuestionId,
  docsSearchEntries,
  docsSectionIds,
  docsSnippet,
  screenshotCalloutId,
  searchDocs,
} from "../lib/docs-search"
import { searchTokens } from "../lib/text-search"
import { docsCopy } from "../locales/en"

const entries = docsSearchEntries()

/** A query, and the id its first result should jump to. */
const queries: ReadonlyArray<[query: string, targetId: string]> = [
  ["transpose", screenshotCalloutId(docsFigureIds.playing, 3)],
  ["change key", docsSectionIds.playing],
  ["autoscroll speed", screenshotCalloutId(docsFigureIds.playing, 4)],
  ["continue free", screenshotCalloutId(docsFigureIds.unlimited, 3)],
  ["tag filter", docsSectionIds.library],
  ["ultimate guitar", docsSectionIds.addingSongs],
  ["chord keyboard", screenshotCalloutId(docsFigureIds.addingSongs, 4)],
  ["chorus", docsSectionIds.chords],
  ["frontmatter", docsSectionIds.fileFormat],
  ["playCount", docsSectionIds.fileFormat],
  ["vault", docsSectionIds.obsidian],
  ["keep downloaded", docsSectionIds.offline],
  ["price", docsSectionIds.unlimited],
  ["family sharing", docsSectionIds.unlimited],
  ["offer code", docsSectionIds.unlimited],
  ["restore purchases", docsQuestionId("unlimited", 0)],
  ["refund", docsQuestionId("unlimited", 4)],
  ["wrong title", docsQuestionId("troubleshooting", 1)],
]

for (const [query, targetId] of queries) {
  test(`"${query}" leads to #${targetId}`, () => {
    const results = searchDocs(entries, query)
    assert.ok(results.length > 0, `"${query}" found nothing`)
    assert.ok(
      results.slice(0, 3).some((entry) => entry.targetId === targetId),
      `"${query}" did not list #${targetId} near the top: ${results
        .slice(0, 3)
        .map((entry) => `#${entry.targetId} (${entry.title})`)
        .join(", ")}`,
    )
  })
}

test("every section in the navigation is a section the search links to", () => {
  const navigation = docsCopy.tableOfContents.flatMap((group) => group.items.map((item) => item.href.slice(1)))
  assert.deepEqual([...navigation].sort(), Object.values(docsSectionIds).sort())
})

test("search text carries no inline markup", () => {
  for (const entry of entries) {
    assert.doesNotMatch(`${entry.title} ${entry.text}`, /<\/?(code|strong|em)>/, entry.title)
  }
})

test("a blank query lists nothing", () => {
  assert.equal(searchDocs(entries, "   ").length, 0)
})

test("a snippet keeps the match and trims to whole words", () => {
  const text = `${"word ".repeat(60)}needle ${"word ".repeat(60)}`.trim()
  const snippet = docsSnippet(text, searchTokens("needle"))
  assert.match(snippet, /needle/)
  assert.match(snippet, /^… word/)
  assert.match(snippet, /word …$/)
})
