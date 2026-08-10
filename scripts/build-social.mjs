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
import { TEMPLATES, TEMPLATE_FIELDS, backgroundBackdrop, frame } from "./lib/social-templates.mjs"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

/* ─────────────────────────────── CONFIG ─────────────────────────────── */

const CONFIG = {
  source: "content/social",
  outputDirectory: "public/social",
  screenshotDirectory: "public/app-screenshots/dark",
  // The lossless masters from docs/visual-language.md. Read, never written: this
  // build makes placement-specific exports and leaves the masters alone.
  photoDirectory: "assets/visual-references/analog-photography",

  /**
   * Warn when a master is cropped past this fraction of its area to fill a
   * format. The photography guide asks for a composition made for the final
   * aspect ratio rather than one master forced into every placement, and a 3:2
   * frame in a 9:16 story loses about 62% of the picture — well past the point
   * where the crop is a design decision rather than a resize.
   */
  cropWarningThreshold: 0.45,

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
    // Laid over editorial photography so type stays legible against blown
    // highlights. Heaviest at the top and bottom, where the lockup and the
    // footnote sit; lightest across the middle, so the picture still reads.
    scrim:
      "linear-gradient(180deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.55) 38%," +
      " rgba(10,10,10,0.62) 62%, rgba(10,10,10,0.92) 100%)",
  },

  /** Optional per-definition colour systems. `ink` preserves the original. */
  themes: {
    ink: {},
    paper: {
      background: "#F3F0E8",
      text: "#171717",
      muted: "#67635B",
      rule: "#C8C1B4",
      iconTile: "#171717",
      iconGlyph: "#F3F0E8",
    },
    blueprint: {
      background: "#102131",
      text: "#F7F9FB",
      muted: "#A7B5C1",
      rule: "#395064",
      iconTile: "#F7F9FB",
      iconGlyph: "#102131",
    },
  },

  /** The same quiet analog textures used by the website's ambient layer. */
  textures: {
    studio: "studio-microphone-in-motion.png",
    stage: "stage-microphone-in-motion.png",
    sampler: "sampler-and-keyboard-in-motion.png",
    guitar: "guitarist-in-motion.png",
    "piano-keys": "piano-keys-in-motion.png",
    "piano-score": "piano-with-sheet-music.png",
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

  const theme = data.theme ?? "ink"
  if (typeof theme !== "string" || !(theme in CONFIG.themes)) {
    fail(`unknown theme "${theme}" (expected one of ${Object.keys(CONFIG.themes).join(", ")})`)
  }

  if (
    data.texture !== undefined &&
    (typeof data.texture !== "string" || !(data.texture in CONFIG.textures))
  ) {
    fail(`unknown texture "${data.texture}" (expected one of ${Object.keys(CONFIG.textures).join(", ")})`)
  }
  if (data.backgroundImage !== undefined && typeof data.backgroundImage !== "string") {
    fail(`"backgroundImage" must be a photography filename`)
  }
  if (data.backgroundScale !== undefined) {
    const parsed = Number.parseFloat(String(data.backgroundScale))
    const percent = parsed <= 2 ? parsed * 100 : parsed
    if (!Number.isFinite(percent) || percent < 100 || percent > 200) {
      fail(`"backgroundScale" must be between 100% and 200%`)
    }
  }
  if (
    data.screenshotMode !== undefined &&
    !["full", "detail"].includes(data.screenshotMode)
  ) {
    fail(`"screenshotMode" must be "full" or "detail"`)
  }
  if (data.deviceFrame !== undefined && typeof data.deviceFrame !== "boolean") {
    fail(`"deviceFrame" must be true or false`)
  }
  if (data.texture !== undefined && data.backgroundImage !== undefined) {
    fail(`"texture" and "backgroundImage" cannot be used together`)
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

  return { ...data, template, theme, formats, headline }
}

/**
 * Lists a directory of PNGs up front but only reads the bytes a definition
 * actually asks for, caching each one.
 *
 * The names are needed eagerly to validate `screenshot:` and `photo:` fields and
 * to name the alternatives in an error. The bytes are not: the photography
 * masters are lossless and run to several megabytes each, and base64-encoding
 * all of them on every build to render one would cost far more memory than the
 * images themselves.
 */
async function imageLoader(directory) {
  const absolute = path.join(projectRoot, directory)
  const entries = await readdir(absolute).catch(() => [])
  const available = entries.filter((entry) => entry.toLowerCase().endsWith(".png")).sort()
  const cache = new Map()

  return {
    names: () => available,
    has: (name) => available.includes(name),
    /** Data URI for `name`, or undefined if the directory has no such file. */
    async load(name) {
      if (!available.includes(name)) return undefined
      if (!cache.has(name)) {
        const data = await readFile(path.join(absolute, name))
        cache.set(name, `data:image/png;base64,${data.toString("base64")}`)
      }
      return cache.get(name)
    },
    /** Intrinsic pixel size, read straight from the PNG's IHDR chunk. */
    async size(name) {
      const data = await readFile(path.join(absolute, name))
      return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) }
    },
  }
}

/**
 * Reports how much of a source image is discarded when it is cropped to fill a
 * target frame, as a fraction of its area.
 */
function cropLoss(source, target) {
  const sourceRatio = source.width / source.height
  const targetRatio = target.width / target.height
  const kept = sourceRatio > targetRatio ? targetRatio / sourceRatio : sourceRatio / targetRatio
  return 1 - kept
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

  const tokens = { copy: CONFIG.copy, colors: CONFIG.colors, type: CONFIG.type, layout: CONFIG.layout }

  const screenshots = await imageLoader(CONFIG.screenshotDirectory)
  const photos = await imageLoader(CONFIG.photoDirectory)

  const sourceDirectory = path.join(projectRoot, source)
  const entries = await readdir(sourceDirectory, { withFileTypes: true })
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md")).map((entry) => entry.name)

  // First pass: parse and validate everything, and resolve the images that are
  // actually referenced. Nothing renders until every definition is known good,
  // so a typo in the last file cannot leave a half-built output directory.
  const definitions = []
  const resolved = { screenshots: new Map(), photos: new Map() }

  for (const file of files) {
    const raw = await readFile(path.join(sourceDirectory, file), "utf8")
    const split = splitFrontmatter(raw)
    if (split === null) throw new Error(`${source}/${file}: missing YAML frontmatter`)

    const definition = readDefinition(file, parseYaml(split.frontmatter) ?? {})
    if (definition.draft === true) {
      console.log(`  skipped ${file.slice(0, -".md".length)} (draft)`)
      continue
    }

    if (definition.screenshot !== undefined) {
      const name = definition.screenshot
      if (!screenshots.has(name)) {
        throw new Error(
          `${source}/${file}: unknown screenshot "${name}" ` +
            `(available: ${screenshots.names().join(", ") || "none"})`,
        )
      }
      if (!resolved.screenshots.has(name)) resolved.screenshots.set(name, await screenshots.load(name))
    }

    const requestedPhotos = [
      definition.photo,
      definition.backgroundImage,
      definition.texture ? CONFIG.textures[definition.texture] : undefined,
    ].filter(Boolean)

    for (const name of requestedPhotos) {
      if (!photos.has(name)) {
        throw new Error(
          `${source}/${file}: unknown photo "${name}" ` +
            `(available: ${photos.names().join(", ") || "none"})`,
        )
      }
      // The intrinsic size travels with the data URI: the photo template needs
      // it to do its own cover maths, since satori will not do it for us.
      if (!resolved.photos.has(name)) {
        resolved.photos.set(name, { uri: await photos.load(name), ...(await photos.size(name)) })
      }
    }

    // A master made for one shape and forced into another loses real picture.
    // Warn rather than fail: sometimes the crop is fine, and the author is the
    // one who can tell. Silence here would read as approval.
    const fullBleedImage = definition.photo ?? definition.backgroundImage
    if (fullBleedImage) {
      const intrinsic = resolved.photos.get(fullBleedImage)
      for (const name of definition.formats) {
        const loss = cropLoss(intrinsic, CONFIG.formats[name])
        if (loss >= CONFIG.cropWarningThreshold) {
          console.warn(
            `  ${file}: "${fullBleedImage}" is ${intrinsic.width}×${intrinsic.height} and loses ` +
              `${Math.round(loss * 100)}% of its area as a ${name}. Consider a composition made ` +
              `for that ratio, or set "focus" to steer the crop.`,
          )
        }
      }
    }

    definitions.push({ slug: file.slice(0, -".md".length), definition, caption: split.body.trim() })
  }

  const assets = {
    screenshots: { get: (name) => resolved.screenshots.get(name), names: () => screenshots.names() },
    photos: { get: (name) => resolved.photos.get(name), names: () => photos.names() },
  }

  const destinationRoot = path.join(projectRoot, outputDirectory)
  await mkdir(destinationRoot, { recursive: true })

  const manifest = []
  let written = 0

  for (const { slug, definition, caption } of definitions) {
    const render = TEMPLATES[definition.template]
    const outputs = []
    const usesFullImage = definition.template === "photo" || definition.backgroundImage
    const colors = { ...CONFIG.colors, ...CONFIG.themes[usesFullImage ? "ink" : definition.theme] }
    const definitionTokens = { ...tokens, colors }
    const iconUri = svgDataUri(
      markSvg({
        size: CONFIG.type.lockupMark * 4,
        exponent: CONFIG.layout.squircleExponent,
        glyphInset: CONFIG.layout.glyphInset,
        tileColor: colors.iconTile,
        glyphColor: colors.iconGlyph,
      }),
    )

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

      const rendered = render({
        definition,
        tokens: definitionTokens,
        scale,
        format,
        inner,
        assets,
      })
      let { backdrop } = rendered
      if (!backdrop && definition.backgroundImage) {
        backdrop = backgroundBackdrop({
          source: assets.photos.get(definition.backgroundImage),
          format,
          focus: definition.focus,
          backgroundScale: definition.backgroundScale,
          tokens: definitionTokens,
        })
      } else if (!backdrop && definition.texture) {
        backdrop = backgroundBackdrop({
          source: assets.photos.get(CONFIG.textures[definition.texture]),
          format,
          focus: "center",
          tokens: definitionTokens,
          texture: true,
        })
      }
      const element = frame({
        tokens: definitionTokens,
        format,
        scale,
        padding,
        iconUri,
        label: definition.eyebrow,
        body: rendered.body,
        footer: rendered.footer,
        backdrop,
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
      caption,
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
