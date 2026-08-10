/**
 * Builds one Open Graph card per static page at public/og/<page>.png.
 *
 *   pnpm build:og
 *
 * Sharing /docs used to preview the home page card, which told a reader nothing
 * about where the link went. lib/page-metadata.ts points each route at the card
 * named after it, so adding a page here is what gives it its own preview.
 *
 * A sibling of build-og-image.mjs and build-blog-og.mjs for the same reason those
 * two are separate: this can never change public/og.png or a post card. The layout
 * deliberately matches the blog card, so the whole site's previews read as one set.
 *
 * Copy below mirrors the `metadata` blocks in locales/en.ts — the scripts run
 * outside the bundler and cannot import TypeScript. Keep the two in step.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { createElement as h } from "react"
import { ImageResponse } from "next/og.js"

import { markSvg, svgDataUri } from "./lib/chordlist-mark.mjs"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

/* ─────────────────────────────── CONFIG ─────────────────────────────── */

const CONFIG = {
  outputDirectory: "public/og",

  width: 1200,
  height: 630,

  copy: {
    wordmark: "chordlist",
    // Prefixes the route in the eyebrow, so the card reads as an address.
    domain: "chordlist.app",
  },

  // One entry per route with its own card. `slug` is the route segment and the
  // file name: /docs becomes public/og/docs.png. Unlisted routes (/gallery, the
  // social editor) are left out on purpose — they fall back to the site card.
  pages: [
    {
      slug: "docs",
      title: "Documentation",
      description: "Organize the Markdown files, work with Obsidian, and keep an iCloud song folder offline.",
    },
    {
      slug: "blog",
      title: "Blog",
      description: "Notes on plain-text songbooks, chord progressions, and building chordlist.",
    },
    {
      slug: "faq",
      title: "Frequently Asked Questions",
      description: "Files, privacy, pricing, compatibility, and availability.",
    },
    {
      slug: "press",
      title: "Press Kit",
      description: "Product details, screenshots, and press contacts.",
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      description: "How chordlist handles song files, optional analytics, imports, and purchases.",
    },
  ],

  colors: {
    background: "#0A0A0A",
    text: "#FAFAFA",
    muted: "#A1A1AA",
    iconTile: "#FAFAFA",
    iconGlyph: "#0A0A0A",
  },

  layout: {
    padding: 80,
    wordmarkSize: 34,
    eyebrowSize: 24,
    titleSize: 64,
    descriptionSize: 28,
    iconSize: 96,
    squircleExponent: 5,
    glyphInset: 0,
    // Keeps the description off the icon's optical column and on two lines at most.
    descriptionMaxWidth: 900,
  },

  fonts: [
    { file: "assets/fonts/Geist-Regular.ttf", name: "Geist", weight: 400 },
    { file: "assets/fonts/Geist-Bold.ttf", name: "Geist", weight: 700 },
    { file: "assets/fonts/GeistMono-Regular.ttf", name: "Geist Mono", weight: 400 },
  ],
}

/* ───────────────────────────── END CONFIG ───────────────────────────── */

function buildElement({ slug, title, description, iconUri }) {
  const { copy, colors, layout } = CONFIG

  const header = h(
    "div",
    { style: { display: "flex", alignItems: "center", gap: 20 } },
    h("img", { src: iconUri, width: layout.iconSize, height: layout.iconSize, style: { flexShrink: 0 } }),
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 6 } },
      h(
        "div",
        {
          style: {
            fontFamily: "Geist",
            fontWeight: 700,
            fontSize: layout.wordmarkSize,
            letterSpacing: "-0.03em",
            color: colors.text,
          },
        },
        copy.wordmark,
      ),
      h(
        "div",
        { style: { fontFamily: "Geist Mono", fontSize: layout.eyebrowSize, color: colors.muted } },
        `${copy.domain}/${slug}`,
      ),
    ),
  )

  const heading = h(
    "div",
    {
      style: {
        display: "flex",
        fontFamily: "Geist",
        fontWeight: 700,
        fontSize: layout.titleSize,
        letterSpacing: "-0.02em",
        lineHeight: 1.15,
        color: colors.text,
      },
    },
    title,
  )

  const footer = h(
    "div",
    {
      style: {
        display: "flex",
        maxWidth: layout.descriptionMaxWidth,
        fontFamily: "Geist",
        fontSize: layout.descriptionSize,
        lineHeight: 1.35,
        color: colors.muted,
      },
    },
    description,
  )

  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: layout.padding,
        background: colors.background,
      },
    },
    header,
    heading,
    footer,
  )
}

async function main() {
  const { layout, colors, width, height, outputDirectory, pages } = CONFIG

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

  const destinationDirectory = path.join(projectRoot, outputDirectory)
  await mkdir(destinationDirectory, { recursive: true })

  for (const page of pages) {
    const response = new ImageResponse(buildElement({ ...page, iconUri }), { width, height, fonts })
    const buffer = Buffer.from(await response.arrayBuffer())
    await writeFile(path.join(destinationDirectory, `${page.slug}.png`), buffer)
  }

  console.log(`Wrote ${pages.length} page card${pages.length === 1 ? "" : "s"} to ${outputDirectory}/.`)
}

await main()
