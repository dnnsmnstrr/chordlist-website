/**
 * Builds every social asset declared in content/social into public/social/.
 *
 *   pnpm build:social
 *
 * One definition file produces one PNG per format it asks for, so a single
 * reviewed source of copy fans out to the X card, the Instagram feed post, and
 * the story without anyone re-typing the headline into three canvases.
 *
 * This is a sibling of scripts/build-og-image.mjs and scripts/build-blog-og.mjs
 * rather than part of either: those two own fixed, site-owned images (public/og.png
 * and one card per post) and must never change when a campaign does. Everything
 * they share — the mark geometry in scripts/lib/chordlist-mark.mjs, the fonts in
 * assets/fonts, rendering through Next's bundled ImageResponse (satori + resvg) —
 * is shared here too, so the build stays hermetic and offline.
 *
 * Layouts live in scripts/lib/social-templates.mjs. Copy, colours, formats, and
 * sizing live in the CONFIG block below.
 */
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { ImageResponse } from "next/og.js"
import { parse as parseYaml } from "yaml"

import { markSvg, svgDataUri } from "./lib/chordlist-mark.mjs"
import { TEMPLATES, TEMPLATE_FIELDS, frame } from "./lib/social-templates.mjs"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

/* ─────────────────────────────── CONFIG ─────────────────────────────── */

const CONFIG = {
  source: "content/social",
  outputDirectory: "public/social",
  screenshotDirectory: "public/app-screenshots/dark",

  /**
   * The format matrix. `scale` multiplies every type size in `type` below, so a
   * story reads at arm's length without a second set of numbers to maintain.
   *
   * `safeTop`/`safeBottom` hold content clear of the platform's own chrome. They
   * only matter on the story, where Instagram draws the profile row over the top
   * of the frame and the reply bar over the bottom.
   */
  formats: {
    // X link card and any 1.91:1 preview. Matches public/og.png so a shared link
    // and a posted image sit at the same proportions in the timeline.
    card: { width: 1200, height: 630, scale: 1 },
    // Instagram feed and X vertical timeline images. 4:5 is the tallest ratio
    // both accept uncropped. Instagram's profile grid crops this to 3:4, so keep
    // anything essential away from the top and bottom eighth.
    post: { width: 1080, height: 1350, scale: 1.16 },
    // Instagram story, full bleed.
    story: { width: 1080, height: 1920, scale: 1.34, safeTop: 190, safeBottom: 240 },
  },

  /** Formats a definition gets when its frontmatter does not name any. */
  defaultFormats: ["card", "post"],

  copy: {
    wordmark: "chordlist",
  },

  colors: {
    background: "#0A0A0A",
    text: "#FAFAFA",
    muted: "#A1A1AA",
    // Quotation mark and other non-text furniture: present, never competing.
    rule: "#3F3F46",
    // The squircle mirrors the dark-mode header logo: light tile, dark glyph.
    iconTile: "#FAFAFA",
    iconGlyph: "#0A0A0A",
  },

  /** Base sizes at scale 1. Every template multiplies these by the format scale. */
  type: {
    wordmark: 34,
    lockupMark: 56,
    headline: 78,
    subhead: 52,
    chord: 104,
    footnote: 24,
  },

  layout: {
    padding: 80,
    chordGap: 44,
    squircleExponent: 5,
    glyphInset: 0,
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
  return match ? { frontmatter: match[1], body: match[2] ?? "" } : null
}

/**
 * Validates one definition and normalises its shape.
 *
 * Fails loudly with the filename in the message, the way lib/blog.ts does, so a
 * malformed asset breaks the build instead of shipping a blank PNG that nobody
 * looks at until it is already in a timeline.
 */
function readDefinition(file, data) {
  const where = `${CONFIG.source}/${file}`
  const fail = (message) => {
    throw new Error(`${where}: ${message}`)
  }

  const template = data?.template
  if (typeof template !== "string") fail(`"template" is required`)
  if (!(template in TEMPLATES)) {
    fail(`unknown template "${template}" (expected one of ${Object.keys(TEMPLATES).join(", ")})`)
  }

  for (const field of TEMPLATE_FIELDS[template]) {
    if (data[field] === undefined) fail(`template "${template}" requires "${field}"`)
  }

  if (typeof data.alt !== "string" || data.alt.trim() === "") {
    fail(`"alt" is required — every published asset needs alt text`)
  }

  const formats = data.formats ?? CONFIG.defaultFormats
  if (!Array.isArray(formats) || formats.length === 0) fail(`"formats" must be a non-empty list`)
  for (const name of formats) {
    if (!(name in CONFIG.formats)) {
      fail(`unknown format "${name}" (expected one of ${Object.keys(CONFIG.formats).join(", ")})`)
    }
  }

  // Headlines are authored as one array entry per rendered line so line breaks
  // stay an editorial decision rather than a side effect of the type size.
  const headline = data.headline === undefined ? undefined : [data.headline].flat().map(String)

  return { ...data, template, formats, headline }
}

async function loadScreenshots() {
  const directory = path.join(projectRoot, CONFIG.screenshotDirectory)
  const entries = await readdir(directory).catch(() => [])
  const screenshots = {}

  for (const name of entries.filter((entry) => entry.endsWith(".png"))) {
    const data = await readFile(path.join(directory, name))
    screenshots[name] = `data:image/png;base64,${data.toString("base64")}`
  }

  return screenshots
}

async function main() {
  const { source, outputDirectory } = CONFIG

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
      size: CONFIG.type.lockupMark * 4,
      exponent: CONFIG.layout.squircleExponent,
      glyphInset: CONFIG.layout.glyphInset,
      tileColor: CONFIG.colors.iconTile,
      glyphColor: CONFIG.colors.iconGlyph,
    }),
  )

  const assets = { screenshots: await loadScreenshots() }
  const tokens = { copy: CONFIG.copy, colors: CONFIG.colors, type: CONFIG.type, layout: CONFIG.layout }

  const sourceDirectory = path.join(projectRoot, source)
  const entries = await readdir(sourceDirectory, { withFileTypes: true })
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md")).map((entry) => entry.name)

  const destinationRoot = path.join(projectRoot, outputDirectory)
  await mkdir(destinationRoot, { recursive: true })

  const manifest = []
  let written = 0

  for (const file of files) {
    const slug = file.slice(0, -".md".length)
    const raw = await readFile(path.join(sourceDirectory, file), "utf8")
    const split = splitFrontmatter(raw)
    if (split === null) throw new Error(`${source}/${file}: missing YAML frontmatter`)

    const definition = readDefinition(file, parseYaml(split.frontmatter) ?? {})
    if (definition.draft === true) {
      console.log(`  skipped ${slug} (draft)`)
      continue
    }

    const render = TEMPLATES[definition.template]
    const outputs = []

    for (const name of definition.formats) {
      const format = { name, ...CONFIG.formats[name] }
      const scale = format.scale
      const padding = Math.round(CONFIG.layout.padding * scale)

      // The box a template may actually draw in, after padding, the platform
      // safe area, and the two fixed rows the frame reserves for the lockup and
      // the footer. Templates fit type against this rather than the raw canvas.
      const reserved = Math.round((CONFIG.type.lockupMark + CONFIG.type.footnote * 2.6) * scale)
      const inner = {
        width: format.width - padding * 2,
        height:
          format.height - padding * 2 - (format.safeTop ?? 0) - (format.safeBottom ?? 0) - reserved,
      }

      const { body, footer } = render({ definition, tokens, scale, format, inner, assets })
      const element = frame({
        tokens,
        format,
        scale,
        padding,
        iconUri,
        label: definition.eyebrow,
        body,
        footer,
      })

      const response = new ImageResponse(element, { width: format.width, height: format.height, fonts })
      const buffer = Buffer.from(await response.arrayBuffer())

      const directory = path.join(destinationRoot, slug)
      await mkdir(directory, { recursive: true })
      await writeFile(path.join(directory, `${name}.png`), buffer)

      outputs.push({ format: name, file: `${outputDirectory}/${slug}/${name}.png`, width: format.width, height: format.height })
      written += 1
    }

    // The caption below the frontmatter travels with the image so whoever posts
    // it is not rewriting copy that was already reviewed in the pull request.
    manifest.push({
      slug,
      template: definition.template,
      alt: definition.alt,
      caption: split.body.trim(),
      scheduled: definition.scheduled ?? null,
      outputs,
    })
  }

  await writeFile(path.join(destinationRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`)

  // Deleting a definition should take its images with it: an orphaned PNG keeps
  // resolving at a public URL long after the copy that justified it was removed.
  // Only directories this script owns are considered, and a failure to remove
  // one is reported rather than thrown — housekeeping should not fail a build
  // whose images all rendered.
  const built = new Set(manifest.map((entry) => entry.slug))
  for (const entry of await readdir(destinationRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || built.has(entry.name)) continue
    try {
      await rm(path.join(destinationRoot, entry.name), { recursive: true })
      console.log(`  removed ${outputDirectory}/${entry.name} (no matching definition)`)
    } catch (error) {
      console.warn(`  could not remove ${outputDirectory}/${entry.name}: ${error.message}`)
    }
  }

  console.log(`Wrote ${written} image${written === 1 ? "" : "s"} for ${manifest.length} asset${manifest.length === 1 ? "" : "s"} to ${outputDirectory}/.`)
}

await main()
