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
import { isCompletedChordlinkCheckoutSession } from "../lib/chordlink-checkout"
import { chordlinkCheckoutEnabled, isChordlinkCheckoutReady, siteConfig } from "../lib/site-config"

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

test("Accept-Language selects the supported language with the highest quality", () => {
  assert.equal(preferredChordlinkLanguage("de-DE,de;q=0.9,en;q=0.8"), "de")
  assert.equal(preferredChordlinkLanguage("de;q=0.5,en;q=0.9"), "en")
  assert.equal(preferredChordlinkLanguage("en-US,en;q=1,de;q=0"), "en")
  assert.equal(preferredChordlinkLanguage("fr-FR, de;q=0.8"), "de")
  assert.equal(preferredChordlinkLanguage("fr-FR, *;q=0.7"), "en")
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

  const ready = {
    stripePaymentLink: "https://buy.stripe.com/example",
    stripePaymentLinkId: "plink_example",
    sellerAddressConfirmed: true,
    legalTextReviewed: true,
    postageDimensionsConfirmed: true,
  }
  assert.equal(isChordlinkCheckoutReady(ready), true)
  assert.equal(isChordlinkCheckoutReady({ ...ready, stripePaymentLinkId: null }), false)
})

test("completion requires the expected paid Stripe Checkout Session", () => {
  const session = {
    id: "cs_test_chordlink",
    object: "checkout.session",
    mode: "payment",
    status: "complete",
    payment_status: "paid",
    amount_total: 999,
    currency: "eur",
    payment_link: "plink_chordlink",
  }
  const expected = {
    sessionId: session.id,
    paymentLinkId: "plink_chordlink",
    amount: 999,
    currency: "EUR",
  }

  assert.equal(isCompletedChordlinkCheckoutSession(session, expected), true)
  assert.equal(isCompletedChordlinkCheckoutSession({ ...session, status: "open" }, expected), false)
  assert.equal(isCompletedChordlinkCheckoutSession({ ...session, payment_status: "unpaid" }, expected), false)
  assert.equal(isCompletedChordlinkCheckoutSession({ ...session, amount_total: 1099 }, expected), false)
  assert.equal(isCompletedChordlinkCheckoutSession({ ...session, payment_link: "plink_other" }, expected), false)
  assert.equal(isCompletedChordlinkCheckoutSession({ ...session, id: "cs_test_other" }, expected), false)
})

test("the public model is unnumbered unless its explicit URL option is present", async () => {
  const model = await readFile("public/model.html", "utf8")
  assert.match(model, /publicParams\.get\('numbering'\) === '1'/)
  assert.match(model, /CHORDLINK_NUMBERING_ENABLED/)
  assert.match(model, /numbering \? \[\{ name: 'number'/)
  assert.match(model, /element\?\.toggleAttribute\('hidden', !modelOptions\.numbering\)/)
  for (const control of ["num", "numtop", "numh", "nfrom"]) {
    assert.match(model, new RegExp(`getElementById\\('${control}'\\)`))
  }
  // The panel's own .num/.tweak rules set display, so the UA sheet's [hidden] never wins on its own.
  assert.match(model, /\[hidden\]\{display:none!important\}/)
  assert.match(model, /modelOptions\.preview/)
})

test("the product viewer loads a valid static GLB on a transparent stage", async () => {
  const [viewer, model] = await Promise.all([
    readFile("components/chordlink-model-viewer.tsx", "utf8"),
    readFile("public/models/chordlink.glb"),
  ])

  assert.equal(model.subarray(0, 4).toString("ascii"), "glTF")
  assert.match(viewer, /alpha: true/)
  assert.match(viewer, /setClearColor\(0x000000, 0\)/)
  assert.match(viewer, /\/models\/chordlink\.glb/)
  assert.doesNotMatch(viewer, /ground|toolbar/)
  assert.doesNotMatch(viewer, /requestAnimationFrame/)
  assert.match(viewer, /addEventListener\("change", render\)/)
})

test("the DIY page offers one model action without discussing model numbering", async () => {
  const [page, englishMetadata, germanMetadata] = await Promise.all([
    readFile("components/chordlink-diy-page.tsx", "utf8"),
    readFile("app/(en)/chordlink/diy/page.tsx", "utf8"),
    readFile("app/(de)/de/chordlink/diy/page.tsx", "utf8"),
  ])

  assert.match(page, /openModel: "Generate model"/)
  assert.match(page, /openModel: "Modell generieren"/)
  assert.equal(page.match(/href="\/model\.html\?nfc=1"/g)?.length, 1)
  assert.doesNotMatch(page, /custom numbering|About numbering|Nummerierung|nummeriert/i)
  assert.match(englishMetadata, /image: "\/og\/chordlink\.png"/)
  assert.match(germanMetadata, /image: "\/og\/chordlink\.png"/)
})

test("the localized home page banner links to chordlink", async () => {
  const [banner, homePage, english, german] = await Promise.all([
    readFile("components/chordlink-banner.tsx", "utf8"),
    readFile("components/home-page.tsx", "utf8"),
    readFile("locales/en.ts", "utf8"),
    readFile("locales/de.ts", "utf8"),
  ])

  assert.match(homePage, /<ChordlinkBanner language=\{language\} \/>/)
  assert.match(banner, /"\/chordlink"/)
  assert.match(banner, /"\/de\/chordlink"/)
  assert.match(english, /eyebrow: "New · chordlink"/)
  assert.match(german, /eyebrow: "Neu · chordlink"/)
})
