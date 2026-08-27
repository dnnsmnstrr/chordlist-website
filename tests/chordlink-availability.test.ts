import assert from "node:assert/strict"
import test from "node:test"

import {
  chordlinkCheckoutNotice,
  chordlinkNumberingRange,
  mayOpenChordlinkCheckout,
  parseChordlinkAvailability,
} from "../lib/chordlink-availability"
import { siteConfig } from "../lib/site-config"

test("a well-formed storefront response is read, and zero means sold out", () => {
  assert.deepEqual(parseChordlinkAvailability({ editionKey: "first", available: 3, soldOut: false, salesEnabled: true }), {
    editionKey: "first",
    available: 3,
    soldOut: false,
    salesEnabled: true,
  })
  assert.equal(
    parseChordlinkAvailability({ editionKey: "first", available: 0, salesEnabled: true })?.soldOut,
    true,
  )
})

test("soldOut is derived from the count rather than trusted from the body", () => {
  // Otherwise a backend that disagreed with itself could open a checkout for nothing.
  assert.equal(
    parseChordlinkAvailability({ editionKey: "first", available: 0, soldOut: false, salesEnabled: true })?.soldOut,
    true,
  )
  assert.equal(
    parseChordlinkAvailability({ editionKey: "first", available: 2, soldOut: true, salesEnabled: true })?.soldOut,
    false,
  )
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
    { editionKey: "first", available: 3 },
    { editionKey: "first", available: 3, salesEnabled: "yes" },
  ]) {
    assert.equal(parseChordlinkAvailability(value), null)
  }
})

test("checkout opens only when the authoritative switch is on and stock remains", () => {
  assert.equal(
    mayOpenChordlinkCheckout({ editionKey: "first", available: 1, soldOut: false, salesEnabled: true }),
    true,
  )
  assert.equal(
    mayOpenChordlinkCheckout({ editionKey: "first", available: 1, soldOut: false, salesEnabled: false }),
    false,
  )
  assert.equal(
    mayOpenChordlinkCheckout({ editionKey: "first", available: 0, soldOut: true, salesEnabled: true }),
    false,
  )
  assert.equal(mayOpenChordlinkCheckout(null), false)
})

test("the numbering line is derived from the sale run rather than written down", () => {
  assert.equal(chordlinkNumberingRange(10), "001\u2013010")
  assert.equal(chordlinkNumberingRange(20), "001\u2013020")
  assert.equal(chordlinkNumberingRange(5, 2), "01\u201305")
  // Matches what the page said by hand before the count went live.
  assert.equal(chordlinkNumberingRange(siteConfig.chordlink.saleQuantity), "001\u2013010")
  assert.equal(chordlinkNumberingRange(0), "")
})

test("only the two notices the page can explain are accepted", () => {
  assert.equal(chordlinkCheckoutNotice("sold-out"), "sold-out")
  assert.equal(chordlinkCheckoutNotice("unavailable"), "unavailable")
  // A query string is user input: anything else must not reach the copy lookup.
  for (const value of [undefined, "", "SOLD-OUT", "true", "<script>"]) {
    assert.equal(chordlinkCheckoutNotice(value), null)
  }
})
