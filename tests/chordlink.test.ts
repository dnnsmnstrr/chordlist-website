import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

import {
  chordlinkFallbackPath,
  isChordlinkPublicId,
  normalizeChordlinkPublicId,
  preferredChordlinkLanguage,
  resolveChordlinkFallbackPath,
  type ChordlinkEditionDefinition,
} from "../lib/chordlink"
import {
  chordlinkCheckoutBaseUrl,
  chordlinkCheckoutSessionParameters,
  chordlinkStripeCheckoutReference,
  isCompletedChordlinkCheckoutSession,
} from "../lib/chordlink-checkout"
import { parseChordlinkWithdrawal } from "../lib/chordlink-withdrawal"
import { siteConfig } from "../lib/site-config"

test("the printed numbers keep working now that named IDs are allowed beside them", () => {
  for (const value of ["01", "001", "0001", "00001", "000001"]) assert.equal(isChordlinkPublicId(value), true)
  for (const value of ["tour-2026", "dennis", "01a", "a1", "band-practice-2026"]) {
    assert.equal(isChordlinkPublicId(value), true)
  }
  for (const value of ["1", "a", "", "+01", "-01", "01-", "to--ur", "my tag", "tag_1", "münchen", "١٢"]) {
    assert.equal(isChordlinkPublicId(value), false)
  }
  assert.equal(isChordlinkPublicId("a".repeat(32)), true)
  assert.equal(isChordlinkPublicId("a".repeat(33)), false)
})

test("one canonical lowercase form means a retyped link is not a second chordlink", () => {
  assert.equal(normalizeChordlinkPublicId("Tour-2026"), "tour-2026")
  assert.equal(normalizeChordlinkPublicId("  DENNIS  "), "dennis")
  assert.equal(normalizeChordlinkPublicId("001"), "001")
  assert.equal(normalizeChordlinkPublicId("-nope"), null)
})

test("three-digit first-edition links, unlaunched two-digit links, and named links resolve safely", () => {
  assert.equal(chordlinkFallbackPath("001", "en"), "/chordlink/setup")
  assert.equal(chordlinkFallbackPath("001", "de"), "/de/chordlink/setup")
  assert.equal(chordlinkFallbackPath("01", "en"), "/chordlink/setup")
  assert.equal(chordlinkFallbackPath("tour-2026", "de"), "/de/chordlink/setup")
  assert.equal(chordlinkFallbackPath("x 01", "en"), null)
})

test("a future dark-edition rule can claim two digits without changing the public route", () => {
  const dark: ChordlinkEditionDefinition = {
    editionKey: "dark",
    publicIdPattern: /^\d{2}$/,
    fallbackPaths: { en: "/chordlink/dark", de: "/de/chordlink/dark" },
  }
  assert.equal(resolveChordlinkFallbackPath("01", "de", [dark]), "/de/chordlink/dark")
  assert.equal(resolveChordlinkFallbackPath("001", "de", [dark]), "/de/chordlink/setup")
  assert.equal(resolveChordlinkFallbackPath("tour-2026", "de", [dark]), "/de/chordlink/setup")
})

test("Accept-Language selects the supported language with the highest quality", () => {
  assert.equal(preferredChordlinkLanguage("de-DE,de;q=0.9,en;q=0.8"), "de")
  assert.equal(preferredChordlinkLanguage("de;q=0.5,en;q=0.9"), "en")
  assert.equal(preferredChordlinkLanguage("en-US,en;q=1,de;q=0"), "en")
  assert.equal(preferredChordlinkLanguage("fr-FR, de;q=0.8"), "de")
  assert.equal(preferredChordlinkLanguage("fr-FR, *;q=0.7"), "en")
})

test("a bare /link lands on the setup page rather than a 404", async () => {
  const route = await readFile("app/link/route.ts", "utf8")

  assert.match(route, /genericChordlinkFallbackPaths\[language\]/)
  assert.match(route, /preferredChordlinkLanguage\(requestHeaders\.get\("accept-language"\)\)/)
  assert.match(route, /status: 307/)
  assert.match(route, /"x-robots-tag": "noindex, nofollow"/)
})

test("the AASA file names only chordlink universal-link paths", async () => {
  const body = JSON.parse(await readFile("public/.well-known/apple-app-site-association", "utf8"))
  assert.deepEqual(body.applinks.details[0].appIDs, ["CSKA8928CG.app.chordlist"])
  assert.equal(body.applinks.details[0].components[0]["/"], "/link/*")
})

test("pilot checkout keeps its price, run size, and shipping facts in site configuration", () => {
  assert.equal(siteConfig.chordlink.price.amount, 999)
  assert.equal(siteConfig.chordlink.saleQuantity, 10)
  assert.equal(siteConfig.chordlink.shippingRegion, "DE")
  assert.equal(siteConfig.businessAddress.street, "Frauenlobplatz 2")
})

test("custom Checkout keeps payment collection on the compliant local order page", () => {
  const parameters = chordlinkCheckoutSessionParameters({
    baseUrl: "https://chordlist.app/",
    language: "de",
    priceId: "price_chordlink",
  })

  assert.deepEqual(parameters.line_items, [{ price: "price_chordlink", quantity: 1 }])
  assert.equal(parameters.mode, "payment")
  assert.equal(parameters.ui_mode, "custom")
  assert.equal(parameters.client_reference_id, chordlinkStripeCheckoutReference)
  assert.equal(parameters.metadata.chordlink_order, chordlinkStripeCheckoutReference)
  assert.deepEqual(parameters.shipping_address_collection.allowed_countries, ["DE"])
  assert.equal(parameters.locale, "de")
  assert.equal(
    parameters.return_url,
    "https://chordlist.app/chordlink/complete?session_id={CHECKOUT_SESSION_ID}&language=de",
  )
})

test("the server fails closed if Stripe's live Price no longer matches the advertised total", async () => {
  const server = await readFile("lib/server/stripe-chordlink.ts", "utf8")

  assert.match(server, /stripe\.prices\.retrieve\(configuration\.priceId\)/)
  assert.match(server, /price\.unit_amount === siteConfig\.chordlink\.price\.amount/)
  assert.match(server, /price\.currency\.toUpperCase\(\) === siteConfig\.chordlink\.price\.currency/)
  assert.match(server, /if \(!configuredPriceMatches\) return null/)
})

test("local development Checkout returns to the local confirmation route", () => {
  assert.equal(
    chordlinkCheckoutBaseUrl({
      isDevelopment: true,
      productionUrl: "https://chordlist.app",
      requestHost: "localhost:3000",
    }),
    "http://localhost:3000",
  )
  assert.equal(
    chordlinkCheckoutBaseUrl({
      isDevelopment: true,
      productionUrl: "https://chordlist.app",
      requestHost: "127.0.0.1:3100",
    }),
    "http://127.0.0.1:3100",
  )
})

test("production Checkout ignores untrusted request hosts", () => {
  for (const options of [
    { isDevelopment: false, requestHost: "localhost:3000" },
    { isDevelopment: true, requestHost: "example.com" },
    { isDevelopment: true, requestHost: "localhost.evil.example" },
    { isDevelopment: true, requestHost: null },
  ]) {
    assert.equal(
      chordlinkCheckoutBaseUrl({ ...options, productionUrl: "https://chordlist.app" }),
      "https://chordlist.app",
    )
  }
})

test("completion requires the expected paid Stripe Checkout Session", () => {
  const session = {
    id: "cs_test_chordlink",
    object: "checkout.session",
    mode: "payment",
    status: "complete",
    payment_status: "paid",
    amount_subtotal: 999,
    amount_total: 999,
    currency: "eur",
    client_reference_id: chordlinkStripeCheckoutReference,
    metadata: { chordlink_order: chordlinkStripeCheckoutReference },
  }
  const expected = {
    sessionId: session.id,
    checkoutReference: chordlinkStripeCheckoutReference,
    amount: 999,
    currency: "EUR",
  }

  assert.equal(isCompletedChordlinkCheckoutSession(session, expected), true)
  assert.equal(isCompletedChordlinkCheckoutSession({ ...session, amount_total: 799 }, expected), false)
  assert.equal(isCompletedChordlinkCheckoutSession({ ...session, status: "open" }, expected), false)
  assert.equal(isCompletedChordlinkCheckoutSession({ ...session, payment_status: "unpaid" }, expected), false)
  assert.equal(isCompletedChordlinkCheckoutSession({ ...session, amount_subtotal: 1099 }, expected), false)
  assert.equal(isCompletedChordlinkCheckoutSession({ ...session, amount_total: 1099 }, expected), false)
  assert.equal(isCompletedChordlinkCheckoutSession({ ...session, client_reference_id: "other" }, expected), false)
  assert.equal(isCompletedChordlinkCheckoutSession({ ...session, metadata: {} }, expected), false)
  assert.equal(isCompletedChordlinkCheckoutSession({ ...session, id: "cs_test_other" }, expected), false)
})

test("the German order review contains every consumer-contract fact immediately before the exact button", async () => {
  const [checkout, terms, config] = await Promise.all([
    readFile("components/chordlink-checkout-page.tsx", "utf8"),
    readFile("components/chordlink-terms-page.tsx", "utf8"),
    readFile("lib/site-config.ts", "utf8"),
  ])

  assert.match(checkout, />\s*zahlungspflichtig bestellen\s*</)
  assert.equal(checkout.match(/zahlungspflichtig bestellen/g)?.length, 1)
  for (const required of [
    "Gesamtpreis inklusive Versand",
    "Identität des Verkäufers",
    "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.",
    "unmittelbaren Kosten der Rücksendung",
  ]) assert.match(checkout + terms, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
  assert.match(config, /deliveryTime:/)
  assert.match(terms, /Muster-Widerrufsformular/)
  assert.match(terms, /zehn Stück des ersten Verkaufs/)
})

test("the 2026 online withdrawal function has the two statutory button labels", async () => {
  const [footer, form] = await Promise.all([
    readFile("components/site-footer.tsx", "utf8"),
    readFile("components/chordlink-withdrawal-page.tsx", "utf8"),
  ])

  assert.match(footer, /Vertrag widerrufen/)
  assert.match(form, /Widerruf bestätigen/)
})

test("online withdrawals require the details needed to identify and confirm them", () => {
  const form = new FormData()
  form.set("language", "de")
  form.set("name", "Erika Mustermann")
  form.set("email", "ERIKA@example.de")
  form.set("orderReference", "Bestellung vom 1. September 2026")

  assert.deepEqual(parseChordlinkWithdrawal(form, new Date("2026-09-01T12:00:00Z")), {
    language: "de",
    name: "Erika Mustermann",
    email: "erika@example.de",
    orderReference: "Bestellung vom 1. September 2026",
    receivedAt: "2026-09-01T12:00:00.000Z",
  })
  form.set("email", "invalid")
  assert.equal(parseChordlinkWithdrawal(form), null)
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

test("the stage toolbar downloads the print formats, not OBJ and GLB", async () => {
  const model = await readFile("public/model.html", "utf8")
  // The stage's own OBJ/GLB buttons are replaced, so the swap has to survive a
  // bundle re-export -- replaceModelSource throws when its anchor has moved.
  assert.match(model, /stage\.shadowRoot\.querySelector\('\.toolbar'\)/)
  assert.match(
    model,
    /stageToolbar\.replaceChildren\(document\.getElementById\('stl'\), document\.getElementById\('stl-parts'\)\)/
  )
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
