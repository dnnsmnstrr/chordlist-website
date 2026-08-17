/**
 * Builds the App Store screenshot set from the current press-kit captures.
 *
 *   pnpm build:screens
 *
 * The pre-script refreshes public/app-screenshots from the iOS repository, then
 * this runner composes the same five messages for Apple's 6.5-inch iPhone and
 * 13-inch iPad upload slots. Rendering uses the website's existing ImageResponse
 * stack and local fonts, just like the social and Open Graph asset builders.
 *
 * Every language in `scripts/lib/app-store-copy.mjs` gets its own set, built from that language's
 * simulator captures — never from the English ones, because a German headline over an English
 * interface is a listing that lies. English keeps the original output paths and every other
 * language nests under its code, matching how the app repository stores its captures.
 */
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { ImageResponse } from "next/og.js"

import { appStoreCopy, copyLanguages } from "./lib/app-store-copy.mjs"
import { appStoreScreenshot } from "./lib/app-store-screenshot-template.mjs"
import { vocabularyLanguages } from "./lib/vocabulary.mjs"
import { zipArchive } from "./lib/zip-archive.mjs"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const CONFIG = {
  outputDirectory: "public/app-store-screenshots",
  captureDirectory: "public/app-screenshots",
  photoDirectory: "assets/visual-references/analog-photography",
  variants: ["classic", "analog"],
  /// The language whose captures and output paths carry no language segment, as in the app
  /// repository's `press-kit/raw-screenshots/`.
  sourceLanguage: "en",
  fonts: [
    { file: "assets/fonts/Geist-Regular.ttf", name: "Geist", weight: 400 },
    { file: "assets/fonts/Geist-Bold.ttf", name: "Geist", weight: 700 },
    { file: "assets/fonts/GeistMono-Regular.ttf", name: "Geist Mono", weight: 400 },
  ],
  devices: {
    iphone: {
      name: "iphone",
      label: "6.5-inch iPhone",
      width: 1242,
      height: 2688,
      /// Where this device's captures sit under the language directory; the iPhone is at its root.
      captureSegment: "",
      acceptedSourceSizes: [[1242, 2688]],
      copy: {
        left: 92,
        top: 88,
        gap: 22,
        pillPaddingX: 24,
        pillPaddingY: 12,
        pillSize: 24,
        headlineSize: 88,
        supportingSize: 38,
      },
      glow: { right: -240, top: -170, size: 760 },
      frame: { x: 102, y: 704, width: 1038, height: 2250, border: 24, radius: 150 },
      screen: { width: 990, height: 2142, radius: 126 },
      dynamicIsland: { width: 274, height: 78, top: 25 },
    },
    ipad: {
      name: "ipad",
      label: "13-inch iPad",
      width: 2048,
      height: 2732,
      captureSegment: "ipad",
      acceptedSourceSizes: [[2064, 2752]],
      copy: {
        left: 128,
        top: 100,
        gap: 26,
        pillPaddingX: 30,
        pillPaddingY: 14,
        pillSize: 28,
        headlineSize: 112,
        supportingSize: 44,
      },
      glow: { right: -260, top: -320, size: 1050 },
      frame: { x: 118, y: 676, width: 1812, height: 2416, border: 28, radius: 102 },
      screen: { width: 1756, height: 2341, radius: 74 },
    },
  },
  /// Art direction only; the words for each slide come from `scripts/lib/app-store-copy.mjs`,
  /// keyed by these ids, so adding a language never touches this block.
  slides: [
    {
      id: "01-library",
      screenshot: "01-Song-List.png",
      appearance: "light",
      gradient: ["#17142B", "#5B3FD6"],
      accent: "#B9ABFF",
      backgrounds: {
        iphone: { file: "guitarist-in-motion.png", focus: [0.72, 0.48] },
        ipad: { file: "guitarist-in-motion.png", focus: [0.58, 0.5] },
      },
    },
    {
      id: "02-find",
      screenshot: "04-Search.png",
      appearance: "dark",
      gradient: ["#101A22", "#197D78"],
      accent: "#76E6D3",
      backgrounds: {
        iphone: { file: "piano-keys-in-motion.png", focus: [0.56, 0.48] },
        ipad: { file: "piano-keys-in-motion.png", focus: [0.54, 0.5] },
      },
    },
    {
      id: "03-song-sheet",
      screenshot: "07-Song-Suggestions.png",
      appearance: "light",
      gradient: ["#24140F", "#B85F28"],
      accent: "#FFBE78",
      backgrounds: {
        iphone: { file: "phone-on-sheet-music.png", focus: [0.64, 0.38] },
        ipad: { file: "piano-with-sheet-music.png", focus: [0.54, 0.44] },
      },
    },
    {
      id: "04-flow",
      screenshot: "03-Creation-Flow.png",
      appearance: "dark",
      gradient: ["#111D18", "#35755C"],
      accent: "#9CE7BE",
      backgrounds: {
        iphone: { file: "stage-microphone-in-motion.png", focus: [0.53, 0.48] },
        ipad: { file: "stage-microphone-in-motion.png", focus: [0.52, 0.5] },
      },
    },
    {
      id: "05-stage",
      screenshot: "02-Song-Detail.png",
      appearance: "light",
      gradient: ["#181818", "#55505E"],
      accent: "#E9DEFF",
      backgrounds: {
        iphone: { file: "studio-microphone-in-motion.png", focus: [0.45, 0.34] },
        ipad: { file: "studio-microphone-in-motion.png", focus: [0.46, 0.44] },
      },
    },
  ],
}

function pngSize(data) {
  const signature = data.subarray(0, 8).toString("hex")
  if (signature !== "89504e470d0a1a0a") throw new Error("source is not a PNG")
  return [data.readUInt32BE(16), data.readUInt32BE(20)]
}

function sizeIsAccepted(size, accepted) {
  return accepted.some(([width, height]) => size[0] === width && size[1] === height)
}

async function exists(absolutePath) {
  try {
    await access(absolutePath)
    return true
  } catch {
    return false
  }
}

/// English sits at the root of both trees and every other language nests under its code, which is
/// how the app repository writes its captures and keeps the original paths valid.
function languageSegment(language) {
  return language === CONFIG.sourceLanguage ? "" : language
}

function captureDirectory({ language, device, appearance }) {
  return path.join(CONFIG.captureDirectory, languageSegment(language), device.captureSegment, appearance)
}

function archivePath({ language, variant, device }) {
  const language_ = languageSegment(language)
  return path.posix.join("downloads", `chordlist-${language_ ? `${language_}-` : ""}${variant}-${device.name}.zip`)
}

function captureCommand({ language, device, appearance }) {
  return `./scripts/capture-screenshots.sh --language ${language} --device ${device.name} --${appearance}`
}

function slideCopy(language, slide) {
  const copy = appStoreCopy[language]?.[slide.id]
  if (!copy) {
    throw new Error(
      `No ${language} copy for slide "${slide.id}". Add it to scripts/lib/app-store-copy.mjs.`,
    )
  }
  return copy
}

function checkLanguages() {
  for (const language of copyLanguages) {
    if (!vocabularyLanguages.includes(language)) {
      throw new Error(
        `App Store copy is written in "${language}", which VOCABULARY.md does not carry. ` +
          `Add the column there so the shared wording exists, then pnpm sync:app.`,
      )
    }
    // Reading every slide now turns a missing translation into one clear failure before any
    // rendering happens, rather than a half-built set.
    for (const slide of CONFIG.slides) checkHeadlineFits(language, slide)
  }
}

/**
 * Headlines are hand-broken into lines and never wrap, so a translation that runs longer than the
 * English original runs off the image. This is an estimate — the renderer measures the real glyphs
 * — so it warns rather than fails, early enough to reword before anyone looks at 30 PNGs.
 */
function checkHeadlineFits(language, slide) {
  const averageGlyph = 0.58 // Geist Bold at the headline's -0.035em tracking, measured off the set.

  for (const device of Object.values(CONFIG.devices)) {
    const columnWidth = device.width - device.copy.left * 2

    for (const line of slideCopy(language, slide).headline) {
      if (line.length * device.copy.headlineSize * averageGlyph <= columnWidth) continue
      console.warn(
        `  note: the ${language} "${slide.id}" headline line "${line}" is likely too wide for the ` +
          `${device.label}. Shorten it in scripts/lib/app-store-copy.mjs, or break it differently.`,
      )
    }
  }
}

/**
 * The captures for one language and device, or `null` when that language has none at all.
 *
 * A language that has been captured in only one appearance still gets a full set: the slide keeps
 * its art direction and borrows the other appearance's capture, which is reported at the end so the
 * gap is visible and fixable. Substituting the English capture is never an option — the interface in
 * the image has to speak the language of the words beside it.
 */
async function resolveCaptures({ language, device, loadPng }) {
  const resolved = []

  for (const slide of CONFIG.slides) {
    const appearances = [slide.appearance, slide.appearance === "light" ? "dark" : "light"]
    let capture = null

    for (const appearance of appearances) {
      const directory = captureDirectory({ language, device, appearance })
      if (!(await exists(path.join(projectRoot, directory)))) continue

      const file = path.join(directory, slide.screenshot)
      const source = await loadPng(file).catch(() => {
        throw new Error(`Missing ${device.label} source screenshot: ${file}`)
      })
      if (!sizeIsAccepted([source.width, source.height], device.acceptedSourceSizes)) {
        throw new Error(
          `${file} is ${source.width}×${source.height}; expected ` +
            device.acceptedSourceSizes.map((size) => size.join("×")).join(" or "),
        )
      }

      capture = { slide, source, file, appearance }
      break
    }

    if (!capture) return null
    resolved.push(capture)
  }

  return resolved
}

async function main() {
  checkLanguages()

  const fonts = await Promise.all(
    CONFIG.fonts.map(async ({ file, name, weight }) => ({
      name,
      weight,
      style: "normal",
      data: await readFile(path.join(projectRoot, file)),
    })),
  )

  const destinationRoot = path.join(projectRoot, CONFIG.outputDirectory)
  await rm(destinationRoot, { recursive: true, force: true })
  await mkdir(destinationRoot, { recursive: true })

  const imageCache = new Map()
  const loadPng = async (relativePath) => {
    if (!imageCache.has(relativePath)) {
      const data = await readFile(path.join(projectRoot, relativePath))
      const [width, height] = pngSize(data)
      imageCache.set(relativePath, {
        width,
        height,
        uri: `data:image/png;base64,${data.toString("base64")}`,
      })
    }
    return imageCache.get(relativePath)
  }

  const manifest = []
  const uncaptured = []
  const substituted = []

  for (const language of copyLanguages) {
    for (const device of Object.values(CONFIG.devices)) {
      const captures = await resolveCaptures({ language, device, loadPng })
      if (!captures) {
        // The source language is the set that has to exist; a translation is allowed to be waiting
        // on its captures without failing everyone else's build.
        if (language === CONFIG.sourceLanguage) {
          throw new Error(
            `No ${language} ${device.label} captures under ` +
              `${captureDirectory({ language, device, appearance: "light" })}. ` +
              `Run pnpm sync:assets, or capture them with ${captureCommand({ language, device, appearance: "light" })}.`,
          )
        }
        uncaptured.push({ language, device })
        continue
      }

      for (const capture of captures) {
        if (capture.appearance !== capture.slide.appearance) substituted.push({ language, device, capture })
      }

      for (const variant of CONFIG.variants) {
        const destination = path.join(
          destinationRoot,
          languageSegment(language),
          variant === "classic" ? "" : variant,
          device.name,
        )
        await mkdir(destination, { recursive: true })

        for (const [index, { slide, source, file }] of captures.entries()) {
          const copy = slideCopy(language, slide)

          let background
          if (variant === "analog") {
            const definition = slide.backgrounds[device.name]
            const photoPath = path.join(CONFIG.photoDirectory, definition.file)
            background = { ...(await loadPng(photoPath)), focus: definition.focus }
          }

          const element = appStoreScreenshot({
            slide: { ...slide, ...copy },
            device,
            screenshot: source.uri,
            variant,
            background,
            seed: (index + 1) * 37 + (device.name === "ipad" ? 11 : 0),
          })
          const response = new ImageResponse(element, { width: device.width, height: device.height, fonts })
          const filename = `${String(index + 1).padStart(2, "0")}-${slide.id.slice(3)}.png`
          const outputPath = path.join(destination, filename)
          await writeFile(outputPath, Buffer.from(await response.arrayBuffer()))

          manifest.push({
            language,
            variant,
            device: device.name,
            label: device.label,
            width: device.width,
            height: device.height,
            file: path.relative(destinationRoot, outputPath),
            headline: copy.headline.join(" "),
            supporting: copy.supporting,
            source: file,
            archive: archivePath({ language, variant, device }),
            background:
              variant === "analog"
                ? path.join(CONFIG.photoDirectory, slide.backgrounds[device.name].file)
                : null,
          })
          console.log(
            `  wrote ${path.relative(projectRoot, outputPath)} ` +
              `(${device.width}×${device.height}, ${language}, ${variant})`,
          )
        }
      }
    }
  }

  const archiveGroups = new Map()
  for (const entry of manifest) {
    const entries = archiveGroups.get(entry.archive) ?? []
    entries.push(entry)
    archiveGroups.set(entry.archive, entries)
  }
  for (const [archive, entries] of archiveGroups) {
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

  const languages = [...new Set(manifest.map((entry) => entry.language))]
  console.log(
    `Built ${manifest.length} App Store screenshots across ${CONFIG.variants.length} variants ` +
      `in ${languages.join(", ")}.`,
  )

  for (const { language, device, capture } of substituted) {
    console.warn(
      `  note: the ${language} ${device.label} "${capture.slide.id}" slide is designed around a ` +
        `${capture.slide.appearance} capture and used the ${capture.appearance} one. ` +
        `Capture the set with ${captureCommand({ language, device, appearance: capture.slide.appearance })} ` +
        `in the app repository, then pnpm sync:app.`,
    )
  }
  for (const { language, device } of uncaptured) {
    console.warn(
      `  note: no ${language} ${device.label} set was built — that language has no captures. ` +
        `Capture them with ${captureCommand({ language, device, appearance: "light" })} ` +
        `in the app repository, then pnpm sync:app.`,
    )
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
