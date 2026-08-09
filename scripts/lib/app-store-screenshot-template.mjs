import { createElement as h } from "react"

import { svgDataUri } from "./chordlist-mark.mjs"

function textBlock(lines, style) {
  return h(
    "div",
    { style: { display: "flex", flexDirection: "column", ...style } },
    ...lines.map((line, index) => h("div", { key: index, style: { display: "flex" } }, line)),
  )
}

function roundedScreenUri({ device, screenshot }) {
  const { width, height, radius } = device.screen

  return svgDataUri(
    [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
      `<defs><clipPath id="screen"><rect width="${width}" height="${height}" rx="${radius}" ry="${radius}"/></clipPath></defs>`,
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

function classicBackground({ slide, device }) {
  return [
    h("div", {
      key: "gradient",
      style: {
        position: "absolute",
        inset: 0,
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

function analogBackground({ background, device, seed }) {
  const box = coverBox(background, device, background.focus)

  return [
    h("div", {
      key: "black",
      style: { position: "absolute", inset: 0, display: "flex", background: "#050505" },
    }),
    h("img", {
      key: "photograph",
      src: background.uri,
      width: box.width,
      height: box.height,
      style: { position: "absolute", left: box.left, top: box.top, opacity: 0.44 },
    }),
    h("div", {
      key: "copy-scrim",
      style: {
        position: "absolute",
        inset: 0,
        display: "flex",
        background:
          "linear-gradient(180deg, rgba(3,3,3,0.92) 0%, rgba(3,3,3,0.7) 22%, rgba(3,3,3,0.22) 52%, rgba(3,3,3,0.82) 100%)",
      },
    }),
    h("div", {
      key: "copy-column-scrim",
      style: {
        position: "absolute",
        inset: 0,
        display: "flex",
        background:
          "linear-gradient(90deg, rgba(2,2,2,0.72) 0%, rgba(2,2,2,0.48) 46%, rgba(2,2,2,0.08) 82%, rgba(2,2,2,0) 100%)",
      },
    }),
    h("div", {
      key: "vignette",
      style: {
        position: "absolute",
        inset: 0,
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
      style: { position: "absolute", inset: 0, opacity: 0.72 },
    }),
  ]
}

function deviceFrame({ device, screenshot }) {
  const isPhone = device.name === "iphone"
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
        borderRadius: device.frame.radius,
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
          borderRadius: device.screen.radius,
          background: "#000000",
        },
      },
      h("img", {
        src: screenUri,
        width: device.screen.width,
        height: device.screen.height,
        style: { position: "absolute", left: 0, top: 0 },
      }),
      ...(isPhone
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

export function appStoreScreenshot({ slide, device, screenshot, variant = "classic", background, seed = 1 }) {
  const copyWidth = device.width - device.copy.left * 2
  const isAnalog = variant === "analog"
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
          flexDirection: "column",
          alignItems: "flex-start",
          gap: device.copy.gap,
        },
      },
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
      textBlock(slide.headline, {
        width: copyWidth,
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
            width: copyWidth,
            display: "flex",
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
    deviceFrame({ device, screenshot }),
  )
}
