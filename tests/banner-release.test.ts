import assert from "node:assert/strict"
import test from "node:test"

import { looksLikeReleaseDefinition, releaseDefinition, releaseNotesSpec, specFromReleaseDefinition } from "../lib/banner"

/// The shape the admin console's release log copies: the release template plus a caption.
const releaseLogDefinition = [
  "---",
  "template: release",
  'eyebrow: "Update"',
  "formats:",
  "  - card",
  "  - post",
  "  - story",
  'photo: "piano-keys-in-motion.png"',
  "focus: 30% 60%",
  "badge:",
  '  - "iPhone & iPad"',
  '  - "v1.2"',
  "headline:",
  '  - "Chords at"',
  '  - "your fingertips"',
  'footnote: "chordlist.app"',
  "hashtags:",
  "  - musicapp",
  'alt: "A chordlist release card."',
  "created: 2026-10-17",
  "---",
  "",
  "chordlist 1.2 is out on the App Store.",
  "",
].join("\n")

test("a release config is laid onto the release-notes card: words, photograph, and focus", () => {
  const spec = specFromReleaseDefinition(releaseLogDefinition)

  assert.equal(spec.width, releaseNotesSpec.width)
  assert.equal(spec.background, "photo")
  assert.equal(spec.photo, "piano-keys-in-motion.png")
  assert.equal(spec.focusX, 30)
  assert.equal(spec.focusY, 60)
  assert.equal(spec.badge.visible, true)
  assert.equal(spec.badge.text, "iPhone & iPad | v1.2")
  assert.equal(spec.tagline.text, "Chords at\nyour fingertips")
  assert.deepEqual(spec.tagline.x, releaseNotesSpec.tagline.x)
})

test("the banner's own release definition opens back into the same words", () => {
  const spec = specFromReleaseDefinition(releaseDefinition(releaseNotesSpec, "2026-10-17"))

  assert.equal(spec.badge.text, releaseNotesSpec.badge.text)
  assert.equal(spec.tagline.text, releaseNotesSpec.tagline.text)
  assert.equal(spec.photo, releaseNotesSpec.photo)
})

test("an unknown photograph keeps the template's, and another template is refused", () => {
  const spec = specFromReleaseDefinition(releaseLogDefinition.replace("piano-keys-in-motion.png", "missing.png"))

  assert.equal(spec.photo, releaseNotesSpec.photo)
  assert.throws(() => specFromReleaseDefinition(releaseLogDefinition.replace("template: release", "template: features")), /features/)
  assert.throws(() => specFromReleaseDefinition("template: release"), /---/)
})

test("only text that opens with release frontmatter is treated as a pasted config", () => {
  assert.equal(looksLikeReleaseDefinition(releaseLogDefinition), true)
  assert.equal(looksLikeReleaseDefinition("What's new in chordlist"), false)
  assert.equal(looksLikeReleaseDefinition("---\ntemplate: statement\n---\n"), false)
})
