import assert from "node:assert/strict"
import test from "node:test"

import { captionWithHashtags, normalizeHashtags, unwrapCaption } from "../lib/social-hashtags"

test("a caption wrapped to fit the file is unwrapped, keeping its paragraphs", () => {
  assert.equal(
    unwrapCaption("chordlist is out. Your songbook is already\na set of files.\n\nFree to start."),
    "chordlist is out. Your songbook is already a set of files.\n\nFree to start.",
  )
})

test("list items keep their own lines", () => {
  assert.equal(unwrapCaption("Three things:\n- one\n- two"), "Three things:\n- one\n- two")
})

test("hashtags follow the caption on their own line, with the # added back", () => {
  assert.equal(captionWithHashtags("Out now.", ["songbook", "iosapp"]), "Out now.\n\n#songbook #iosapp")
  assert.equal(captionWithHashtags("Out now.", []), "Out now.")
})

test("tags are cleaned and deduplicated regardless of case", () => {
  // "Song Book" cleans to "SongBook", the same tag as "songbook" once case is ignored.
  assert.deepEqual(normalizeHashtags(["#songbook", "Song Book", "songbook", "", "#Build-In-Public"]), [
    "songbook",
    "BuildInPublic",
  ])
})
