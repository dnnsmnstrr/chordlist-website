import assert from "node:assert/strict"
import test from "node:test"

import {
  mayOpenChordlinkCheckout,
  parseChordlinkAvailability,
} from "../lib/chordlink-availability"

test("a well-formed count is read, and zero means sold out", () => {
  assert.deepEqual(parseChordlinkAvailability({ editionKey: "first", available: 3, soldOut: false }), {
    editionKey: "first",
    available: 3,
    soldOut: false,
  })
  assert.equal(parseChordlinkAvailability({ editionKey: "first", available: 0 })?.soldOut, true)
})

test("soldOut is derived from the count rather than trusted from the body", () => {
  // Otherwise a backend that disagreed with itself could open a checkout for nothing.
  assert.equal(parseChordlinkAvailability({ editionKey: "first", available: 0, soldOut: false })?.soldOut, true)
  assert.equal(parseChordlinkAvailability({ editionKey: "first", available: 2, soldOut: true })?.soldOut, false)
})

test("anything malformed is no answer at all", () => {
  for (const value of [
    null,
    "sold out",
    {},
    { editionKey: "", available: 1 },
    { editionKey: "first" },
    { editionKey: "first", available: -1 },
    { editionKey: "first", available: 1.5 },
    { editionKey: "first", available: "3" },
  ]) {
    assert.equal(parseChordlinkAvailability(value), null)
  }
})

test("checkout opens unless the backend says the edition is gone", () => {
  assert.equal(mayOpenChordlinkCheckout({ editionKey: "first", available: 1, soldOut: false }), true)
  assert.equal(mayOpenChordlinkCheckout({ editionKey: "first", available: 0, soldOut: true }), false)
  // Fails open: an unreachable or unconfigured endpoint must not close the shop, because the
  // webhook now answers a sold-out allocation with `sold_out` instead of retrying for days.
  assert.equal(mayOpenChordlinkCheckout(null), true)
})
