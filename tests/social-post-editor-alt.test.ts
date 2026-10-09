import assert from "node:assert/strict"
import test from "node:test"

import { initialConfig, withBackgroundAlt, type EditorConfig } from "../components/social-post-editor"

const card = "A dark chordlist card reading “Out now.”"
const plain: EditorConfig = { ...initialConfig, alt: card, backgroundMode: "plain" }

test("adds the photo's catalog description when a background image is chosen", () => {
  const next = withBackgroundAlt({ ...plain, backgroundMode: "image", photo: "guitarist-in-motion.png" }, plain)
  assert.equal(
    next.alt,
    `${card} Behind it, a guitarist's fretting hand and instrument blurred by movement under bright stage lights.`,
  )
})

test("describes a texture as faint", () => {
  const next = withBackgroundAlt({ ...plain, backgroundMode: "texture", texture: "stage" }, plain)
  assert.equal(
    next.alt,
    `${card} Faintly behind it, a microphone on a stand, angled sideways and smeared by movement against a dark stage.`,
  )
})

test("replaces the sentence when the photo changes, and removes it for a plain background", () => {
  const guitar = withBackgroundAlt({ ...plain, backgroundMode: "image", photo: "guitarist-in-motion.png" }, plain)
  const piano = withBackgroundAlt({ ...guitar, photo: "piano-keys-in-motion.png" }, guitar)
  assert.equal(piano.alt, `${card} Behind it, black-and-white piano keys stretching into soft vertical streaks of motion.`)

  const cleared = withBackgroundAlt({ ...piano, backgroundMode: "plain" }, piano)
  assert.equal(cleared.alt, card)
})

test("leaves the alt alone when the background did not change", () => {
  const guitar = withBackgroundAlt({ ...plain, backgroundMode: "image", photo: "guitarist-in-motion.png" }, plain)
  const edited = { ...guitar, alt: "Written by hand." }
  assert.equal(withBackgroundAlt(edited, guitar).alt, "Written by hand.")
})

test("an uploaded photo has no description, so a previous one is removed", () => {
  const guitar = withBackgroundAlt({ ...plain, backgroundMode: "image", photo: "guitarist-in-motion.png" }, plain)
  const uploaded = withBackgroundAlt({ ...guitar, photo: "my-photo.png" }, guitar)
  assert.equal(uploaded.alt, card)
})
