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

export function appStoreScreenshot({ slide, device, screenshot }) {
  const copyWidth = device.width - device.copy.left * 2

  return h(
    "div",
    {
      style: {
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        overflow: "hidden",
        background: `linear-gradient(145deg, ${slide.gradient[0]} 0%, ${slide.gradient[1]} 100%)`,
      },
    },
    h("div", {
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
            background: "rgba(255,255,255,0.13)",
            border: "1px solid rgba(255,255,255,0.19)",
            fontFamily: "Geist Mono",
            fontWeight: 400,
            fontSize: device.copy.pillSize,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: slide.accent,
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
            color: "rgba(255,255,255,0.76)",
          },
        },
        slide.supporting,
      ),
    ),
    deviceFrame({ device, screenshot }),
  )
}
