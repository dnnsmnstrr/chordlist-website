/**
 * Builds the App Store screenshot set from the current press-kit captures.
 *
 *   pnpm build:app-store
 *
 * The pre-script refreshes public/app-screenshots from the iOS repository, then
 * this runner composes the same five messages for Apple's 6.5-inch iPhone and
 * 13-inch iPad upload slots. Rendering uses the website's existing ImageResponse
 * stack and local fonts, just like the social and Open Graph asset builders.
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { ImageResponse } from "next/og.js"

import { appStoreScreenshot } from "./lib/app-store-screenshot-template.mjs"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const CONFIG = {
  outputDirectory: "public/app-store-screenshots",
  photoDirectory: "assets/visual-references/analog-photography",
  variants: ["classic", "analog"],
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
      sourceDirectory: "public/app-screenshots",
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
      sourceDirectory: "public/app-screenshots/ipad",
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
  slides: [
    {
      id: "01-library",
      eyebrow: "Your songbook",
      headline: ["Your songs.", "Ready to play."],
      supporting: "Keep lyrics and chords together, beautifully organized.",
      screenshot: "01-Song-List---4-Chord-Library.png",
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
      eyebrow: "Instant access",
      headline: ["Find any song", "in seconds."],
      supporting: "Search your library and filter by the tags that matter.",
      screenshot: "05-Tag-Filter---Piano.png",
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
      eyebrow: "Made for music",
      headline: ["Lyrics and chords,", "side by side."],
      supporting: "A focused view designed for rehearsal and performance.",
      screenshot: "02-Song-Detail---Matching-Suggestions.png",
      appearance: "light",
      gradient: ["#24140F", "#B85F28"],
      accent: "#FFBE78",
      backgrounds: {
        iphone: { file: "phone-on-sheet-music.png", focus: [0.64, 0.38] },
        ipad: { file: "piano-with-sheet-music.png", focus: [0.54, 0.44] },
      },
    },
    {
      id: "04-stage",
      eyebrow: "Performance mode",
      headline: ["Built for", "the stage."],
      supporting: "Readable, distraction-free song sheets when it counts.",
      screenshot: "01-Song-List---4-Chord-Library.png",
      appearance: "dark",
      gradient: ["#181818", "#55505E"],
      accent: "#E9DEFF",
      backgrounds: {
        iphone: { file: "stage-microphone-in-motion.png", focus: [0.53, 0.48] },
        ipad: { file: "stage-microphone-in-motion.png", focus: [0.52, 0.5] },
      },
    },
    {
      id: "05-flow",
      eyebrow: "Stay in the flow",
      headline: ["Make your set", "feel effortless."],
      supporting: "Organize the songs you love and stay in the flow.",
      screenshot: "03-Creation-Flow---New-Song.png",
      appearance: "dark",
      gradient: ["#111D18", "#35755C"],
      accent: "#9CE7BE",
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

async function main() {
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

  for (const variant of CONFIG.variants) {
    for (const device of Object.values(CONFIG.devices)) {
      const destination = path.join(
        destinationRoot,
        variant === "classic" ? "" : variant,
        device.name,
      )
      await mkdir(destination, { recursive: true })

      for (const [index, slide] of CONFIG.slides.entries()) {
        const sourcePath = path.join(
          device.sourceDirectory,
          slide.appearance,
          slide.screenshot,
        )
        const source = await loadPng(sourcePath).catch(() => {
          throw new Error(`Missing ${device.label} source screenshot: ${sourcePath}`)
        })
        if (!sizeIsAccepted([source.width, source.height], device.acceptedSourceSizes)) {
          throw new Error(
            `${sourcePath} is ${source.width}×${source.height}; expected ` +
              device.acceptedSourceSizes.map((size) => size.join("×")).join(" or "),
          )
        }

        let background
        if (variant === "analog") {
          const definition = slide.backgrounds[device.name]
          const photoPath = path.join(CONFIG.photoDirectory, definition.file)
          background = { ...(await loadPng(photoPath)), focus: definition.focus }
        }

        const element = appStoreScreenshot({
          slide,
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
          variant,
          device: device.name,
          label: device.label,
          width: device.width,
          height: device.height,
          file: path.relative(destinationRoot, outputPath),
          headline: slide.headline.join(" "),
          supporting: slide.supporting,
          source: sourcePath,
          background:
            variant === "analog"
              ? path.join(CONFIG.photoDirectory, slide.backgrounds[device.name].file)
              : null,
        })
        console.log(
          `  wrote ${path.relative(projectRoot, outputPath)} ` +
            `(${device.width}×${device.height}, ${variant})`,
        )
      }
    }
  }

  await writeFile(path.join(destinationRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`Built ${manifest.length} App Store screenshots across ${CONFIG.variants.length} variants.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
