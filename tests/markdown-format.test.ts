import assert from "node:assert/strict"
import test from "node:test"

import {
  cycleHeading,
  toggleCode,
  toggleCodeBlock,
  toggleInline,
  toggleLinePrefix,
  toggleLink,
  wrapSelection,
  type Edit,
  type Placeholders,
} from "../lib/markdown-format"

const placeholders: Placeholders = {
  bold: "bold text",
  italic: "italic text",
  code: "code",
  linkText: "link text",
  linkUrl: "https://",
}

/** Applies an edit and marks the resulting selection with « and », or | for a caret. */
function apply(text: string, result: Edit) {
  const next = text.slice(0, result.from) + result.insert + text.slice(result.to)
  const { start, end } = result.selection
  if (start === end) return `${next.slice(0, start)}|${next.slice(start)}`
  return `${next.slice(0, start)}«${next.slice(start, end)}»${next.slice(end)}`
}

/** "a «word» here" → the text without the marks and the selection they made. */
function parse(marked: string) {
  const caret = marked.indexOf("|")
  if (caret !== -1) return { text: marked.replace("|", ""), selection: { start: caret, end: caret } }
  const start = marked.indexOf("«")
  const end = marked.indexOf("»") - 1
  return { text: marked.replace("«", "").replace("»", ""), selection: { start, end } }
}

function run(marked: string, action: (text: string, selection: { start: number; end: number }) => Edit) {
  const { text, selection } = parse(marked)
  return apply(text, action(text, selection))
}

const bold = (text: string, selection: { start: number; end: number }) =>
  toggleInline(text, selection, "**", placeholders.bold)

test("bold wraps the selection and keeps it selected", () => {
  assert.equal(run("a «word» here", bold), "a **«word»** here")
})

test("bold leaves the spaces a double-click picked up outside the markers", () => {
  assert.equal(run("a «word »here", bold), "a **«word»** here")
})

test("bold comes off again, whether or not the markers were selected", () => {
  assert.equal(run("a **«word»** here", bold), "a «word» here")
  assert.equal(run("a «**word**» here", bold), "a «word» here")
})

test("with nothing selected, bold inserts a selected placeholder to type over", () => {
  assert.equal(run("a | here", bold), "a **«bold text»** here")
})

test("emphasis over several lines wraps each line rather than crossing the paragraph break", () => {
  assert.equal(run("«one\n\ntwo»", bold), "«**one**\n\n**two**»")
})

test("a link selects the URL to write next, or the words when a URL was selected", () => {
  const link = (t: string, s: { start: number; end: number }) => toggleLink(t, s, placeholders)
  assert.equal(run("see «the docs» now", link), "see [the docs](«https://») now")
  assert.equal(run("see «https://example.com» now", link), "see [«link text»](https://example.com) now")
  assert.equal(run("see «[the docs](/docs)» now", link), "see «the docs» now")
  assert.equal(run("see | now", link), "see [«link text»](https://) now")
})

test("code is inline within a line and fenced across lines", () => {
  assert.equal(run("type «G D Em C» here", (t, s) => toggleCode(t, s, placeholders)), "type `«G D Em C»` here")
  assert.equal(
    run("Intro\n\n«chords: G\ntags: x»\n\nOutro", (t, s) => toggleCode(t, s, placeholders)),
    "Intro\n\n```\n«chords: G\ntags: x»\n```\n\nOutro",
  )
})

test("a fence gets the blank lines Markdown needs, and comes off again", () => {
  assert.equal(run("Text\n«a»\nMore", toggleCodeBlock), "Text\n\n```\n«a»\n```\n\nMore")
  assert.equal(run("Text\n\n```\n«a»\n```\n\nMore", toggleCodeBlock), "Text\n\n«a»\n\nMore")
})

test("a quote covers every selected line, blank ones included, and toggles off", () => {
  const quote = (t: string, s: { start: number; end: number }) => toggleLinePrefix(t, s, "quote")
  assert.equal(run("«one\n\ntwo»", quote), "«> one\n>\n> two»")
  assert.equal(run("«> one\n>\n> two»", quote), "«one\n\ntwo»")
})

test("a list prefixes the lines a partial selection touches, skipping blank ones", () => {
  const list = (t: string, s: { start: number; end: number }) => toggleLinePrefix(t, s, "list")
  assert.equal(run("on«e\n\ntw»o", list), "«- one\n\n- two»")
})

test("headings cycle through the two levels posts use, and the caret stays in its word", () => {
  assert.equal(run("Fil|e over app", cycleHeading), "## Fil|e over app")
  assert.equal(run("## Fil|e over app", cycleHeading), "### Fil|e over app")
  assert.equal(run("### Fil|e over app", cycleHeading), "Fil|e over app")
})

test("typing a bracket, quote, or backtick over a selection wraps it instead of replacing it", () => {
  const typed = (key: string) => (t: string, s: { start: number; end: number }) => wrapSelection(t, s, key) as Edit
  assert.equal(run("type «G D Em C» here", typed("`")), "type `«G D Em C»` here")
  assert.equal(run("a «capo» b", typed("(")), "a («capo») b")
  assert.equal(run("a «word» b", typed('"')), 'a "«word»" b')
  // Nothing selected, or a key that is not a pair, is ordinary typing.
  assert.equal(wrapSelection("a b", { start: 1, end: 1 }, "("), null)
  assert.equal(wrapSelection("a b", { start: 0, end: 1 }, "x"), null)
  assert.equal(wrapSelection("a b", { start: 0, end: 1 }, "'"), null)
})
