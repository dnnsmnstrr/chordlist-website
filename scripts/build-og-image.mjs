/**
 * Builds the site's Open Graph cards — public/og.png, plus one og-<code>.png per language the home
 * page is translated into.
 *
 *   pnpm build:og
 *
 * Everything you are likely to want to change lives in the CONFIG block below:
 * the copy, the colours, the type sizes, and how large the app icon sits.
 * The app icon is drawn from the same geometry as components/chordlist-icon.tsx,
 * so the mark stays in sync with the header logo and the favicons.
 *
 * The headline on each card is checked against the tagline in VOCABULARY.md, so a card cannot go on
 * claiming wording the app has moved on from.
 *
 * Rendering uses Next's bundled ImageResponse (satori + resvg), so no extra
 * dependencies are needed. Fonts are read from assets/fonts so the build is
 * hermetic and does not reach the network.
 */
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { createElement as h } from "react"
import { ImageResponse } from "next/og.js"

import { markSvg, svgDataUri } from "./lib/chordlist-mark.mjs"
import { phrase } from "./lib/vocabulary.mjs"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

/* ─────────────────────────────── CONFIG ─────────────────────────────── */

const CONFIG = {
  // Open Graph's expected size. Most scrapers crop to 1.91:1.
  width: 1200,
  height: 630,

  wordmark: "chordlist",

  // One card per language the home page exists in. English keeps public/og.png — it is the
  // site-wide fallback that every untranslated page still points at — and each translation gets a
  // sibling next to it, which lib/page-metadata.ts names from the language code.
  //
  // `headline` is an array so the line break stays deliberate rather than falling where the
  // renderer happens to wrap. Joined back together it has to equal the tagline in VOCABULARY.md,
  // which `main` checks: the card is the first thing a shared link says, and it saying something
  // the app and the App Store listing no longer say is the drift this guard exists to catch.
  cards: [
    {
      language: "en",
      output: "public/og.png",
      headline: ["Your lyrics and chords,", "as files in your pocket."],
      footnote: "Local-first songbook for iPhone and iPad",
    },
    {
      language: "de",
      output: "public/og-de.png",
      headline: ["Deine Songtexte und Akkorde –", "immer mit dabei."],
      footnote: "Local-first Songbook für iPhone und iPad",
      // The German tagline is a third longer than the English one and wraps to a third line at the
      // shared size. Smaller type plus a break before the dash keeps it to two. Overrides
      // layout.headlineSize.
      headlineSize: 33,
    },
  ],

  colors: {
    background: "#0A0A0A",
    text: "#FAFAFA",
    muted: "#A1A1AA",
    // The squircle mirrors the dark-mode header logo: light tile, dark glyph.
    iconTile: "#FAFAFA",
    iconGlyph: "#0A0A0A",
  },

  layout: {
    padding: 80,
    columnGap: 72,
    wordmarkSize: 96,
    // Default for a card that does not override it; see CONFIG.cards.
    headlineSize: 50,
    footnoteSize: 24,
    iconSize: 380,
    // Superellipse exponent for the squircle. 4–5 reads like an iOS icon;
    // higher is boxier, lower tends toward an ellipse.
    squircleExponent: 5,
    // Fraction of the tile left empty above and below the glyph. 0 matches
    // apple-icon.png exactly: keys touch the top edge, stems reach the bottom.
    glyphInset: 0,
  },

  fonts: [
    { file: "assets/fonts/Geist-Regular.ttf", name: "Geist", weight: 400 },
    { file: "assets/fonts/Geist-Bold.ttf", name: "Geist", weight: 700 },
    { file: "assets/fonts/GeistMono-Regular.ttf", name: "Geist Mono", weight: 400 },
  ],
}

/* ───────────────────────────── END CONFIG ───────────────────────────── */

function buildElement(iconUri, card) {
  const { colors, layout } = CONFIG

  const wordmark = h(
    "div",
    {
      style: {
        fontFamily: "Geist",
        fontWeight: 700,
        fontSize: layout.wordmarkSize,
        letterSpacing: "-0.035em",
        lineHeight: 1,
        color: colors.text,
      },
    },
    CONFIG.wordmark,
  )

  const headline = h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        fontFamily: "Geist",
        fontWeight: 700,
        fontSize: card.headlineSize ?? layout.headlineSize,
        letterSpacing: "-0.02em",
        lineHeight: 1.22,
        color: colors.text,
      },
    },
    ...card.headline.map((line, index) => h("div", { key: index }, line)),
  )

  const footnote = h(
    "div",
    {
      style: {
        fontFamily: "Geist Mono",
        fontWeight: 400,
        fontSize: layout.footnoteSize,
        letterSpacing: "-0.01em",
        color: colors.muted,
      },
    },
    card.footnote,
  )

  const textColumn = h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        // Space the three blocks apart without relying on margins.
        gap: 28,
      },
    },
    wordmark,
    headline,
    footnote,
  )

  const icon = h("img", {
    src: iconUri,
    width: layout.iconSize,
    height: layout.iconSize,
    style: { flexShrink: 0 },
  })

  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: layout.columnGap,
        padding: layout.padding,
        background: colors.background,
      },
    },
    textColumn,
    icon,
  )
}

async function main() {
  const { layout, colors, width, height, cards } = CONFIG

  const fonts = await Promise.all(
    CONFIG.fonts.map(async ({ file, name, weight }) => ({
      name,
      weight,
      style: "normal",
      data: await readFile(path.join(projectRoot, file)),
    })),
  )

  const iconUri = svgDataUri(
    markSvg({
      size: layout.iconSize,
      exponent: layout.squircleExponent,
      glyphInset: layout.glyphInset,
      tileColor: colors.iconTile,
      glyphColor: colors.iconGlyph,
    }),
  )

  for (const card of cards) {
    const tagline = phrase("tagline", card.language)
    const rendered = card.headline.join(" ")
    if (rendered !== tagline) {
      throw new Error(
        `The ${card.language} card headline reads "${rendered}" but VOCABULARY.md says the tagline is ` +
          `"${tagline}". Update the headline lines in CONFIG, or change the tagline in the app repository ` +
          "and run pnpm sync:app.",
      )
    }

    const response = new ImageResponse(buildElement(iconUri, card), { width, height, fonts })
    const buffer = Buffer.from(await response.arrayBuffer())

    await writeFile(path.join(projectRoot, card.output), buffer)

    console.log(`Wrote ${card.output} (${width}x${height}, ${(buffer.length / 1024).toFixed(1)} kB).`)
  }
}

await main()
