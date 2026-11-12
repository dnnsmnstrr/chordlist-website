import { createElement as h } from "react"

import { svgDataUri } from "./chordlist-mark.mjs"

function textBlock(lines, style) {
  return h(
    "div",
    { style: { display: "flex", flexDirection: "column", ...style } },
    ...lines.map((line, index) => h("div", { key: index, style: { display: "flex" } }, line)),
  )
}

/// The four corner radii of a device part, clockwise from the top left. A `flatLeft` device — the
/// folded iPhone Duo, whose left side is the hinge — has a straight left edge with square corners.
function cornerRadii(device, radius) {
  return device.flatLeft ? [0, radius, radius, 0] : [radius, radius, radius, radius]
}

function roundedScreenUri({ device, screenshot }) {
  const { width, height, radius } = device.screen
  const shape = device.flatLeft
    ? `<path d="M0,0 H${width - radius} A${radius},${radius} 0 0 1 ${width},${radius} V${height - radius} ` +
      `A${radius},${radius} 0 0 1 ${width - radius},${height} H0 Z"/>`
    : `<rect width="${width}" height="${height}" rx="${radius}" ry="${radius}"/>`

  return svgDataUri(
    [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
      `<defs><clipPath id="screen">${shape}</clipPath></defs>`,
      `<image href="${screenshot}" width="${width}" height="${height}" preserveAspectRatio="none" clip-path="url(#screen)"/>`,
      `</svg>`,
    ].join(""),
  )
}

function random(seed) {
  let state = seed * 9301 + 49297
  return () => {
    state = (state * 9301 + 49297) % 233280
    return state / 233280
  }
}

function textureUri({ width, height, seed }) {
  const next = random(seed)
  const dust = Array.from({ length: 190 }, () => {
    const x = Math.round(next() * width)
    const y = Math.round(next() * height)
    const size = (0.8 + next() * 2.8).toFixed(1)
    const opacity = (0.05 + next() * 0.18).toFixed(2)
    return `<circle cx="${x}" cy="${y}" r="${size}" fill="#fff" opacity="${opacity}"/>`
  }).join("")
  const scratches = Array.from({ length: 8 }, () => {
    const x = Math.round(next() * width)
    const y = Math.round(next() * height * 0.8)
    const drift = Math.round((next() - 0.5) * 36)
    const length = Math.round(height * (0.08 + next() * 0.24))
    const opacity = (0.06 + next() * 0.16).toFixed(2)
    return `<line x1="${x}" y1="${y}" x2="${x + drift}" y2="${y + length}" stroke="#fff" stroke-width="1" opacity="${opacity}"/>`
  }).join("")

  return svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${dust}${scratches}</svg>`,
  )
}

function coverBox(source, target, focus = [0.5, 0.5]) {
  const scale = Math.max(target.width / source.width, target.height / source.height)
  const width = Math.ceil(source.width * scale)
  const height = Math.ceil(source.height * scale)

  return {
    width,
    height,
    left: Math.round((target.width - width) * focus[0]),
    top: Math.round((target.height - height) * focus[1]),
  }
}

export function classicBackground({ slide, device }) {
  return [
    h("div", {
      key: "gradient",
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        background: `linear-gradient(145deg, ${slide.gradient[0]} 0%, ${slide.gradient[1]} 100%)`,
      },
    }),
    h("div", {
      key: "glow",
      style: {
        position: "absolute",
        right: device.glow.right,
        top: device.glow.top,
        width: device.glow.size,
        height: device.glow.size,
        display: "flex",
        borderRadius: device.glow.size,
        background: slide.accent,
        opacity: 0.2,
      },
    }),
  ]
}

/// The photograph, bloom, and grain are the look; every darkening layer is opt-in. Until satori was
/// given explicit offsets instead of `inset: 0` none of them rendered, and the approved sets were built
/// without them — switched on together over a photo at 0.44 they crush every slide to the same black.
/// `scrims` darken the photograph behind the copy: the top band, or the left column for a layout that
/// sets its words on the left. `vignette` darkens the corners.
export function analogBackground({ background, device, seed, scrims = { top: false, left: false }, vignette = false }) {
  const box = coverBox(background, device, background.focus)

  return [
    h("div", {
      key: "black",
      style: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0, display: "flex", background: "#050505" },
    }),
    h("img", {
      key: "photograph",
      src: background.uri,
      width: box.width,
      height: box.height,
      style: { position: "absolute", left: box.left, top: box.top, opacity: 0.44 },
    }),
    scrims.top && h("div", {
      key: "copy-scrim",
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        background:
          "linear-gradient(180deg, rgba(3,3,3,0.92) 0%, rgba(3,3,3,0.7) 22%, rgba(3,3,3,0.22) 52%, rgba(3,3,3,0.82) 100%)",
      },
    }),
    scrims.left && h("div", {
      key: "copy-column-scrim",
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        background:
          "linear-gradient(90deg, rgba(2,2,2,0.72) 0%, rgba(2,2,2,0.48) 46%, rgba(2,2,2,0.08) 82%, rgba(2,2,2,0) 100%)",
      },
    }),
    vignette && h("div", {
      key: "vignette",
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        background:
          "radial-gradient(ellipse at 58% 43%, rgba(0,0,0,0) 24%, rgba(0,0,0,0.34) 58%, rgba(0,0,0,0.94) 100%)",
      },
    }),
    h("div", {
      key: "bloom",
      style: {
        position: "absolute",
        right: -Math.round(device.width * 0.18),
        top: -Math.round(device.height * 0.12),
        width: Math.round(device.width * 0.82),
        height: Math.round(device.height * 0.5),
        display: "flex",
        borderRadius: 9999,
        background:
          "radial-gradient(ellipse at 45% 45%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.06) 34%, rgba(255,255,255,0) 72%)",
      },
    }),
    h("img", {
      key: "texture",
      src: textureUri({ width: device.width, height: device.height, seed }),
      width: device.width,
      height: device.height,
      style: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0, opacity: 0.72 },
    }),
  ].filter(Boolean)
}

export function deviceFrame({ device, screenshot }) {
  // Drawn only for a device that declares one. The iPhone capture holds a top status bar with a gap
  // where the Dynamic Island sits, so the frame has to supply it; the iPad and both Duo displays
  // capture their whole screen, status area included, and get nothing drawn over them.
  const hasDynamicIsland = Boolean(device.dynamicIsland)
  const screenUri = roundedScreenUri({ device, screenshot })

  return h(
    "div",
    {
      style: {
        position: "absolute",
        left: device.frame.x,
        top: device.frame.y,
        width: device.frame.width,
        height: device.frame.height,
        display: "flex",
        padding: device.frame.border,
        borderRadius: cornerRadii(device, device.frame.radius).map((radius) => `${radius}px`).join(" "),
        background: "#0A0A0D",
        boxShadow: "0 42px 100px rgba(0,0,0,0.38)",
      },
    },
    h(
      "div",
      {
        style: {
          position: "relative",
          width: device.screen.width,
          height: device.screen.height,
          display: "flex",
          overflow: "hidden",
          borderRadius: cornerRadii(device, device.screen.radius).map((radius) => `${radius}px`).join(" "),
          background: "#000000",
        },
      },
      h("img", {
        src: screenUri,
        width: device.screen.width,
        height: device.screen.height,
        style: { position: "absolute", left: 0, top: 0 },
      }),
      ...(hasDynamicIsland
        ? [
            h("div", {
              key: "dynamic-island",
              style: {
                position: "absolute",
                left: Math.round((device.screen.width - device.dynamicIsland.width) / 2),
                top: device.dynamicIsland.top,
                width: device.dynamicIsland.width,
                height: device.dynamicIsland.height,
                display: "flex",
                borderRadius: device.dynamicIsland.height,
                background: "#000000",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 1px 2px rgba(255,255,255,0.12) inset",
              },
            }),
          ]
        : []),
    ),
  )
}

/// The stacked layout lists eyebrow, headline, and supporting line as siblings; the split layout
/// groups the first two into a column so the supporting line can sit beside them.
function copyBlocks(isSplit, device, eyebrow, headline, supporting) {
  if (!isSplit) return [eyebrow, headline, supporting]

  return [
    h(
      "div",
      { key: "lead", style: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: device.copy.gap } },
      eyebrow,
      headline,
    ),
    supporting,
  ]
}

export function appStoreScreenshot({ slide, device, screenshot, variant = "classic", background, seed = 1 }) {
  const copyWidth = device.width - device.copy.left * 2
  const isAnalog = variant === "analog"
  // "split" sets the supporting line beside the headline instead of under it, and the headline on
  // one line — for a landscape canvas, where every stacked line costs the device its height.
  const isSplit = device.copy.layout === "split"
  const supportingWidth = isSplit ? device.copy.supportingWidth : copyWidth
  const backdrop = isAnalog
    ? analogBackground({ background, device, seed })
    : classicBackground({ slide, device })

  return h(
    "div",
    {
      style: {
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        overflow: "hidden",
        background: "#050505",
      },
    },
    ...backdrop,
    h(
      "div",
      {
        style: {
          position: "absolute",
          left: device.copy.left,
          top: device.copy.top,
          width: copyWidth,
          display: "flex",
          flexDirection: isSplit ? "row" : "column",
          alignItems: isSplit ? "flex-end" : "flex-start",
          justifyContent: isSplit ? "space-between" : "flex-start",
          gap: device.copy.gap,
        },
      },
      ...copyBlocks(
        isSplit,
        device,
        h(
        "div",
        {
          style: {
            display: "flex",
            padding: `${device.copy.pillPaddingY}px ${device.copy.pillPaddingX}px`,
            borderRadius: 999,
            background: isAnalog ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.13)",
            border: isAnalog
              ? "1px solid rgba(255,255,255,0.24)"
              : "1px solid rgba(255,255,255,0.19)",
            fontFamily: "Geist Mono",
            fontWeight: 400,
            fontSize: device.copy.pillSize,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: isAnalog ? "#F4F4F5" : slide.accent,
          },
        },
        slide.eyebrow,
      ),
      textBlock(isSplit ? [slide.headline.join(" ")] : slide.headline, {
        width: copyWidth - (isSplit ? supportingWidth + device.copy.gap : 0),
        fontFamily: "Geist",
        fontWeight: 700,
        fontSize: device.copy.headlineSize,
        letterSpacing: "-0.035em",
        lineHeight: 1.02,
        color: "#FFFFFF",
      }),
      h(
        "div",
        {
          style: {
            width: supportingWidth,
            display: "flex",
            justifyContent: isSplit ? "flex-end" : "flex-start",
            textAlign: isSplit ? "right" : "left",
            // Beside the headline the line is short enough to end on a single orphaned word.
            textWrap: isSplit ? "balance" : "wrap",
            // Rests on the headline's baseline rather than its line box.
            marginBottom: isSplit ? Math.round(device.copy.headlineSize * 0.1) : 0,
            fontFamily: "Geist",
            fontWeight: 400,
            fontSize: device.copy.supportingSize,
            lineHeight: 1.28,
            color: isAnalog ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.76)",
          },
        },
        slide.supporting,
      ),
      ),
    ),
    deviceFrame({ device, screenshot }),
  )
}
