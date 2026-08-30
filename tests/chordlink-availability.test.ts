import assert from "node:assert/strict"
import test from "node:test"

import {
  chordlinkCheckoutNotice,
  chordlinkInterestReason,
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

test("interest is collected only where being turned away means something", () => {
  const edition = { editionKey: "first", available: 0, soldOut: true, salesEnabled: true }
  assert.equal(chordlinkInterestReason(edition), "sold-out")
  assert.equal(
    chordlinkInterestReason({ editionKey: "first", available: 5, soldOut: false, salesEnabled: false }),
    "prelaunch",
  )
  // Sold out outranks the switch: the batch is gone either way, and a second edition is what that
  // visitor is actually waiting for.
  assert.equal(
    chordlinkInterestReason({ editionKey: "first", available: 0, soldOut: true, salesEnabled: false }),
    "sold-out",
  )
})

test("nothing is collected when there is something to buy, or nothing to trust", () => {
  assert.equal(
    chordlinkInterestReason({ editionKey: "first", available: 5, soldOut: false, salesEnabled: true }),
    null,
  )
  // An unreadable response is an outage rather than a state of the product: sales may be open
  // behind it, so neither a count nor a promise to notify would be honest.
  assert.equal(chordlinkInterestReason(null), null)
})

test("interest and checkout never both apply", () => {
  for (const availability of [
    { editionKey: "first", available: 5, soldOut: false, salesEnabled: true },
    { editionKey: "first", available: 5, soldOut: false, salesEnabled: false },
    { editionKey: "first", available: 0, soldOut: true, salesEnabled: true },
    { editionKey: "first", available: 0, soldOut: true, salesEnabled: false },
    null,
  ]) {
    assert.equal(
      mayOpenChordlinkCheckout(availability) && chordlinkInterestReason(availability) !== null,
      false,
    )
  }
})
