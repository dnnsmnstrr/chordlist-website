/**
 * Builds the Open Graph image at public/og.png.
 *
 *   pnpm build:og
 *
 * Everything you are likely to want to change lives in the CONFIG block below:
 * the copy, the colours, the type sizes, and how large the app icon sits.
 * The app icon is drawn from the same geometry as components/chordlist-icon.tsx,
 * so the mark stays in sync with the header logo and the favicons.
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

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

/* ─────────────────────────────── CONFIG ─────────────────────────────── */

const CONFIG = {
  output: "public/og.png",

  // Open Graph's expected size. Most scrapers crop to 1.91:1.
  width: 1200,
  height: 630,

  copy: {
    wordmark: "chordlist",
    // One array entry per rendered line, so line breaks stay deliberate.
    headline: ["Your lyrics and chords,", "as files in your pocket."],
    footnote: "Local-first songbook for iPhone and iPad",
  },

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

function buildElement(iconUri) {
  const { copy, colors, layout } = CONFIG

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
    copy.wordmark,
  )

  const headline = h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        fontFamily: "Geist",
        fontWeight: 700,
        fontSize: layout.headlineSize,
        letterSpacing: "-0.02em",
        lineHeight: 1.22,
        color: colors.text,
      },
    },
    ...copy.headline.map((line, index) => h("div", { key: index }, line)),
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
    copy.footnote,
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
  const { layout, colors, width, height, output } = CONFIG

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

  const response = new ImageResponse(buildElement(iconUri), { width, height, fonts })
  const buffer = Buffer.from(await response.arrayBuffer())

  const destination = path.join(projectRoot, output)
  await writeFile(destination, buffer)

  console.log(`Wrote ${output} (${width}x${height}, ${(buffer.length / 1024).toFixed(1)} kB).`)
}

await main()
