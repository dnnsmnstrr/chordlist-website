import assert from "node:assert/strict"
import test from "node:test"

import { parseInlineMarkup, plainInlineText } from "../lib/inline-markup"

test("plain copy is one text token", () => {
  assert.deepEqual(parseInlineMarkup("Nothing marked up here."), [{ kind: "text", value: "Nothing marked up here." }])
})

test("a menu path becomes a code token between its text", () => {
  assert.deepEqual(parseInlineMarkup("Open <code>Settings → Songs Folder</code> and pick a folder."), [
    { kind: "text", value: "Open " },
    { kind: "code", value: "Settings → Songs Folder" },
    { kind: "text", value: " and pick a folder." },
  ])
})

test("every recognized tag is tokenized", () => {
  assert.deepEqual(parseInlineMarkup("<strong>Note:</strong> tap <code>Restore Purchases</code>, <em>twice</em>"), [
    { kind: "strong", value: "Note:" },
    { kind: "text", value: " tap " },
    { kind: "code", value: "Restore Purchases" },
    { kind: "text", value: ", " },
    { kind: "em", value: "twice" },
  ])
})

test("a tag we do not support stays text, so it cannot smuggle markup in", () => {
  const text = 'Read <a href="https://example.com">this</a> and <script>alert(1)</script>.'
  assert.deepEqual(parseInlineMarkup(text), [{ kind: "text", value: text }])
})

test("an unclosed tag renders as itself rather than swallowing the sentence", () => {
  const text = "A stray <code> tag and a lone </strong>."
  assert.deepEqual(parseInlineMarkup(text), [{ kind: "text", value: text }])
  assert.equal(plainInlineText(text), text)
})

test("stripping tags leaves the words a rich result would quote", () => {
  assert.equal(
    plainInlineText("Open <code>Settings → chordlist unlimited</code> and tap <strong>Restore Purchases</strong>."),
    "Open Settings → chordlist unlimited and tap Restore Purchases.",
  )
})
