import assert from "node:assert/strict"
import test from "node:test"

import {
  chordlinkInterestConfirmedPath,
  chordlinkInterestOutcome,
  chordlinkInterestRequestBody,
  normalizeInterestEmail,
} from "../lib/chordlink-interest"

test("an address is stored in one canonical form", () => {
  // The same person typing either of these must be one contact, so one unsubscribe covers both.
  assert.equal(normalizeInterestEmail("  Ada@Example.COM "), "ada@example.com")
  assert.equal(normalizeInterestEmail("ada+chordlink@example.co.uk"), "ada+chordlink@example.co.uk")
})

test("what is not an address is refused before Brevo is called", () => {
  for (const value of [null, 42, "", "   ", "ada", "ada@", "@example.com", "ada@example", "a b@example.com", "ada@ex ample.com"]) {
    assert.equal(normalizeInterestEmail(value), null)
  }
  assert.equal(normalizeInterestEmail(`${"a".repeat(250)}@example.com`), null)
})

test("the confirmation link comes back in the language the form was filled in", () => {
  assert.equal(chordlinkInterestConfirmedPath("de"), "/de/chordlink/notified")
  assert.equal(chordlinkInterestConfirmedPath("en"), "/chordlink/notified")
})

test("the signup carries what a later campaign has to segment on", () => {
  assert.deepEqual(
    chordlinkInterestRequestBody({
      baseUrl: "https://example.com",
      email: "ada@example.com",
      language: "de",
      listId: 7,
      reason: "sold-out",
      templateId: 3,
    }),
    {
      email: "ada@example.com",
      includeListIds: [7],
      templateId: 3,
      redirectionUrl: "https://example.com/de/chordlink/notified",
      attributes: { LANGUAGE: "DE", SIGNUP_REASON: "sold-out" },
    },
  )
})

test("an address already on the list is indistinguishable from a new one", () => {
  // Otherwise the form answers "is this person signed up?" for anyone who types someone else's
  // address into it.
  assert.equal(chordlinkInterestOutcome(201), "confirm-sent")
  assert.equal(chordlinkInterestOutcome(204), "confirm-sent")
  assert.equal(chordlinkInterestOutcome(400, "duplicate_parameter"), "confirm-sent")
})

test("a failure is reported as a failure rather than a quiet success", () => {
  // Saying thank you to somebody whose address was dropped is the one outcome worth ruling out.
  assert.equal(chordlinkInterestOutcome(400, "invalid_parameter"), "unavailable")
  assert.equal(chordlinkInterestOutcome(401), "unavailable")
  assert.equal(chordlinkInterestOutcome(429), "unavailable")
  assert.equal(chordlinkInterestOutcome(500), "unavailable")
})
