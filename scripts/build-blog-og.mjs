/**
 * Builds one Open Graph card per blog post at public/blog/og/<slug>.png.
 *
 *   pnpm build:og
 *
 * Cards are generated for every post in content/blog, including drafts and
 * future-dated ones, so a scheduled post already has its card when it goes live.
 *
 * This is a sibling of scripts/build-og-image.mjs rather than part of it: the
 * layouts differ (post title and date versus headline and wordmark), and keeping
 * them apart means this can never change public/og.png. Both share the mark
 * geometry in scripts/lib/chordlist-mark.mjs and the fonts in assets/fonts, so the
 * build stays hermetic and offline.
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { createElement as h } from "react"
import { ImageResponse } from "next/og.js"
import { parse as parseYaml } from "yaml"

import { markSvg, svgDataUri } from "./lib/chordlist-mark.mjs"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

/* ─────────────────────────────── CONFIG ─────────────────────────────── */

const CONFIG = {
  source: "content/blog",
  outputDirectory: "public/blog/og",

  width: 1200,
  height: 630,

  copy: {
    wordmark: "chordlist",
    // Sits above the title, in place of the site card's footnote.
    eyebrow: "Blog",
  },

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
    metaSize: 24,
    iconSize: 96,
    squircleExponent: 5,
    glyphInset: 0,
    // Titles longer than this are truncated rather than allowed to overflow.
    titleMaxLength: 110,
  },

  fonts: [
    { file: "assets/fonts/Geist-Regular.ttf", name: "Geist", weight: 400 },
    { file: "assets/fonts/Geist-Bold.ttf", name: "Geist", weight: 700 },
    { file: "assets/fonts/GeistMono-Regular.ttf", name: "Geist Mono", weight: 400 },
  ],
}

/* ───────────────────────────── END CONFIG ───────────────────────────── */

/** Mirrors lib/frontmatter.ts — the scripts run outside the bundler, so they cannot import it. */
function splitFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  return match?.[1] ?? null
}

function truncate(text, maxLength) {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1).trimEnd()}…`
}

function buildElement({ title, meta, iconUri }) {
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
        copy.eyebrow,
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
    truncate(title, layout.titleMaxLength),
  )

  const footer = h(
    "div",
    { style: { display: "flex", fontFamily: "Geist Mono", fontSize: layout.metaSize, color: colors.muted } },
    meta,
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
  const { layout, colors, width, height, source, outputDirectory } = CONFIG

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

  const sourceDirectory = path.join(projectRoot, source)
  const entries = await readdir(sourceDirectory, { withFileTypes: true })
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"))

  const destinationDirectory = path.join(projectRoot, outputDirectory)
  await mkdir(destinationDirectory, { recursive: true })

  for (const file of files) {
    const slug = file.name.slice(0, -".md".length)
    const raw = await readFile(path.join(sourceDirectory, file.name), "utf8")
    const frontmatter = splitFrontmatter(raw)

    if (frontmatter === null) {
      throw new Error(`${source}/${file.name}: missing YAML frontmatter`)
    }

    const data = parseYaml(frontmatter)
    const title = typeof data?.title === "string" ? data.title : null
    if (title === null) throw new Error(`${source}/${file.name}: "title" is required`)

    const published = data?.published instanceof Date ? data.published.toISOString().slice(0, 10) : data?.published
    const tags = Array.isArray(data?.tags) ? data.tags : []
    const meta = [published, ...tags].filter(Boolean).join("  ·  ")

    const response = new ImageResponse(buildElement({ title, meta, iconUri }), { width, height, fonts })
    const buffer = Buffer.from(await response.arrayBuffer())
    await writeFile(path.join(destinationDirectory, `${slug}.png`), buffer)
  }

  console.log(`Wrote ${files.length} blog card${files.length === 1 ? "" : "s"} to ${outputDirectory}/.`)
}

await main()
