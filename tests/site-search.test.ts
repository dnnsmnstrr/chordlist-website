import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import { faqQuestionId } from "../lib/faq"
import { searchSite, type SiteSearchEntry } from "../lib/site-search"
import { faqCopy as faqDe, supportCopy as supportDe } from "../locales/de"
import { faqCopy as faqEn, supportCopy as supportEn } from "../locales/en"

const entries: SiteSearchEntry[] = [
  { page: "support", href: "/support#a", title: "My purchase did not unlock", text: "Restore it.", keywords: ["refund"] },
  { page: "faq", href: "/faq#b", title: "Where are my songs?", text: "In a folder you choose, as Markdown.", keywords: [] },
  { page: "docs", href: "/docs#c", title: "File format", text: "Each song is one Markdown file.", keywords: [] },
  { page: "blog", href: "/blog/d", title: "Why Markdown", text: "Plain text outlives apps.", keywords: ["files"] },
]

test("the site-wide search leaves out the page being searched", () => {
  const pages = searchSite(entries, "markdown", { exclude: "faq" }).map((entry) => entry.page)
  assert.deepEqual(pages.includes("faq"), false)
  assert.ok(pages.includes("docs") && pages.includes("blog"))
})

test("a match in the title outranks one only in the text", () => {
  // The blog post is last in the index but the only one with "Markdown" in its title.
  assert.equal(searchSite(entries, "markdown")[0]?.page, "blog")
})

test("keywords reach an entry whose words do not", () => {
  assert.equal(searchSite(entries, "refund")[0]?.href, "/support#a")
})

test("a blank query finds nothing, rather than the whole site", () => {
  assert.deepEqual(searchSite(entries, "   "), [])
})

test("results are capped", () => {
  const many = Array.from({ length: 20 }, (_, index) => ({ ...entries[1]!, href: `/faq#${index}` }))
  assert.equal(searchSite(many, "songs").length, 5)
  assert.equal(searchSite(many, "songs", { limit: 8 }).length, 8)
})

test("every question has its own anchor on its page", () => {
  // A site-wide result links to one answer by this id; two questions sharing one would send a
  // reader to the wrong answer.
  for (const list of [faqEn.questions, faqDe.questions, supportEn.questions, supportDe.questions]) {
    const ids = list.map((entry) => faqQuestionId(entry.question))
    assert.equal(new Set(ids).size, ids.length, ids.join(", "))
    for (const id of ids) assert.match(id, /^q-[a-z0-9]+(?:-[a-z0-9]+)*$/)
  }
})

test("the search index is revalidated with the blog and can read its posts", () => {
  // It lists blog posts, so it has to go live with them and needs content/blog traced into its bundle.
  const route = readFileSync(new URL("../app/api/search/[language]/route.ts", import.meta.url), "utf8")
  const blog = readFileSync(new URL("../app/(en)/blog/page.tsx", import.meta.url), "utf8")
  const revalidate = /export const revalidate = (\d+)/
  assert.equal(route.match(revalidate)?.[1], blog.match(revalidate)?.[1])

  const config = readFileSync(new URL("../next.config.mjs", import.meta.url), "utf8")
  assert.ok(config.includes('"/api/search/[language]": ["./content/blog/**/*"]'))
})
