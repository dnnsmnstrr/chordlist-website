import designMark from "@/design/mark.json"

/**
 * The pictures the banner builder and the social editor draw from, in one place so the two tools
 * offer the same photographs and screens under the same names, and a definition written in one
 * opens in the other.
 */

/**
 * The analog photography at web sizes. `file` is the master's name in
 * `assets/visual-references/analog-photography/` — what a social definition and `catalog.json`
 * call it — and `src` the copy the site already serves.
 */
export const photographs = [
  { file: "guitarist-in-motion.png", src: "/gallery/guitarist-in-motion.png" },
  { file: "phone-on-sheet-music.png", src: "/gallery/phone-on-sheet-music.png" },
  { file: "piano-keys-in-motion.png", src: "/gallery/piano-keys-in-motion.png" },
  { file: "piano-with-sheet-music.png", src: "/gallery/piano-with-sheet-music.png" },
  { file: "studio-microphone-in-motion.png", src: "/textures/studio-microphone.webp" },
  { file: "stage-microphone-in-motion.png", src: "/textures/stage-microphone.webp" },
  { file: "sampler-and-keyboard-in-motion.png", src: "/textures/sampler-and-keyboard.webp" },
  { file: "sampler-pads-in-motion.png", src: "/textures/sampler-pads.webp" },
] as const

export type PhotographFile = (typeof photographs)[number]["file"]

export function photographSource(file: string): string | undefined {
  return photographs.find((photograph) => photograph.file === file)?.src
}

/// Captured for both devices and both appearances by the app's screenshot tests.
export const appScreenshots = [
  "01-Song-List.png",
  "02-Song-Detail.png",
  "03-Creation-Flow.png",
  "04-Search.png",
  "05-Tag-Filter.png",
  "06-Settings.png",
  "07-Song-Suggestions.png",
  "08-Paywall.png",
] as const

export type AppScreenshot = (typeof appScreenshots)[number]

/// The mark on its tile, drawn on a canvas: the glyph from `design/mark.json`, inset in a rounded square.
export function drawMark(
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

  context.save()
  context.clip()
  const unit = size / 613
  context.translate(x + (size - 270 * unit) / 2, y)
  context.scale(unit, unit)
  context.fillStyle = glyph
  for (const shape of designMark.shapes) {
    if (shape.tag === "path" && shape.d) {
      context.fill(new Path2D(shape.d))
    } else if (shape.tag === "rect") {
      context.fillRect(Number(shape.x), Number(shape.y), Number(shape.width), Number(shape.height))
    }
  }
  context.restore()
}

/**
 * The release badge: a hairline pill of short segments, each divided from the next by a rule —
 * the platforms and the version on a release card. Both editors draw it with this, and
 * `release()` in `scripts/lib/social-templates.mjs` builds the same pill for the PNGs.
 */
export function drawBadge(
  context: CanvasRenderingContext2D,
  segments: readonly string[],
  options: { x: number; y: number; size: number; family: string; color: string },
): { x: number; y: number; width: number; height: number } {
  const { x, y, size } = options
  const geometry = badgeGeometry(size)

  context.save()
  context.font = `400 ${size}px ${options.family}`
  context.letterSpacing = `${(geometry.tracking * size).toFixed(2)}px`
  const widths = segments.map((segment) => context.measureText(segment).width)
  const width = widths.reduce((total, segmentWidth) => total + segmentWidth + geometry.padding * 2, 0)
  const { height, line } = geometry

  context.strokeStyle = options.color
  context.lineWidth = line
  context.globalAlpha = geometry.ruleOpacity
  context.beginPath()
  context.roundRect(x + line / 2, y + line / 2, width - line, height - line, (height - line) / 2)
  context.stroke()

  let left = x
  segments.forEach((segment, index) => {
    if (index > 0) {
      context.globalAlpha = geometry.ruleOpacity
      context.beginPath()
      context.moveTo(left, y)
      context.lineTo(left, y + height)
      context.stroke()
    }
    context.globalAlpha = 1
    context.fillStyle = options.color
    context.textBaseline = "middle"
    context.fillText(segment, left + geometry.padding, y + height / 2)
    left += (widths[index] ?? 0) + geometry.padding * 2
  })
  context.restore()
  return { x, y, width, height }
}

/// The badge's proportions for a font size. Mirrored by `badgeGeometry` in `scripts/lib/social-templates.mjs`.
export function badgeGeometry(size: number) {
  return { padding: size * 0.95, height: size * 2.3, line: Math.max(1, size * 0.07), tracking: 0.08, ruleOpacity: 0.5 }
}

/// A badge's text as its segments: `|` separates them, and empty ones are dropped.
export function badgeSegments(text: string): string[] {
  return text
    .split("|")
    .map((segment) => segment.trim())
    .filter(Boolean)
}
