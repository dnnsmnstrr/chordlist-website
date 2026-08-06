/**
 * Builds every favicon asset in public/ from one shared definition of the mark.
 *
 *   pnpm build:icons
 *
 * Rendering goes through Next's bundled ImageResponse, which rasterises with
 * resvg. That matters: ImageMagick's built-in SVG renderer produced corners
 * that were blurred and asymmetric top-to-bottom, which is why these assets are
 * generated here rather than with a shell one-liner.
 *
 * Shape and glyph geometry live in scripts/lib/chordlist-mark.mjs, shared with
 * the Open Graph image build.
 */
import { writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { createElement as h } from "react"
import { ImageResponse } from "next/og.js"

import { markSvg, svgDataUri } from "./lib/chordlist-mark.mjs"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

/* ─────────────────────────────── CONFIG ─────────────────────────────── */

const CONFIG = {
  // Matches the site's --background / --foreground tokens.
  dark: "#0A0A0A",
  light: "#FAFAFA",

  // Superellipse exponent for the tile. Raise for boxier corners.
  squircleExponent: 5,

  // 0 keeps the glyph full-bleed: keys touch the top, stems reach the bottom.
  glyphInset: 0,

  // Resolutions packed into favicon.ico.
  icoSizes: [16, 32, 48],
}

/**
 * Which way round each asset is drawn.
 *
 * "lightTile" means a light tile with a dark glyph — how the header logo looks
 * in dark mode. The PNG pair is selected by prefers-color-scheme in
 * app/layout.tsx, so icon-light-32x32 (shown to a *light* scheme) is the one
 * with the dark tile.
 */
const VARIANTS = {
  darkTile: { tileColor: CONFIG.dark, glyphColor: CONFIG.light },
  lightTile: { tileColor: CONFIG.light, glyphColor: CONFIG.dark },
}

const OUTPUTS = {
  favicon: { file: "public/favicon.ico", variant: "lightTile" },
  svg: { file: "public/icon.svg" },
  pngLightScheme: { file: "public/icon-light-32x32.png", variant: "darkTile", size: 32 },
  pngDarkScheme: { file: "public/icon-dark-32x32.png", variant: "lightTile", size: 32 },
  appleTouch: { file: "public/apple-icon.png", variant: "darkTile", size: 180 },
}

/* ───────────────────────────── END CONFIG ───────────────────────────── */

/** Rasterises the mark at an exact pixel size via resvg. */
async function renderPng(size, variant) {
  const svg = markSvg({
    size,
    exponent: CONFIG.squircleExponent,
    glyphInset: CONFIG.glyphInset,
    ...VARIANTS[variant],
  })

  const element = h(
    "div",
    { style: { display: "flex", width: "100%", height: "100%" } },
    h("img", { src: svgDataUri(svg), width: size, height: size }),
  )

  const response = new ImageResponse(element, { width: size, height: size })
  return Buffer.from(await response.arrayBuffer())
}

/**
 * Packs PNG payloads into an .ico container. PNG-compressed entries are
 * understood by every current browser (and Windows Vista onward), which keeps
 * this a pure-Node step with no image codec of our own.
 */
function packIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(images.length, 4)

  let offset = 6 + images.length * 16
  const directory = []

  for (const { size, data } of images) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0) // width (0 encodes 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1) // height
    entry.writeUInt8(0, 2) // palette size
    entry.writeUInt8(0, 3) // reserved
    entry.writeUInt16LE(1, 4) // colour planes
    entry.writeUInt16LE(32, 6) // bits per pixel
    entry.writeUInt32LE(data.length, 8)
    entry.writeUInt32LE(offset, 12)
    directory.push(entry)
    offset += data.length
  }

  return Buffer.concat([header, ...directory, ...images.map((i) => i.data)])
}

async function write(file, data) {
  await writeFile(path.join(projectRoot, file), data)
  const size = typeof data === "string" ? Buffer.byteLength(data) : data.length
  console.log(`  ${file} (${(size / 1024).toFixed(1)} kB)`)
}

async function main() {
  console.log("Building icons:")

  // Vector icon — themed at display time via prefers-color-scheme.
  await write(
    OUTPUTS.svg.file,
    `${markSvg({
      size: 180,
      exponent: CONFIG.squircleExponent,
      glyphInset: CONFIG.glyphInset,
      tileColor: CONFIG.dark,
      glyphColor: CONFIG.light,
      themed: true,
    })}\n`,
  )

  for (const key of ["pngLightScheme", "pngDarkScheme", "appleTouch"]) {
    const { file, variant, size } = OUTPUTS[key]
    await write(file, await renderPng(size, variant))
  }

  const icoImages = []
  for (const size of CONFIG.icoSizes) {
    icoImages.push({ size, data: await renderPng(size, OUTPUTS.favicon.variant) })
  }
  await write(OUTPUTS.favicon.file, packIco(icoImages))
}

await main()
