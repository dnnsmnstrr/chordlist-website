/**
 * Builds the App Store creative assets from the current app captures.
 *
 *   pnpm build:creative
 *
 * Apple's asset best practices (developer.apple.com/app-store/asset-best-practices/) describe the
 * placements this writes, at the canvas sizes of Apple's own templates:
 *
 * - **Product page header** — 3840 × 1646, the wide image above the icon, iOS 27 and iPadOS 27.
 * - **Search results** — 3840 × 2560 (3:2), shown in place of the screenshots in search.
 * - **Universal** — 5244 × 2950 (16:9), one master Apple crops into either of the above.
 * - **In-App Event card** — 3840 × 2160 (16:9), and the **event details page**, 2160 × 3840 (9:16).
 *   Both are Apple's maximum resolution; the minimum is half that.
 *
 * Apple publishes no pixel insets for the safe areas — its templates draw a centred one, and the
 * guidance is to keep text and the focal point inside it because the crop varies by device. Each
 * format's `safe` box below is that centred area, and the universal one is derived rather than
 * chosen: it is what survives both the header crop and the search crop, inset by the stricter of
 * their two safe areas.
 *
 * The words come from `scripts/lib/app-store-copy.mjs` and the backgrounds and device frames from
 * the screenshot template, so the header, the search result, and the screenshots below them are one
 * listing. Every image is an opaque PNG, which Apple requires — the creative assets cannot carry
 * transparency. Like the screenshots, each language renders from its own captures.
 *
 * Like the screenshot sets, each language and treatment also gets one ZIP of its assets in
 * `downloads/`, which `/screens` offers beside each group.
 */
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { ImageResponse } from "next/og.js"

import { campaign } from "./lib/design-tokens.mjs"
import { appStoreCopy, copyLanguages, creativeCopy } from "./lib/app-store-copy.mjs"
import { appStoreCreative, deviceCluster, fittedHeadlineSize } from "./lib/app-store-creative-template.mjs"
import { markSvg, svgDataUri } from "./lib/chordlist-mark.mjs"
import { phrase } from "./lib/vocabulary.mjs"
import { zipArchive } from "./lib/zip-archive.mjs"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const CONFIG = {
  outputDirectory: "public/app-store-creative",
  captureDirectory: "public/app-screenshots",
  photoDirectory: "assets/visual-references/analog-photography",
  variants: ["classic", "analog"],
  sourceLanguage: "en",
  wordmark: "chordlist",
  fonts: [
    { file: "assets/fonts/Geist-Regular.ttf", name: "Geist", weight: 400 },
    { file: "assets/fonts/Geist-Bold.ttf", name: "Geist", weight: 700 },
    { file: "assets/fonts/GeistMono-Regular.ttf", name: "Geist Mono", weight: 400 },
  ],
  /// Where each device's captures sit under a language directory, as in the screenshot builder.
  captureSegments: { iphone: "", ipad: "ipad" },
  /// Below this, a headline is too small to read once Apple shrinks the canvas to a phone's width —
  /// about a tenth of its pixel size for the header and search assets.
  minimumHeadlineSize: 120,
  /// Art direction per asset. `text` names what the asset says: the tagline, the search message,
  /// or nothing for event media, whose words App Store Connect sets over it.
  assets: [
    {
      id: "header",
      label: "Product page header",
      placement: "Above the app icon on the product page (iOS 27, iPadOS 27).",
      width: 3840,
      height: 1646,
      /// The iPhone shows only about the middle 2,500px of the width, so the words and devices sit
      /// well inside that rather than in Apple's wider template area.
      safe: { width: 2300, height: 1180 },
      text: "tagline",
      deviceScale: 0.9,
      deviceOverlap: 0.85,
      gap: 120,
      type: { wordmark: 120, eyebrow: 56, headline: 170, gap: 56 },
      devices: [
        { kind: "ipad", screenshot: "02-Song-Detail.png", appearance: "light", height: 1 },
        { kind: "iphone", screenshot: "01-Song-List.png", appearance: "light", height: 0.82 },
      ],
      art: {
        gradient: ["#17142B", "#5B3FD6"],
        accent: "#B9ABFF",
        photo: { file: "guitarist-in-motion.png", focus: [0.6, 0.5] },
      },
    },
    {
      id: "search",
      label: "Search results",
      placement: "In App Store search results, in place of the first screenshots.",
      width: 3840,
      height: 2560,
      safe: { width: 3300, height: 2100 },
      text: "search",
      deviceScale: 1,
      deviceOverlap: 0.2,
      gap: 160,
      type: { wordmark: 120, eyebrow: 64, headline: 220, gap: 64 },
      devices: [
        { kind: "iphone", screenshot: "01-Song-List.png", appearance: "light", height: 0.88 },
        { kind: "iphone", screenshot: "02-Song-Detail.png", appearance: "light", height: 1 },
      ],
      art: {
        gradient: ["#17142B", "#5B3FD6"],
        accent: "#B9ABFF",
        photo: { file: "guitarist-in-motion.png", focus: [0.6, 0.5] },
      },
    },
    {
      id: "universal",
      label: "Universal",
      placement: "One master for both the header and search results; Apple crops it to each.",
      width: 5244,
      height: 2950,
      /// Derived in `universalSafeArea()` from the two placements it is cropped into.
      safe: null,
      text: "tagline",
      deviceScale: 1,
      deviceOverlap: 0.85,
      gap: 200,
      type: { wordmark: 160, eyebrow: 72, headline: 220, gap: 72 },
      devices: [
        { kind: "ipad", screenshot: "02-Song-Detail.png", appearance: "light", height: 1 },
        { kind: "iphone", screenshot: "01-Song-List.png", appearance: "light", height: 0.82 },
      ],
      art: {
        gradient: ["#17142B", "#5B3FD6"],
        accent: "#B9ABFF",
        photo: { file: "guitarist-in-motion.png", focus: [0.6, 0.5] },
      },
    },
    {
      id: "event-card",
      label: "In-App Event card",
      placement: "The event card in search, Today, and on the product page. 16:9.",
      width: 3840,
      height: 2160,
      safe: { width: 3000, height: 1600 },
      text: null,
      deviceScale: 1,
      deviceOverlap: 0.85,
      gap: 0,
      devices: [
        { kind: "ipad", screenshot: "02-Song-Detail.png", appearance: "dark", height: 1 },
        { kind: "iphone", screenshot: "04-Search.png", appearance: "dark", height: 0.82 },
      ],
      art: {
        gradient: ["#111D18", "#35755C"],
        accent: "#9CE7BE",
        photo: { file: "stage-microphone-in-motion.png", focus: [0.52, 0.5] },
      },
    },
    {
      id: "event-details",
      label: "In-App Event details page",
      placement: "The full-screen event page behind the event's name and description. 9:16.",
      width: 2160,
      height: 3840,
      safe: { width: 1700, height: 2800 },
      text: null,
      deviceScale: 1,
      deviceOverlap: 0,
      gap: 0,
      devices: [{ kind: "iphone", screenshot: "02-Song-Detail.png", appearance: "dark", height: 1 }],
      art: {
        gradient: ["#181818", "#55505E"],
        accent: "#E9DEFF",
        photo: { file: "studio-microphone-in-motion.png", focus: [0.46, 0.4] },
      },
    },
  ],
}

function asset(id) {
  return CONFIG.assets.find((entry) => entry.id === id)
}

/**
 * The universal asset is cropped to the header's 2.33:1 and to search's 3:2, so only the middle both
 * crops keep is safe — and within that, the stricter of the two placements' own safe-area insets.
 */
function universalSafeArea(universal) {
  const header = asset("header")
  const search = asset("search")
  const crop = {
    width: Math.min(universal.width, Math.round(universal.height * (search.width / search.height))),
    height: Math.min(universal.height, Math.round(universal.width / (header.width / header.height))),
  }
  const widthRatio = Math.min(header.safe.width / header.width, search.safe.width / search.width)
  const heightRatio = Math.min(header.safe.height / header.height, search.safe.height / search.height)
  return { width: Math.round(crop.width * widthRatio), height: Math.round(crop.height * heightRatio) }
}

function pngSize(data) {
  if (data.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") throw new Error("source is not a PNG")
  return [data.readUInt32BE(16), data.readUInt32BE(20)]
}

async function exists(absolutePath) {
  try {
    await access(absolutePath)
    return true
  } catch {
    return false
  }
}

function languageSegment(language) {
  return language === CONFIG.sourceLanguage ? "" : language
}

/// The words an asset carries in one language, or `null` for event media.
function assetText(language, definition) {
  if (!definition.text) return null

  const copy = creativeCopy[language]
  if (!copy) throw new Error(`No ${language} creative copy. Add it to scripts/lib/app-store-copy.mjs.`)

  if (definition.text === "tagline") {
    // The whole tagline, or its opening words closed with a full stop — a headline Apple shows at a
    // tenth of its size reads better short, but it still says only what the tagline says.
    const tagline = phrase("tagline", language)
    const rendered = copy.tagline.join(" ")
    const opening = rendered.endsWith(".") && tagline.startsWith(rendered.slice(0, -1))
    if (rendered !== tagline && !opening) {
      throw new Error(
        `The ${language} creative tagline reads "${rendered}" but VOCABULARY.md says "${tagline}", and it is ` +
          "neither that nor its opening words. Update creativeCopy in scripts/lib/app-store-copy.mjs, or the " +
          "tagline in the app repository and pnpm sync:app.",
      )
    }
    return { wordmark: CONFIG.wordmark, headline: copy.tagline }
  }

  const slide = appStoreCopy[language]?.[copy.search]
  if (!slide) throw new Error(`No ${language} copy for slide "${copy.search}" in scripts/lib/app-store-copy.mjs.`)
  return { eyebrow: slide.eyebrow, headline: slide.headline }
}

/**
 * Warns when a headline has to shrink below what reads at the size Apple shows it. The renderer
 * fits each headline to its column, so this is the check that the fitting did not hide a problem.
 */
function checkHeadlineSizes() {
  for (const language of copyLanguages) {
    for (const definition of CONFIG.assets) {
      const text = assetText(language, definition)
      if (!text) continue

      const cluster = deviceCluster({
        devices: definition.devices.map((device) => ({ ...device, uri: "" })),
        height: Math.round(definition.safe.height * definition.deviceScale),
        overlap: definition.deviceOverlap,
      })
      const size = fittedHeadlineSize({
        lines: text.headline,
        columnWidth: definition.safe.width - cluster.width - definition.gap,
        maximum: definition.type.headline,
      })
      if (size < CONFIG.minimumHeadlineSize) {
        console.warn(
          `  note: the ${language} ${definition.label} headline fits only at ${size}px, which is hard to ` +
            `read once Apple scales it down. Break it into shorter lines in scripts/lib/app-store-copy.mjs.`,
        )
      }
    }
  }
}

async function main() {
  const universal = asset("universal")
  universal.safe = universalSafeArea(universal)
  checkHeadlineSizes()

  const fonts = await Promise.all(
    CONFIG.fonts.map(async ({ file, name, weight }) => ({
      name,
      weight,
      style: "normal",
      data: await readFile(path.join(projectRoot, file)),
    })),
  )

  const colors = campaign("ink")
  const iconUri = svgDataUri(markSvg({ size: 400, tileColor: colors.iconTile, glyphColor: colors.iconGlyph }))

  const imageCache = new Map()
  const loadPng = async (relativePath) => {
    if (!imageCache.has(relativePath)) {
      const data = await readFile(path.join(projectRoot, relativePath))
      const [width, height] = pngSize(data)
      imageCache.set(relativePath, { width, height, uri: `data:image/png;base64,${data.toString("base64")}` })
    }
    return imageCache.get(relativePath)
  }

  /// A language's capture of one screen, in the asked-for appearance or else the other — never
  /// another language's, for the same reason as the screenshots. `null` when there is none.
  const loadCapture = async (language, { kind, screenshot, appearance }) => {
    for (const candidate of [appearance, appearance === "light" ? "dark" : "light"]) {
      const file = path.join(
        CONFIG.captureDirectory,
        languageSegment(language),
        CONFIG.captureSegments[kind],
        candidate,
        screenshot,
      )
      if (await exists(path.join(projectRoot, file))) return { file, ...(await loadPng(file)) }
    }
    return null
  }

  const destinationRoot = path.join(projectRoot, CONFIG.outputDirectory)
  await rm(destinationRoot, { recursive: true, force: true })
  await mkdir(destinationRoot, { recursive: true })

  const manifest = []
  const skipped = []

  for (const language of copyLanguages) {
    for (const [index, definition] of CONFIG.assets.entries()) {
      const captures = await Promise.all(definition.devices.map((device) => loadCapture(language, device)))
      if (captures.some((capture) => !capture)) {
        if (language === CONFIG.sourceLanguage) {
          throw new Error(`Missing ${language} captures for the ${definition.label}. Run pnpm sync:assets.`)
        }
        skipped.push({ language, definition })
        continue
      }

      const text = assetText(language, definition)
      const devices = definition.devices.map((device, deviceIndex) => ({
        ...device,
        uri: captures[deviceIndex].uri,
      }))

      for (const variant of CONFIG.variants) {
        const photoPath = path.join(CONFIG.photoDirectory, definition.art.photo.file)
        const background =
          variant === "analog" ? { ...(await loadPng(photoPath)), focus: definition.art.photo.focus } : undefined

        const element = appStoreCreative({
          format: definition,
          art: definition.art,
          text,
          devices,
          variant,
          background,
          iconUri,
          seed: (index + 1) * 53,
        })
        const response = new ImageResponse(element, {
          width: definition.width,
          height: definition.height,
          fonts,
        })

        const directory = path.join(destinationRoot, languageSegment(language), variant)
        await mkdir(directory, { recursive: true })
        const outputPath = path.join(directory, `${definition.id}.png`)
        await writeFile(outputPath, Buffer.from(await response.arrayBuffer()))

        manifest.push({
          language,
          variant,
          asset: definition.id,
          label: definition.label,
          placement: definition.placement,
          width: definition.width,
          height: definition.height,
          safe: definition.safe,
          file: path.relative(destinationRoot, outputPath),
          headline: text ? text.headline.join(" ") : null,
          sources: captures.map((capture) => capture.file),
          archive: path.posix.join(
            "downloads",
            `chordlist-creative-${languageSegment(language) ? `${language}-` : ""}${variant}.zip`,
          ),
        })
        console.log(
          `  wrote ${path.relative(projectRoot, outputPath)} ` +
            `(${definition.width}×${definition.height}, ${language}, ${variant})`,
        )
      }
    }
  }

  for (const [archive, entries] of Map.groupBy(manifest, (entry) => entry.archive)) {
    const archiveEntries = await Promise.all(
      entries.map(async (entry) => ({
        name: path.basename(entry.file),
        data: await readFile(path.join(destinationRoot, entry.file)),
      })),
    )
    const outputPath = path.join(destinationRoot, archive)
    await mkdir(path.dirname(outputPath), { recursive: true })
    await writeFile(outputPath, zipArchive(archiveEntries))
    console.log(`  wrote ${path.relative(projectRoot, outputPath)} (${archiveEntries.length} PNGs)`)
  }

  await writeFile(path.join(destinationRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`Built ${manifest.length} App Store creative assets.`)

  for (const { language, definition } of skipped) {
    console.warn(
      `  note: no ${language} ${definition.label} was built — that language is missing a capture it ` +
        "needs. Capture it in the app repository, then pnpm sync:app.",
    )
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
