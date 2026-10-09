import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import { marketingCopyPath, prepareMarketingCopy, resolveDocLink } from "../lib/marketing-copy"

test("social asset links open in the social editor", () => {
  assert.equal(resolveDocLink("../content/social/out-now.md"), "/social/editor?slug=out-now")
})

test("other repository files open on GitHub, keeping their anchor", () => {
  assert.equal(
    resolveDocLink("marketing-plan.md"),
    "https://github.com/dnnsmnstrr/chordlist-website/blob/main/docs/marketing-plan.md",
  )
  assert.equal(
    resolveDocLink("../content/blog/why-plain-text-songbooks-last.md#top"),
    "https://github.com/dnnsmnstrr/chordlist-website/blob/main/content/blog/why-plain-text-songbooks-last.md#top",
  )
})

test("absolute links and anchors are left alone", () => {
  for (const href of ["https://chordlist.app", "/admin", "#facts", "mailto:feedback@chordlist.app"]) {
    assert.equal(resolveDocLink(href), href)
  }
})

test("the real file loses its title and keeps no relative links", () => {
  const prepared = prepareMarketingCopy(readFileSync(new URL(`../${marketingCopyPath}`, import.meta.url), "utf8"))
  assert.equal(prepared.startsWith("# "), false)
  assert.deepEqual(prepared.match(/\]\((?!https?:|\/|#)[^)]+\)/g), null)
})
