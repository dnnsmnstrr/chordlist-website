/**
 * Composition for the App Store creative assets: the product page header, the search results asset,
 * the universal asset, and In-App Event media.
 *
 * The backgrounds and device frames are the screenshot template's own, so a header, a search result
 * and the screenshots under them read as one listing. What differs is the canvas: these are wide or
 * very tall, Apple crops them per device and placement, and everything that matters has to sit
 * inside a centred safe area that the builder passes in.
 */
import { createElement as h } from "react"

import { analogBackground, classicBackground, deviceFrame } from "./app-store-screenshot-template.mjs"

/// The proportions of the screenshot template's frames, which were drawn for the 6.5-inch iPhone
/// and 13-inch iPad canvases. The frames here are scaled from these, and close at the bottom
/// instead of running off the canvas, because a creative asset shows the whole device.
const deviceGeometry = {
  iphone: { screen: { width: 990, height: 2142, radius: 126 }, border: 24, radius: 150, island: [274, 78, 25] },
  ipad: { screen: { width: 1756, height: 2341, radius: 74 }, border: 28, radius: 102 },
}

function scaledDevice({ kind, height, x, y }) {
  const base = deviceGeometry[kind]
  const scale = height / (base.screen.height + base.border * 2)
  const border = Math.round(base.border * scale)
  const screen = {
    width: Math.round(base.screen.width * scale),
    height: height - border * 2,
    radius: Math.round(base.screen.radius * scale),
  }

  return {
    name: kind,
    frame: {
      x,
      y,
      width: screen.width + border * 2,
      height,
      border,
      radius: Math.round(base.radius * scale),
    },
    screen,
    ...(base.island
      ? {
          dynamicIsland: {
            width: Math.round(base.island[0] * scale),
            height: Math.round(base.island[1] * scale),
            top: Math.round(base.island[2] * scale),
          },
        }
      : {}),
  }
}

/**
 * Lays the devices out left to right, bottom-aligned, each overlapping the one before it by
 * `overlap` of its own width and drawn in front of it. Returns them relative to the cluster's
 * top-left corner, plus the cluster's size.
 */
export function deviceCluster({ devices, height, overlap }) {
  const sized = devices.map((device) => {
    const frameHeight = Math.round(height * device.height)
    return { ...device, frame: scaledDevice({ kind: device.kind, height: frameHeight, x: 0, y: 0 }) }
  })

  let x = 0
  const placed = sized.map((device, index) => {
    if (index > 0) {
      const previous = sized[index - 1].frame.frame
      x = x + previous.width - Math.round(device.frame.frame.width * overlap)
    }
    return { ...device, x }
  })

  const last = placed[placed.length - 1]
  const width = last.x + last.frame.frame.width
  const clusterHeight = Math.max(...placed.map((device) => device.frame.frame.height))

  return {
    width,
    height: clusterHeight,
    devices: placed.map((device) => ({
      ...device,
      y: clusterHeight - device.frame.frame.height,
    })),
  }
}

/// The largest headline size at which the longest line still fits the column — an estimate from
/// Geist Bold's average glyph width, since lines are hand-broken and never wrap.
export function fittedHeadlineSize({ lines, columnWidth, maximum }) {
  const averageGlyph = 0.56
  const longest = Math.max(...lines.map((line) => line.length))
  return Math.min(maximum, Math.floor(columnWidth / (longest * averageGlyph)))
}

function lockup({ iconUri, wordmark, size }) {
  return h(
    "div",
    { style: { display: "flex", alignItems: "center", gap: Math.round(size * 0.4) } },
    h("img", { src: iconUri, width: Math.round(size * 1.25), height: Math.round(size * 1.25) }),
    h(
      "div",
      {
        style: {
          display: "flex",
          fontFamily: "Geist Mono",
          fontWeight: 400,
          fontSize: size,
          letterSpacing: "-0.035em",
          lineHeight: 1,
          color: "#FFFFFF",
        },
      },
      wordmark,
    ),
  )
}

function eyebrowPill({ text, size, accent, isAnalog }) {
  return h(
    "div",
    {
      style: {
        display: "flex",
        padding: `${Math.round(size * 0.5)}px ${Math.round(size)}px`,
        borderRadius: 999,
        background: isAnalog ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.13)",
        border: isAnalog ? "2px solid rgba(255,255,255,0.24)" : "2px solid rgba(255,255,255,0.19)",
        fontFamily: "Geist Mono",
        fontWeight: 400,
        fontSize: size,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: isAnalog ? "#F4F4F5" : accent,
      },
    },
    text,
  )
}

/**
 * One creative asset.
 *
 * `format` carries the canvas, its safe area, and the type and device sizes; `art` the colours and
 * photograph for the slide; `text` the words, or `null` for event media, which has none. Devices are
 * `{ kind, height, uri }`, with `height` a fraction of the safe area's.
 */
export function appStoreCreative({ format, art, text, devices, variant, background, iconUri, seed = 1 }) {
  const { width, height, safe } = format
  const isAnalog = variant === "analog"
  const canvas = { width, height }

  const backdrop = isAnalog
    ? analogBackground({
        background,
        device: canvas,
        seed,
        scrims: { top: false, left: Boolean(text) },
      })
    : classicBackground({
        slide: art,
        device: {
          glow: {
            size: Math.round(Math.min(width, height) * 0.62),
            right: -Math.round(Math.min(width, height) * 0.2),
            top: -Math.round(Math.min(width, height) * 0.26),
          },
        },
      })

  const safeLeft = Math.round((width - safe.width) / 2)
  const safeTop = Math.round((height - safe.height) / 2)

  const cluster = deviceCluster({
    devices,
    height: Math.round(safe.height * format.deviceScale),
    overlap: format.deviceOverlap,
  })

  // With words, the devices hold the right of the safe area and the copy takes what is left; without,
  // the devices are the whole composition and sit in its middle.
  const clusterLeft = text ? safeLeft + safe.width - cluster.width : Math.round((width - cluster.width) / 2)
  const clusterTop = safeTop + Math.round((safe.height - cluster.height) / 2)
  const columnWidth = safe.width - cluster.width - format.gap

  const frames = cluster.devices.map((device) => {
    const frame = device.frame
    return deviceFrame({
      device: {
        ...frame,
        frame: { ...frame.frame, x: clusterLeft + device.x, y: clusterTop + device.y },
      },
      screenshot: device.uri,
    })
  })

  let copy = null
  if (text) {
    const headlineSize = fittedHeadlineSize({
      lines: text.headline,
      columnWidth,
      maximum: format.type.headline,
    })

    copy = h(
      "div",
      {
        style: {
          position: "absolute",
          left: safeLeft,
          top: safeTop,
          width: columnWidth,
          height: safe.height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: format.type.gap,
        },
      },
      text.wordmark ? lockup({ iconUri, wordmark: text.wordmark, size: format.type.wordmark }) : null,
      text.eyebrow
        ? eyebrowPill({ text: text.eyebrow, size: format.type.eyebrow, accent: art.accent, isAnalog })
        : null,
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            fontFamily: "Geist",
            fontWeight: 700,
            fontSize: headlineSize,
            letterSpacing: "-0.035em",
            lineHeight: 1.04,
            color: "#FFFFFF",
          },
        },
        ...text.headline.map((line, index) => h("div", { key: index, style: { display: "flex" } }, line)),
      ),
    )
  }

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
    ...frames,
    copy,
  )
}
