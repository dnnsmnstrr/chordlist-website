/**
 * Shared geometry for the chordlist mark.
 *
 * This is the single source of truth for the artwork used by the favicons
 * (scripts/build-icons.mjs) and the Open Graph image (scripts/build-og-image.mjs).
 * The glyph is kept identical to components/chordlist-icon.tsx so the header
 * logo, the icons, and the social card never drift apart.
 */

/** Two rounded key bars, each with a thin descending stem. */
export const GLYPH = {
  width: 270,
  height: 613,
  rects: [
    { x: 0, y: 0, width: 76, height: 375, rx: 10 },
    { x: 35.5, y: 307, width: 5, height: 306, rx: 0 },
    { x: 194, y: 0, width: 76, height: 375, rx: 10 },
    { x: 229.5, y: 307, width: 5, height: 306, rx: 0 },
  ],
}

/**
 * Traces a superellipse (|x/r|^n + |y/r|^n = 1) as an SVG path — the "squircle"
 * iOS uses to mask home screen icons. Unlike a rounded rectangle it has no
 * junction between straight edge and corner arc, so the outline stays smooth
 * all the way around at any size.
 *
 * An exponent of 4–5 reads like an iOS icon; higher is boxier, lower tends
 * toward an ellipse.
 */
export function squirclePath(size, exponent = 5, steps = 360) {
  const r = size / 2
  const k = 2 / exponent
  const points = []

  for (let i = 0; i < steps; i += 1) {
    const t = (i / steps) * Math.PI * 2
    const cos = Math.cos(t)
    const sin = Math.sin(t)
    const x = r + Math.sign(cos) * Math.abs(cos) ** k * r
    const y = r + Math.sign(sin) * Math.abs(sin) ** k * r
    points.push(`${x.toFixed(3)},${y.toFixed(3)}`)
  }

  return `M${points.join("L")}Z`
}

/**
 * Positions the glyph inside a square tile, scaled to fill the tile's height
 * and centred horizontally — the same fit the header applies via
 * `preserveAspectRatio="xMidYMid meet"` on a square box.
 *
 * `glyphInset` is the fraction of the tile left empty above and below. 0 means
 * the keys touch the top edge and the stems reach the bottom.
 */
export function glyphTransform(size, glyphInset = 0) {
  const scale = (size * (1 - glyphInset * 2)) / GLYPH.height
  return {
    scale,
    offsetX: (size - GLYPH.width * scale) / 2,
    offsetY: size * glyphInset,
  }
}

function glyphRects() {
  return GLYPH.rects
    .map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" rx="${r.rx}"/>`)
    .join("")
}

/**
 * The app icon as a standalone SVG string: glyph on a squircle tile.
 *
 * Pass `tileColor`/`glyphColor` for a fixed appearance, or `themed: true` to
 * emit a stylesheet that follows prefers-color-scheme (light scheme gets the
 * dark tile, matching the header's bg-foreground / text-background pairing).
 *
 * The glyph is clipped to the tile so a full-bleed glyph can never spill past
 * the squircle's edge, which curves inward faster than a rounded rectangle.
 */
export function markSvg({
  size = 180,
  exponent = 5,
  glyphInset = 0,
  tileColor,
  glyphColor,
  themed = false,
} = {}) {
  const tile = squirclePath(size, exponent)
  const { scale, offsetX, offsetY } = glyphTransform(size, glyphInset)

  const style = themed
    ? `<style>.tile{fill:${tileColor}}.glyph{fill:${glyphColor}}` +
      `@media(prefers-color-scheme:dark){.tile{fill:${glyphColor}}.glyph{fill:${tileColor}}}</style>`
    : ""

  const tileFill = themed ? 'class="tile"' : `fill="${tileColor}"`
  const glyphFill = themed ? 'class="glyph"' : `fill="${glyphColor}"`

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    style,
    `<defs><clipPath id="tile"><path d="${tile}"/></clipPath></defs>`,
    `<path d="${tile}" ${tileFill}/>`,
    // The clip lives on an untransformed wrapper: a clip-path on the same
    // element as a transform is resolved in that element's transformed space,
    // which would shrink the clip region by the glyph's scale factor.
    `<g clip-path="url(#tile)">`,
    `<g transform="translate(${offsetX.toFixed(3)},${offsetY.toFixed(3)}) scale(${scale.toFixed(6)})" ${glyphFill}>`,
    glyphRects(),
    `</g>`,
    `</g>`,
    `</svg>`,
  ].join("")
}

export function svgDataUri(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
}
