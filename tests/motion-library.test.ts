import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import path from "node:path"
import test from "node:test"

import launchManifest from "../public/video/launch/manifest.json"
import suiteManifest from "../public/video/motion/manifest.json"
import { customItems, launchItems, suiteItems } from "../lib/motion/library"
import { motionLibraryCopy } from "../locales/en"

test("every rendered motion piece has a title and description", () => {
  const missing = suiteManifest.map((piece) => piece.slug).filter((slug) => !(slug in motionLibraryCopy.pieces))
  assert.deepEqual(missing, [], "add these to motionLibraryCopy.pieces in locales/en.ts")
})

test("every launch video has a title and description", () => {
  const missing = launchManifest.map((piece) => piece.slug).filter((slug) => !(slug in motionLibraryCopy.launch))
  assert.deepEqual(missing, [], "add these to motionLibraryCopy.launch in locales/en.ts")
})

test("every video and poster the library offers exists", () => {
  for (const item of [...launchItems(), ...suiteItems(), ...customItems()]) {
    for (const output of item.outputs) {
      for (const file of [output.video, output.poster]) {
        assert.ok(existsSync(path.join("public", file)), `${item.slug}: ${file} is missing`)
      }
    }
  }
})

test("a piece with a social twin carries that still's caption", () => {
  const sameChords = suiteItems().find((item) => item.slug === "same-chords")
  assert.ok(sameChords?.caption?.text, "same-chords should post with the matching-progressions caption")
})
