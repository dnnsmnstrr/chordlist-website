"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Check, ClipboardPaste, Copy, Download, Images, ImagePlus, RotateCcw, X } from "lucide-react"
import { parse as parseYaml } from "yaml"

import { Button, buttonVariants } from "@/components/ui/button"

type FormatName = "card" | "post" | "story"
type TemplateName = "statement" | "progression" | "quote" | "screenshot" | "file" | "photo"
type ThemeName = "ink" | "paper" | "blueprint"
type BackgroundMode = "plain" | "texture" | "image"
type TextureName = "studio" | "stage" | "sampler" | "guitar" | "piano-keys" | "piano-score"
type ScreenshotMode = "full" | "detail"

type EditorConfig = {
  slug: string
  template: TemplateName
  theme: ThemeName
  backgroundMode: BackgroundMode
  texture: TextureName
  formats: FormatName[]
  eyebrow: string
  headline: string
  footnote: string
  chords: string
  numerals: string
  attribution: string
  filename: string
  frontmatter: string
  fileLines: string
  screenshot: string
  screenshotMode: ScreenshotMode
  deviceFrame: boolean
  photo: string
  focusX: number
  focusY: number
  backgroundScale: number
  alt: string
  caption: string
  created: string
  scheduled: string
  draft: boolean
}

const formats = {
  card: { label: "Card", detail: "X · link preview", width: 1200, height: 630, scale: 1 },
  post: { label: "Post", detail: "Instagram · 4:5", width: 1080, height: 1350, scale: 1.16 },
  story: { label: "Story", detail: "Instagram · 9:16", width: 1080, height: 1920, scale: 1.34, safeTop: 190, safeBottom: 240 },
} as const

const themes = {
  ink: {
    label: "Ink",
    background: "#0A0A0A",
    text: "#FAFAFA",
    muted: "#A1A1AA",
    rule: "#3F3F46",
    tile: "#FAFAFA",
    glyph: "#0A0A0A",
  },
  paper: {
    label: "Paper",
    background: "#F3F0E8",
    text: "#171717",
    muted: "#67635B",
    rule: "#C8C1B4",
    tile: "#171717",
    glyph: "#F3F0E8",
  },
  blueprint: {
    label: "Blueprint",
    background: "#102131",
    text: "#F7F9FB",
    muted: "#A7B5C1",
    rule: "#395064",
    tile: "#F7F9FB",
    glyph: "#102131",
  },
} as const

const templates: { name: TemplateName; label: string; description: string }[] = [
  { name: "statement", label: "Statement", description: "A short, bold claim" },
  { name: "progression", label: "Progression", description: "Chords and numerals" },
  { name: "quote", label: "Quote", description: "An attributed pull quote" },
  { name: "screenshot", label: "Screenshot", description: "Product evidence" },
  { name: "file", label: "File", description: "A song as plain text" },
  { name: "photo", label: "Photo", description: "Editorial atmosphere" },
]

const photos = [
  { name: "guitarist-in-motion.png", label: "Guitarist", src: "/gallery/guitarist-in-motion.png" },
  { name: "phone-on-sheet-music.png", label: "Phone", src: "/gallery/phone-on-sheet-music.png" },
  { name: "piano-keys-in-motion.png", label: "Piano keys", src: "/gallery/piano-keys-in-motion.png" },
  { name: "piano-with-sheet-music.png", label: "Sheet music", src: "/gallery/piano-with-sheet-music.png" },
  { name: "studio-microphone-in-motion.png", label: "Studio mic", src: "/textures/studio-microphone.webp" },
  { name: "stage-microphone-in-motion.png", label: "Stage mic", src: "/textures/stage-microphone.webp" },
  { name: "sampler-and-keyboard-in-motion.png", label: "Keyboard", src: "/textures/sampler-and-keyboard.webp" },
  { name: "sampler-pads-in-motion.png", label: "Sampler", src: "/textures/sampler-pads.webp" },
] as const

const textureOptions: { name: TextureName; label: string; src: string }[] = [
  { name: "studio", label: "Studio haze", src: "/textures/studio-microphone.webp" },
  { name: "stage", label: "Stage bloom", src: "/textures/stage-microphone.webp" },
  { name: "sampler", label: "Sampler grain", src: "/textures/sampler-and-keyboard.webp" },
  { name: "guitar", label: "Guitar motion", src: "/gallery/guitarist-in-motion.png" },
  { name: "piano-keys", label: "Piano keys", src: "/gallery/piano-keys-in-motion.png" },
  { name: "piano-score", label: "Piano score", src: "/gallery/piano-with-sheet-music.png" },
]

const screenshots = [
  "01-Song-List.png",
  "02-Song-Detail.png",
  "03-Creation-Flow.png",
  "04-Search.png",
  "05-Tag-Filter.png",
  "06-Settings.png",
  "07-Song-Suggestions.png",
] as const

const initialConfig: EditorConfig = {
  slug: "files-in-your-pocket",
  template: "statement",
  theme: "ink",
  backgroundMode: "plain",
  texture: "studio",
  formats: ["card", "post"],
  eyebrow: "Feature",
  headline: "Your lyrics and chords,\nas files in your pocket.",
  footnote: "chordlist.app",
  chords: "C G Am F",
  numerals: "I · V · vi · IV",
  attribution: "Why plain-text songbooks last",
  filename: "Let It Be.md",
  frontmatter: "---\nchords: C G Am F\n---",
  fileLines: "[Verse]\nC        G        Am       F",
  screenshot: screenshots[1],
  screenshotMode: "detail",
  deviceFrame: false,
  photo: photos[0].name,
  focusX: 60,
  focusY: 50,
  backgroundScale: 100,
  alt: "A chordlist social card reading “Your lyrics and chords, as files in your pocket.”",
  caption: "Your songbook should feel like yours. chordlist keeps lyrics and chords in plain Markdown files you control.",
  created: new Date().toISOString().slice(0, 10),
  scheduled: "",
  draft: false,
}

const inputClass =
  "mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-ring/30"

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function fontFamily(variable: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
  return value || fallback
}

function lines(value: string) {
  return value.split("\n").map((line) => line.trimEnd()).filter(Boolean)
}

/**
 * Rows of a file excerpt. Unlike `lines`, leading spaces survive and interior
 * blank rows are kept — both are the alignment the file template exists to show.
 */
function fileRows(value: string) {
  const rows = value.split("\n").map((line) => line.trimEnd())
  while (rows.length > 0 && rows[rows.length - 1] === "") rows.pop()
  while (rows.length > 0 && rows[0] === "") rows.shift()
  return rows
}

function fitFont(
  context: CanvasRenderingContext2D,
  copy: string[],
  base: number,
  width: number,
  weight: number,
  family: string,
  floor = 0.58,
) {
  let size = base
  while (size > base * floor) {
    context.font = `${weight} ${Math.round(size)}px ${family}`
    if (copy.every((line) => context.measureText(line).width <= width)) return Math.round(size)
    size -= 2
  }
  return Math.round(size)
}

function drawTextLines(
  context: CanvasRenderingContext2D,
  copy: string[],
  x: number,
  y: number,
  size: number,
  lineHeight: number,
  color: string,
  weight: number,
  family: string,
) {
  context.fillStyle = color
  context.font = `${weight} ${size}px ${family}`
  context.textBaseline = "top"
  copy.forEach((line, index) => context.fillText(line, x, y + index * size * lineHeight))
}

function drawMark(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  tile: string,
  glyph: string,
) {
  context.fillStyle = tile
  context.beginPath()
  context.roundRect(x, y, size, size, size * 0.22)
  context.fill()

  const glyphHeight = size
  const glyphWidth = (270 / 613) * glyphHeight
  const left = x + (size - glyphWidth) / 2
  const unit = glyphHeight / 613
  context.fillStyle = glyph
  context.fillRect(left, y, 76 * unit, 375 * unit)
  context.fillRect(left + 35.5 * unit, y + 307 * unit, 5 * unit, 306 * unit)
  context.fillRect(left + 194 * unit, y, 76 * unit, 375 * unit)
  context.fillRect(left + 229.5 * unit, y + 307 * unit, 5 * unit, 306 * unit)
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  focusX: number,
  focusY: number,
  backgroundScale = 100,
) {
  const zoom = Math.min(200, Math.max(100, backgroundScale)) / 100
  const factor = Math.max(width / image.naturalWidth, height / image.naturalHeight) * zoom
  const drawWidth = image.naturalWidth * factor
  const drawHeight = image.naturalHeight * factor
  const x = (width - drawWidth) * (focusX / 100)
  const y = (height - drawHeight) * (focusY / 100)
  context.drawImage(image, x, y, drawWidth, drawHeight)
}

function drawImageDetail(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const factor = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const sourceWidth = width / factor
  const sourceHeight = height / factor
  const sourceX = (image.naturalWidth - sourceWidth) / 2

  context.save()
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
  context.clip()
  context.drawImage(image, sourceX, 0, sourceWidth, sourceHeight, x, y, width, height)
  context.restore()
}

function drawImageContained(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const factor = Math.min(width / image.naturalWidth, height / image.naturalHeight)
  const drawWidth = image.naturalWidth * factor
  const drawHeight = image.naturalHeight * factor
  context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight)
}

function drawScreenshot(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number,
  detail: boolean,
  deviceFrame: boolean,
) {
  if (!deviceFrame) {
    if (detail) {
      drawImageDetail(context, image, x, y, width, height, 22 * scale)
    } else {
      drawImageContained(context, image, x, y, width, height)
    }
    return
  }

  const padding = Math.max(7 * scale, Math.min(width, height) * 0.022)
  const radius = Math.min(width * 0.13, 52 * scale)
  const screenX = x + padding
  const screenY = y + padding
  const screenWidth = width - padding * 2
  const screenHeight = height - padding * 2

  context.fillStyle = "#050505"
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
  context.fill()
  context.strokeStyle = "#3F3F46"
  context.lineWidth = Math.max(2, 2 * scale)
  context.stroke()

  if (detail) {
    drawImageDetail(context, image, screenX, screenY, screenWidth, screenHeight, Math.max(8, radius - padding))
  } else {
    drawImageContained(context, image, screenX, screenY, screenWidth, screenHeight)
  }

  const islandWidth = Math.min(screenWidth * 0.24, 112 * scale)
  const islandHeight = Math.max(8 * scale, padding * 0.72)
  context.fillStyle = "#050505"
  context.beginPath()
  context.roundRect(
    x + (width - islandWidth) / 2,
    screenY + padding * 0.45,
    islandWidth,
    islandHeight,
    islandHeight / 2,
  )
  context.fill()
}

async function renderPost(
  canvas: HTMLCanvasElement,
  config: EditorConfig,
  formatName: FormatName,
  photoSrc: string,
  textureSrc: string,
) {
  const format = formats[formatName]
  canvas.width = format.width
  canvas.height = format.height

  await document.fonts.ready
  const sans = fontFamily("--font-geist-sans", "Arial, sans-serif")
  const mono = fontFamily("--font-geist-mono", "monospace")
  const context = canvas.getContext("2d")
  if (!context) return

  const theme = themes[config.theme]
  const scale = format.scale
  const padding = Math.round(80 * scale)
  const safeTop = "safeTop" in format ? format.safeTop : 0
  const safeBottom = "safeBottom" in format ? format.safeBottom : 0
  const top = padding + safeTop
  const bottom = format.height - padding - safeBottom
  const innerWidth = format.width - padding * 2

  context.fillStyle = theme.background
  context.fillRect(0, 0, format.width, format.height)

  const usesFullImage = config.template === "photo" || config.backgroundMode === "image"
  if (usesFullImage && photoSrc) {
    const image = await loadImage(photoSrc)
    drawCover(
      context,
      image,
      format.width,
      format.height,
      config.focusX,
      config.focusY,
      config.backgroundScale,
    )
    const gradient = context.createLinearGradient(0, 0, 0, format.height)
    gradient.addColorStop(0, "rgba(10,10,10,.88)")
    gradient.addColorStop(0.38, "rgba(10,10,10,.55)")
    gradient.addColorStop(0.62, "rgba(10,10,10,.62)")
    gradient.addColorStop(1, "rgba(10,10,10,.92)")
    context.fillStyle = gradient
    context.fillRect(0, 0, format.width, format.height)
  } else if (config.backgroundMode === "texture" && textureSrc) {
    const image = await loadImage(textureSrc)
    context.save()
    context.globalAlpha = 0.14
    drawCover(context, image, format.width, format.height, 50, 50)
    context.restore()

    const wash = context.createLinearGradient(0, 0, format.width, format.height)
    wash.addColorStop(0, "rgba(10,10,10,0)")
    wash.addColorStop(0.72, theme.background)
    context.fillStyle = wash
    context.fillRect(0, 0, format.width, format.height)
  }

  const activeTheme = usesFullImage ? themes.ink : theme
  const markSize = Math.round(56 * scale)
  drawMark(context, padding, top, markSize, activeTheme.tile, activeTheme.glyph)
  context.fillStyle = activeTheme.text
  context.font = `700 ${Math.round(34 * scale)}px ${sans}`
  context.textBaseline = "middle"
  context.fillText("chordlist", padding + markSize + Math.round(18 * scale), top + markSize / 2)
  if (config.eyebrow.trim()) {
    const wordmarkWidth = context.measureText("chordlist").width
    context.fillStyle = activeTheme.muted
    context.font = `400 ${Math.round(24 * scale)}px ${mono}`
    // Lowercased to match the wordmark, the same way the build does it, so the
    // preview and the rendered PNG agree.
    context.fillText(
      config.eyebrow.trim().toLowerCase(),
      padding + markSize + Math.round(36 * scale) + wordmarkWidth,
      top + markSize / 2,
    )
  }

  context.fillStyle = activeTheme.muted
  context.font = `400 ${Math.round(24 * scale)}px ${mono}`
  context.textBaseline = "bottom"
  context.fillText(config.footnote, padding, bottom)

  const bodyTop = top + markSize + Math.round(42 * scale)
  const bodyBottom = bottom - Math.round(24 * scale * 2.6)
  const bodyHeight = bodyBottom - bodyTop
  const headline = lines(config.headline)

  if (config.template === "statement" || config.template === "photo") {
    const size = fitFont(context, headline, 78 * scale, innerWidth, 700, sans)
    const lineHeight = 1.14
    const height = headline.length * size * lineHeight
    drawTextLines(
      context,
      headline,
      padding,
      bodyTop + (bodyHeight - height) / 2,
      size,
      lineHeight,
      activeTheme.text,
      700,
      sans,
    )
  }

  if (config.template === "quote") {
    const size = fitFont(context, headline, 52 * scale, innerWidth, 400, sans)
    const lineHeight = 1.32
    const attributionHeight = config.attribution ? Math.round(70 * scale) : 0
    const groupHeight = size * 1.1 + headline.length * size * lineHeight + attributionHeight
    const y = bodyTop + (bodyHeight - groupHeight) / 2
    context.fillStyle = activeTheme.rule
    context.font = `700 ${Math.round(size * 1.7)}px ${sans}`
    context.textBaseline = "top"
    context.fillText("“", padding, y)
    drawTextLines(context, headline, padding, y + size * 1.05, size, lineHeight, activeTheme.text, 400, sans)
    if (config.attribution) {
      context.fillStyle = activeTheme.muted
      context.font = `400 ${Math.round(24 * scale)}px ${mono}`
      context.fillText(config.attribution, padding, y + size * 1.05 + headline.length * size * lineHeight + 20 * scale)
    }
  }

  if (config.template === "progression") {
    const chordList = config.chords.split(/\s+/).filter(Boolean)
    const gap = 44 * scale
    let chordSize = 104 * scale
    context.font = `400 ${chordSize}px ${mono}`
    const measured = () => chordList.reduce((sum, chord) => sum + context.measureText(chord).width, 0) + gap * (chordList.length - 1)
    while (chordSize > 56 * scale && measured() > innerWidth) {
      chordSize -= 2
      context.font = `400 ${chordSize}px ${mono}`
    }
    const headlineSize = headline.length ? fitFont(context, headline, 52 * scale, innerWidth, 700, sans) : 0
    const groupHeight = chordSize + (config.numerals ? 76 * scale : 0) + (headline.length ? headline.length * headlineSize * 1.2 + 72 * scale : 0)
    let y = bodyTop + (bodyHeight - groupHeight) / 2
    let x = padding
    context.fillStyle = activeTheme.text
    context.font = `400 ${Math.round(chordSize)}px ${mono}`
    context.textBaseline = "top"
    chordList.forEach((chord) => {
      context.fillText(chord, x, y)
      x += context.measureText(chord).width + gap
    })
    y += chordSize + 40 * scale
    if (config.numerals) {
      context.fillStyle = activeTheme.muted
      context.font = `400 ${Math.round(28.8 * scale)}px ${mono}`
      context.fillText(config.numerals, padding, y)
      y += 72 * scale
    }
    if (headline.length) {
      drawTextLines(context, headline, padding, y, headlineSize, 1.2, activeTheme.text, 700, sans)
    }
  }

  if (config.template === "file") {
    const meta = fileRows(config.frontmatter)
    const body = fileRows(config.fileLines)
    const separator = meta.length > 0 && body.length > 0
    const rowCount = meta.length + body.length + (separator ? 1 : 0)
    const filename = config.filename.trim()

    const headlineSize = headline.length ? fitFont(context, headline, 52 * scale, innerWidth, 700, sans) : 0
    const headlineGap = 56 * scale
    const headlineHeight = headline.length ? headline.length * headlineSize * 1.2 + headlineGap : 0

    const filenameSize = Math.round(24 * scale)
    const ruleGap = 20 * scale
    const chromeHeight = filename ? filenameSize * 1.4 + ruleGap * 2 : 0

    // Mirrors the file template in scripts/lib/social-templates.mjs: fitted by
    // width and by height, because an excerpt is a block rather than a phrase.
    const widthCap = fitFont(context, [...meta, ...body], 38 * scale, innerWidth, 400, mono, 0.5)
    const heightCap = (bodyHeight - headlineHeight - chromeHeight) / Math.max(1, rowCount * 1.5)
    const size = Math.round(Math.max(38 * scale * 0.5, Math.min(widthCap, heightCap)))
    const row = Math.round(size * 1.5)

    const groupHeight = chromeHeight + rowCount * row + headlineHeight
    let y = bodyTop + (bodyHeight - groupHeight) / 2

    if (filename) {
      context.fillStyle = activeTheme.muted
      context.font = `400 ${filenameSize}px ${mono}`
      context.textBaseline = "top"
      context.fillText(filename, padding, y)
      y += filenameSize * 1.4 + ruleGap
      context.fillStyle = activeTheme.rule
      context.fillRect(padding, y, innerWidth, Math.max(1, Math.round(scale)))
      y += ruleGap
    }

    context.textBaseline = "top"
    context.font = `400 ${size}px ${mono}`
    meta.forEach((line, index) => {
      context.fillStyle = activeTheme.muted
      context.fillText(line, padding, y + index * row)
    })
    y += meta.length * row + (separator ? row : 0)
    body.forEach((line, index) => {
      context.fillStyle = activeTheme.text
      context.fillText(line, padding, y + index * row)
    })
    y += body.length * row

    if (headline.length) {
      drawTextLines(context, headline, padding, y + headlineGap, headlineSize, 1.2, activeTheme.text, 700, sans)
    }
  }

  if (config.template === "screenshot") {
    const image = await loadImage(`/app-screenshots/dark/${config.screenshot}`)
    const detail = config.screenshotMode === "detail"
    const screenshotRatio = image.naturalWidth / image.naturalHeight
    const detailRatio = activeFormatRatio(formatName, { card: 0.76, post: 0.62, story: 0.58 })
    const visibleRatio = activeFormatRatio(formatName, { card: 1, post: 0.73, story: 0.68 })
    const copyRatio = activeFormatRatio(formatName, { card: 0.58, post: 0.48, story: 0.45 })
    const shotY = top + markSize * 0.7
    const shotHeight = format.height - shotY - activeFormatRatio(formatName, { card: 18, post: 24, story: 28 }) * scale
    const shotWidth = shotHeight * (detail ? detailRatio : screenshotRatio)
    const cardFrameInset = formatName === "card" && config.deviceFrame ? Math.max(2, 2 * scale) * 50  : 0
    const shotX = format.width - shotWidth * visibleRatio - cardFrameInset
    const copyWidth = innerWidth * copyRatio
    const copySize = fitFont(context, headline, 52 * scale, copyWidth, 700, sans)
    const copyHeight = headline.length * copySize * 1.18
    const copyY = bodyTop + (bodyHeight - copyHeight) / 2

    drawScreenshot(
      context,
      image,
      shotX,
      shotY,
      shotWidth,
      shotHeight,
      scale,
      detail,
      config.deviceFrame,
    )
    drawTextLines(context, headline, padding, copyY, copySize, 1.18, activeTheme.text, 700, sans)
  }
}

function activeFormatRatio<Value>(format: FormatName, values: Record<FormatName, Value>) {
  return values[format]
}

function importedSource(source: string) {
  return source.trim().replace(/^```(?:yaml|yml|markdown|md)?\s*/i, "").replace(/\s*```$/, "")
}

function looksLikeConfig(source: string) {
  const cleaned = importedSource(source)
  return cleaned.startsWith("---") && /\n\s*template:\s*/.test(cleaned)
}

function importedString(value: unknown, fallback = "") {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return typeof value === "string" || typeof value === "number" ? String(value) : fallback
}

function importedLines(value: unknown) {
  if (Array.isArray(value)) return value.map((line) => String(line)).join("\n")
  return importedString(value)
}

function importedFocus(value: unknown) {
  const parts = importedString(value, "50% 50%").trim().split(/\s+/)
  const coordinate = (part: string | undefined, fallback: number) => {
    const parsed = Number.parseFloat(part ?? "")
    return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : fallback
  }
  return { x: coordinate(parts[0], 50), y: coordinate(parts[1], 50) }
}

function importedBackgroundScale(value: unknown) {
  const parsed = Number.parseFloat(importedString(value, "100"))
  if (!Number.isFinite(parsed)) return 100
  const percent = parsed <= 2 ? parsed * 100 : parsed
  return Math.round(Math.min(200, Math.max(100, percent)))
}

function importedSlug(headline: string) {
  const slug = headline
    .replace(/\n/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return slug || "imported-social-post"
}

function parseImportedConfig(source: string): EditorConfig {
  const cleaned = importedSource(source)
  const split = cleaned.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!split) throw new Error("Paste a complete config with opening and closing --- lines.")

  const parsed = parseYaml(split[1] ?? "")
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("The YAML frontmatter could not be read.")
  }
  const data = parsed as Record<string, unknown>

  const template = importedString(data.template) as TemplateName
  if (!templates.some((item) => item.name === template)) {
    throw new Error(`Unknown template “${template || "missing"}”.`)
  }

  const importedFormats = Array.isArray(data.formats)
    ? data.formats.filter(
        (format): format is FormatName =>
          typeof format === "string" && ["card", "post", "story"].includes(format),
      )
    : []
  const themeName = importedString(data.theme, "ink")
  const theme: ThemeName = Object.hasOwn(themes, themeName) ? (themeName as ThemeName) : "ink"
  const textureName = importedString(data.texture, "studio")
  const texture: TextureName = textureOptions.some((item) => item.name === textureName)
    ? (textureName as TextureName)
    : "studio"
  const backgroundImage = importedString(data.backgroundImage)
  const templatePhoto = importedString(data.photo)
  const photo = template === "photo"
    ? templatePhoto || initialConfig.photo
    : backgroundImage || initialConfig.photo
  const backgroundMode: BackgroundMode = template === "photo" || backgroundImage
    ? "image"
    : data.texture !== undefined
      ? "texture"
      : "plain"
  const focus = importedFocus(data.focus)
  const headline = importedLines(data.headline)
  const screenshotMode = importedString(data.screenshotMode, "full")

  return {
    ...initialConfig,
    slug: importedSlug(headline),
    template,
    theme,
    backgroundMode,
    texture,
    formats: importedFormats.length ? importedFormats : ["card", "post"],
    eyebrow: importedString(data.eyebrow),
    headline,
    footnote: importedString(data.footnote),
    chords: Array.isArray(data.chords) ? data.chords.map(String).join(" ") : importedString(data.chords),
    numerals: importedString(data.numerals),
    attribution: importedString(data.attribution),
    filename: importedString(data.filename),
    frontmatter: importedLines(data.frontmatter),
    fileLines: importedLines(data.lines),
    screenshot: importedString(data.screenshot, initialConfig.screenshot),
    screenshotMode: screenshotMode === "detail" ? "detail" : "full",
    deviceFrame: data.deviceFrame === true,
    photo,
    focusX: focus.x,
    focusY: focus.y,
    backgroundScale: importedBackgroundScale(data.backgroundScale),
    alt: importedString(data.alt),
    caption: (split[2] ?? "").trim(),
    created: importedString(data.created, new Date().toISOString().slice(0, 10)),
    scheduled: importedString(data.scheduled),
    draft: data.draft === true,
  }
}

function yamlString(value: string) {
  return JSON.stringify(value)
}

function configMarkdown(config: EditorConfig) {
  const output = ["---", `template: ${config.template}`]
  const usesFullImage = config.template === "photo" || config.backgroundMode === "image"
  if (!usesFullImage && config.backgroundMode !== "texture" && config.theme !== "ink") {
    output.push(`theme: ${config.theme}`)
  }
  if (config.template !== "photo" && config.backgroundMode === "texture") {
    output.push(`texture: ${config.texture}`)
  }
  if (config.template !== "photo" && config.backgroundMode === "image") {
    output.push(`backgroundImage: ${yamlString(config.photo)}`)
    output.push(`focus: ${config.focusX}% ${config.focusY}%`)
    if (config.backgroundScale !== 100) output.push(`backgroundScale: ${config.backgroundScale}%`)
  }
  if (config.eyebrow.trim()) output.push(`eyebrow: ${yamlString(config.eyebrow.trim())}`)
  output.push("formats:", ...config.formats.map((format) => `  - ${format}`))

  if (config.template === "screenshot") {
    output.push(`screenshot: ${yamlString(config.screenshot)}`)
    output.push(`screenshotMode: ${config.screenshotMode}`)
    if (config.deviceFrame) output.push("deviceFrame: true")
  }
  if (config.template === "photo") {
    output.push(`photo: ${yamlString(config.photo)}`)
    output.push(`focus: ${config.focusX}% ${config.focusY}%`)
    if (config.backgroundScale !== 100) output.push(`backgroundScale: ${config.backgroundScale}%`)
  }
  if (config.template === "progression") {
    output.push("chords:", ...config.chords.split(/\s+/).filter(Boolean).map((chord) => `  - ${yamlString(chord)}`))
    if (config.numerals.trim()) output.push(`numerals: ${yamlString(config.numerals.trim())}`)
  }
  if (config.template === "file") {
    if (config.filename.trim()) output.push(`filename: ${yamlString(config.filename.trim())}`)
    const meta = fileRows(config.frontmatter)
    if (meta.length) output.push("frontmatter:", ...meta.map((line) => `  - ${yamlString(line)}`))
    const body = fileRows(config.fileLines)
    if (body.length) output.push("lines:", ...body.map((line) => `  - ${yamlString(line)}`))
  }
  const headline = lines(config.headline)
  if (headline.length) output.push("headline:", ...headline.map((line) => `  - ${yamlString(line)}`))
  if (config.template === "quote" && config.attribution.trim()) {
    output.push(`attribution: ${yamlString(config.attribution.trim())}`)
  }
  if (config.footnote.trim()) output.push(`footnote: ${yamlString(config.footnote.trim())}`)
  output.push(`alt: ${yamlString(config.alt.trim())}`)
  output.push(`created: ${config.created}`)
  if (config.scheduled) output.push(`scheduled: ${config.scheduled}`)
  if (config.draft) output.push("draft: true")
  output.push("---", "", config.caption.trim(), "")
  return output.join("\n")
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border py-6 first:border-t-0 first:pt-0">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      <span className="flex items-baseline justify-between gap-4">
        {label}
        {hint ? <span className="font-normal text-muted-foreground">{hint}</span> : null}
      </span>
      {children}
    </label>
  )
}

export function SocialPostEditor() {
  const [config, setConfig] = useState(initialConfig)
  const [activeFormat, setActiveFormat] = useState<FormatName>("post")
  const [customPhoto, setCustomPhoto] = useState<{ name: string; src: string } | null>(null)
  const [status, setStatus] = useState<"idle" | "copied" | "exported" | "imported">("idle")
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState("")
  const [importError, setImportError] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const photoSrc = useMemo(() => {
    if (customPhoto?.name === config.photo) return customPhoto.src
    return photos.find((photo) => photo.name === config.photo)?.src ?? photos[0].src
  }, [config.photo, customPhoto])

  const textureSrc =
    textureOptions.find((texture) => texture.name === config.texture)?.src ?? "/textures/studio-microphone.webp"

  useEffect(() => {
    if (!canvasRef.current) return
    let current = true
    renderPost(canvasRef.current, config, activeFormat, photoSrc, textureSrc).catch(() => {
      if (current) setStatus("idle")
    })
    return () => {
      current = false
    }
  }, [activeFormat, config, photoSrc, textureSrc])

  useEffect(() => {
    if (status === "idle") return
    const timeout = window.setTimeout(() => setStatus("idle"), 1800)
    return () => window.clearTimeout(timeout)
  }, [status])

  useEffect(() => () => {
    if (customPhoto) URL.revokeObjectURL(customPhoto.src)
  }, [customPhoto])

  const applyImport = useCallback((source: string) => {
    try {
      const imported = parseImportedConfig(source)
      setConfig(imported)
      setActiveFormat(imported.formats[0] ?? "post")
      setCustomPhoto(null)
      setImportError("")
      setImportOpen(false)
      setStatus("imported")
      return true
    } catch (error) {
      setImportText(source)
      setImportError(error instanceof Error ? error.message : "The config could not be imported.")
      setImportOpen(true)
      return false
    }
  }, [])

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.matches("input, textarea, select") || target.isContentEditable)
      ) {
        return
      }

      const source = event.clipboardData?.getData("text/plain") ?? ""
      if (!looksLikeConfig(source)) return
      event.preventDefault()
      applyImport(source)
    }

    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [applyImport])

  useEffect(() => {
    if (!importOpen) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setImportOpen(false)
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [importOpen])

  const update = <Key extends keyof EditorConfig>(key: Key, value: EditorConfig[Key]) => {
    setConfig((current) => ({ ...current, [key]: value }))
  }

  const toggleFormat = (name: FormatName) => {
    setConfig((current) => {
      const exists = current.formats.includes(name)
      if (exists && current.formats.length === 1) return current
      return {
        ...current,
        formats: exists ? current.formats.filter((format) => format !== name) : [...current.formats, name],
      }
    })
  }

  const copyConfig = async () => {
    await navigator.clipboard.writeText(configMarkdown(config))
    setStatus("copied")
  }

  const exportImage = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    await renderPost(canvas, config, activeFormat, photoSrc, textureSrc)
    canvas.toBlob((blob) => {
      if (!blob) return
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `${config.slug || "chordlist-social"}-${activeFormat}.png`
      link.click()
      URL.revokeObjectURL(link.href)
      setStatus("exported")
    }, "image/png")
  }

  const selectedFormat = formats[activeFormat]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <p className="font-mono text-xs text-muted-foreground">chordlist / studio</p>
            <h1 className="text-base font-semibold tracking-tight">Social post editor</h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link href="/social/posts" className={buttonVariants({ variant: "outline", size: "lg" })}>
              <Images /> Posts
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setImportText("")
                setImportError("")
                setImportOpen(true)
              }}
            >
              {status === "imported" ? <Check /> : <ClipboardPaste />}
              {status === "imported" ? "Imported" : "Import config"}
            </Button>
            <Button variant="outline" size="lg" onClick={() => setConfig(initialConfig)}>
              <RotateCcw /> Reset
            </Button>
            <Button variant="outline" size="lg" onClick={copyConfig}>
              {status === "copied" ? <Check /> : <Copy />}
              {status === "copied" ? "Copied" : "Copy config"}
            </Button>
            <Button size="lg" onClick={exportImage}>
              {status === "exported" ? <Check /> : <Download />}
              {status === "exported" ? "Exported" : "Export PNG"}
            </Button>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto grid max-w-[1500px] lg:grid-cols-[390px_minmax(0,1fr)]"
      >
        <aside className="border-b border-border px-5 py-6 lg:border-r lg:border-b-0 lg:px-6">
          <Section title="Layout">
            <div className="grid grid-cols-2 gap-2">
              {templates.map((template) => (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => {
                    setConfig((current) => ({
                      ...current,
                      template: template.name,
                      backgroundMode: template.name === "photo" ? "image" : current.backgroundMode,
                    }))
                  }}
                  className={`rounded-xl border p-3 text-left transition ${
                    config.template === template.name
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card hover:border-foreground/30"
                  }`}
                >
                  <span className="block text-sm font-medium">{template.label}</span>
                  <span className={`mt-1 block text-xs ${config.template === template.name ? "text-background/65" : "text-muted-foreground"}`}>
                    {template.description}
                  </span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Copy">
            <Field label="Eyebrow" hint="Optional">
              <input className={inputClass} value={config.eyebrow} onChange={(event) => update("eyebrow", event.target.value)} />
            </Field>

            {config.template === "progression" ? (
              <>
                <Field label="Chords" hint="Space separated">
                  <input className={`${inputClass} font-mono`} value={config.chords} onChange={(event) => update("chords", event.target.value)} />
                </Field>
                <Field label="Roman numerals" hint="Optional">
                  <input className={`${inputClass} font-mono`} value={config.numerals} onChange={(event) => update("numerals", event.target.value)} />
                </Field>
              </>
            ) : null}

            {config.template === "file" ? (
              <>
                <Field label="Filename" hint="Optional">
                  <input
                    className={`${inputClass} font-mono`}
                    value={config.filename}
                    onChange={(event) => update("filename", event.target.value)}
                  />
                </Field>
                <Field label="Frontmatter" hint="Optional, set muted">
                  <textarea
                    className={`${inputClass} min-h-24 resize-y font-mono leading-relaxed`}
                    value={config.frontmatter}
                    onChange={(event) => update("frontmatter", event.target.value)}
                  />
                </Field>
                <Field label="Lines" hint="Spacing is preserved · ASCII only">
                  <textarea
                    className={`${inputClass} min-h-28 resize-y font-mono leading-relaxed`}
                    value={config.fileLines}
                    onChange={(event) => update("fileLines", event.target.value)}
                  />
                </Field>
              </>
            ) : null}

            <Field label="Headline" hint={config.template === "file" ? "Optional" : "One rendered line per row"}>
              <textarea
                className={`${inputClass} min-h-28 resize-y leading-relaxed`}
                value={config.headline}
                onChange={(event) => update("headline", event.target.value)}
              />
            </Field>

            {config.template === "quote" ? (
              <Field label="Attribution" hint="Optional">
                <input className={inputClass} value={config.attribution} onChange={(event) => update("attribution", event.target.value)} />
              </Field>
            ) : null}

            <Field label="Footnote" hint="Optional">
              <input className={`${inputClass} font-mono`} value={config.footnote} onChange={(event) => update("footnote", event.target.value)} />
            </Field>
          </Section>

          <Section title="Background">
            {config.template !== "photo" ? (
              <div className="grid grid-cols-3 rounded-xl bg-muted p-1">
                {(["plain", "texture", "image"] as BackgroundMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setConfig((current) => ({
                        ...current,
                        backgroundMode: mode,
                        theme: mode === "texture" ? "ink" : current.theme,
                      }))
                    }}
                    className={`rounded-lg px-3 py-2 text-xs font-medium capitalize transition ${
                      config.backgroundMode === mode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs leading-relaxed text-muted-foreground">
                The photo layout always uses a full-bleed image. Choose the crop below.
              </p>
            )}

            {config.template !== "photo" && config.backgroundMode === "plain" ? (
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(themes) as ThemeName[]).map((name) => {
                  const theme = themes[name]
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => update("theme", name)}
                      aria-pressed={config.theme === name}
                      className={`rounded-xl border p-2 text-left text-xs transition ${config.theme === name ? "border-foreground" : "border-border"}`}
                    >
                      <span className="mb-2 block aspect-[1.8] rounded-md border border-black/10" style={{ background: theme.background }} />
                      {theme.label}
                    </button>
                  )
                })}
              </div>
            ) : null}

            {config.template !== "photo" && config.backgroundMode === "texture" ? (
              <div className="grid grid-cols-3 gap-2">
                {textureOptions.map((texture) => (
                  <button
                    key={texture.name}
                    type="button"
                    onClick={() => update("texture", texture.name)}
                    aria-pressed={config.texture === texture.name}
                    className={`rounded-xl border p-2 text-left text-xs transition ${config.texture === texture.name ? "border-foreground" : "border-border"}`}
                  >
                    <span
                      className="mb-2 block aspect-[1.8] rounded-md border border-white/10 bg-[#0a0a0a] bg-cover bg-center bg-blend-screen"
                      style={{ backgroundImage: `linear-gradient(rgba(10,10,10,.78), rgba(10,10,10,.92)), url(${texture.src})` }}
                    />
                    {texture.label}
                  </button>
                ))}
              </div>
            ) : null}

            {config.template === "photo" || config.backgroundMode === "image" ? (
              <>
              <div className="grid grid-cols-4 gap-2">
                {photos.map((photo) => (
                  <button
                    key={photo.name}
                    type="button"
                    onClick={() => update("photo", photo.name)}
                    aria-label={photo.label}
                    aria-pressed={config.photo === photo.name}
                    className={`aspect-square rounded-lg border bg-cover bg-center transition ${config.photo === photo.name ? "border-foreground ring-2 ring-ring/30" : "border-border"}`}
                    style={{ backgroundImage: `url(${photo.src})` }}
                  />
                ))}
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border text-center text-[10px] text-muted-foreground transition hover:border-foreground/40 hover:text-foreground">
                  <ImagePlus className="mb-1 size-4" />
                  Add PNG
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/png"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (!file) return
                      if (customPhoto) URL.revokeObjectURL(customPhoto.src)
                      const next = { name: file.name, src: URL.createObjectURL(file) }
                      setCustomPhoto(next)
                      update("photo", next.name)
                    }}
                  />
                </label>
              </div>
              {customPhoto && config.photo === customPhoto.name ? (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Add <span className="font-mono text-foreground">{customPhoto.name}</span> to the repository’s photography folder with the copied config.
                </p>
              ) : null}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Horizontal focus" hint={`${config.focusX}%`}>
                  <input className="mt-3 w-full accent-foreground" type="range" min="0" max="100" value={config.focusX} onChange={(event) => update("focusX", Number(event.target.value))} />
                </Field>
                <Field label="Vertical focus" hint={`${config.focusY}%`}>
                  <input className="mt-3 w-full accent-foreground" type="range" min="0" max="100" value={config.focusY} onChange={(event) => update("focusY", Number(event.target.value))} />
                </Field>
              </div>
              <Field label="Image scale" hint={`${config.backgroundScale}%`}>
                <input
                  className="mt-3 w-full accent-foreground"
                  type="range"
                  min="100"
                  max="200"
                  step="1"
                  value={config.backgroundScale}
                  onChange={(event) => update("backgroundScale", Number(event.target.value))}
                />
              </Field>
              </>
            ) : null}
          </Section>

          {config.template === "screenshot" ? (
            <Section title="App screenshot">
              <div className="grid grid-cols-2 rounded-xl bg-muted p-1">
                {([
                  { name: "detail", label: "Detail crop" },
                  { name: "full", label: "Full screen" },
                ] as { name: ScreenshotMode; label: string }[]).map((mode) => (
                  <button
                    key={mode.name}
                    type="button"
                    onClick={() => update("screenshotMode", mode.name)}
                    aria-pressed={config.screenshotMode === mode.name}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                      config.screenshotMode === mode.name
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => update("deviceFrame", !config.deviceFrame)}
                aria-pressed={config.deviceFrame}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                  config.deviceFrame
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card hover:border-foreground/30"
                }`}
              >
                <span>
                  <span className="block font-medium">Device frame</span>
                  <span className={`mt-0.5 block text-xs ${config.deviceFrame ? "text-background/65" : "text-muted-foreground"}`}>
                    Add a dark hardware shell and camera island
                  </span>
                </span>
                <span className={`flex size-6 items-center justify-center rounded-md border ${config.deviceFrame ? "border-background/25" : "border-border"}`}>
                  {config.deviceFrame ? <Check className="size-3.5" /> : null}
                </span>
              </button>
              <div className="grid grid-cols-5 gap-2">
                {screenshots.map((screenshot, index) => (
                  <button
                    key={screenshot}
                    type="button"
                    onClick={() => update("screenshot", screenshot)}
                    aria-label={`App screenshot ${index + 1}`}
                    aria-pressed={config.screenshot === screenshot}
                    className={`overflow-hidden rounded-lg border bg-[#0a0a0a] p-1 transition ${config.screenshot === screenshot ? "border-foreground ring-2 ring-ring/30" : "border-border"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/app-screenshots/dark/${screenshot}`} alt="" className="aspect-[9/19] w-full object-contain" />
                  </button>
                ))}
              </div>
            </Section>
          ) : null}

          <Section title="Output">
            <div className="space-y-2">
              {(Object.keys(formats) as FormatName[]).map((name) => {
                const format = formats[name]
                const enabled = config.formats.includes(name)
                return (
                  <div key={name} className="flex items-center gap-2 rounded-xl border border-border p-2">
                    <button
                      type="button"
                      onClick={() => setActiveFormat(name)}
                      className={`min-w-0 flex-1 rounded-lg px-2 py-1.5 text-left transition ${activeFormat === name ? "bg-muted" : "hover:bg-muted/60"}`}
                    >
                      <span className="block text-sm font-medium">{format.label}</span>
                      <span className="block text-xs text-muted-foreground">{format.detail} · {format.width}×{format.height}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFormat(name)}
                      aria-label={`${enabled ? "Remove" : "Add"} ${format.label} from copied configuration`}
                      aria-pressed={enabled}
                      className={`flex size-8 items-center justify-center rounded-lg border transition ${enabled ? "border-foreground bg-foreground text-background" : "border-border text-transparent hover:text-muted-foreground"}`}
                    >
                      <Check className="size-4" />
                    </button>
                  </div>
                )
              })}
            </div>
            <Field label="File slug" hint="Used for download">
              <input
                className={`${inputClass} font-mono`}
                value={config.slug}
                onChange={(event) => update("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))}
              />
            </Field>
            <Field label="Alt text" hint="Required by the build">
              <textarea className={`${inputClass} min-h-24 resize-y`} value={config.alt} onChange={(event) => update("alt", event.target.value)} />
            </Field>
            <Field label="Caption" hint="Saved below frontmatter">
              <textarea className={`${inputClass} min-h-28 resize-y`} value={config.caption} onChange={(event) => update("caption", event.target.value)} />
            </Field>
          </Section>
        </aside>

        <section className="relative min-h-[70vh] bg-muted/35 p-4 sm:p-8 lg:p-12">
          <div className="sticky top-28 mx-auto flex max-w-4xl flex-col items-center">
            <div className="mb-4 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="block font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Live preview</span>
                <span className="mt-1 block text-xs text-muted-foreground">{selectedFormat.width} × {selectedFormat.height} px</span>
              </div>
              <div className="grid grid-cols-3 rounded-xl border border-border bg-background/80 p-1 shadow-sm" role="group" aria-label="Preview format">
                {(Object.keys(formats) as FormatName[]).map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setActiveFormat(name)}
                    aria-pressed={activeFormat === name}
                    className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
                      activeFormat === name
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {formats[name].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative flex max-h-[calc(100vh-12rem)] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-background/70 p-3 shadow-sm sm:p-6">
              <canvas
                ref={canvasRef}
                aria-label={`Preview of the ${selectedFormat.label.toLowerCase()} social image`}
                className="block max-h-[calc(100vh-16rem)] max-w-full bg-black shadow-2xl"
                style={{ aspectRatio: `${selectedFormat.width} / ${selectedFormat.height}` }}
              />
            </div>
            <p className="mt-4 max-w-xl text-center text-xs leading-relaxed text-muted-foreground">
              The preview renders at full export resolution. Line breaks, crops, and selected formats are carried into the copied repository config.
            </p>
          </div>
        </section>
      </main>

      {importOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setImportOpen(false)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-config-title"
            aria-describedby="import-config-description"
            className="w-full max-w-2xl rounded-2xl border border-border bg-background p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="import-config-title" className="text-lg font-semibold tracking-tight">Import config</h2>
                <p id="import-config-description" className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Paste the complete Markdown definition, including both frontmatter markers and the caption.
                </p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Close import dialog" onClick={() => setImportOpen(false)}>
                <X />
              </Button>
            </div>

            <textarea
              autoFocus
              value={importText}
              onChange={(event) => {
                setImportText(event.target.value)
                if (importError) setImportError("")
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) applyImport(importText)
              }}
              spellCheck={false}
              placeholder={'---\ntemplate: statement\nformats:\n  - card\nheadline:\n  - "Your headline"\nalt: "Description"\n---\n\nYour caption.'}
              className="mt-5 min-h-80 w-full resize-y rounded-xl border border-border bg-muted/45 p-4 font-mono text-xs leading-relaxed text-foreground outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-ring/30"
            />

            {importError ? (
              <p role="alert" className="mt-3 text-sm text-destructive">{importError}</p>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                You can also paste a config anywhere on this page while no text field is focused.
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="lg" onClick={() => setImportOpen(false)}>Cancel</Button>
              <Button size="lg" disabled={!importText.trim()} onClick={() => applyImport(importText)}>
                <ClipboardPaste /> Import config
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
