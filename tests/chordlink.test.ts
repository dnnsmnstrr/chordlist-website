import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

import {
  chordlinkFallbackPath,
  isChordlinkPublicId,
  preferredChordlinkLanguage,
  resolveChordlinkFallbackPath,
  type ChordlinkEditionDefinition,
} from "../lib/chordlink"
import { chordlinkCheckoutEnabled, siteConfig } from "../lib/site-config"

test("public chordlink IDs preserve the two- through six-digit namespace", () => {
  for (const value of ["01", "001", "0001", "00001", "000001"]) assert.equal(isChordlinkPublicId(value), true)
  for (const value of ["1", "0000001", "+01", "-01", " 01", "01a", "١٢"]) assert.equal(isChordlinkPublicId(value), false)
})

test("three-digit first-edition links and unlaunched two-digit links resolve safely", () => {
  assert.equal(chordlinkFallbackPath("001", "en"), "/chordlink/setup")
  assert.equal(chordlinkFallbackPath("001", "de"), "/de/chordlink/setup")
  assert.equal(chordlinkFallbackPath("01", "en"), "/chordlink/setup")
  assert.equal(chordlinkFallbackPath("x01", "en"), null)
})

test("a future dark-edition rule can claim two digits without changing the public route", () => {
  const dark: ChordlinkEditionDefinition = {
    editionKey: "dark",
    publicIdPattern: /^\d{2}$/,
    fallbackPaths: { en: "/chordlink/dark", de: "/de/chordlink/dark" },
  }
  assert.equal(resolveChordlinkFallbackPath("01", "de", [dark]), "/de/chordlink/dark")
  assert.equal(resolveChordlinkFallbackPath("001", "de", [dark]), "/de/chordlink/setup")
})

test("German Accept-Language selects the localized fallback", () => {
  assert.equal(preferredChordlinkLanguage("de-DE,de;q=0.9,en;q=0.8"), "de")
  assert.equal(preferredChordlinkLanguage("en-US,en;q=0.9"), "en")
})

test("the AASA file names only chordlink universal-link paths", async () => {
  const body = JSON.parse(await readFile("public/.well-known/apple-app-site-association", "utf8"))
  assert.deepEqual(body.applinks.details[0].appIDs, ["CSKA8928CG.app.chordlist"])
  assert.equal(body.applinks.details[0].components[0]["/"], "/link/*")
})

test("pilot checkout stays gated until every legal and postage prerequisite is explicit", () => {
  assert.equal(siteConfig.chordlink.price.amount, 999)
  assert.equal(siteConfig.chordlink.saleQuantity, 10)
  assert.equal(siteConfig.chordlink.shippingRegion, "DE")
  assert.equal(chordlinkCheckoutEnabled, false)
})
