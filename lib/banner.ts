import { parse as parseYaml } from "yaml"

import designTokens from "@/design/tokens.json"
import { siteConfig } from "@/lib/site-config"
import {
  appScreenshots,
  badgeSegments,
  photographs,
  type AppScreenshot,
  type PhotographFile,
} from "@/lib/visual-assets"
import { bannerCopy, releaseCardCopy } from "@/locales/en"
import { phrase } from "@/locales/vocabulary"

/**
 * The banner builder's document: a canvas size and what sits on it, in canvas pixels.
 *
 * Pure data and pure functions, so `/banner` can store a spec, restore it, and resize it without
 * touching the canvas. `components/banner-builder.tsx` draws it.
 */

export type BannerBackgroundId = "violet" | "green" | "graphite" | "ink" | "paper" | "blueprint" | "photo"
export type BannerDeviceKind = "iphone" | "ipad"
export type BannerAppearance = "light" | "dark"
export type BannerElementId = "logo" | "title" | "badge" | "tagline"
/// `full` fills the canvas behind a scrim; `right` sets the photograph on the right and fades it into
/// the ground towards the words, the release-notes look.
export type BannerPhotoArea = "full" | "right"

export type BannerLogo = { visible: boolean; x: number; y: number; size: number }
export type BannerText = { visible: boolean; text: string; x: number; y: number; size: number }
export type BannerTagline = BannerText & { weight: BannerWeight; muted: boolean }
/// A pill of short segments — the platforms and the version on a release card. `|` separates them.
export type BannerBadge = BannerText

export const bannerWeights = [300, 400, 700] as const
export type BannerWeight = (typeof bannerWeights)[number]

export type BannerDevice = {
  id: string
  kind: BannerDeviceKind
  /// `false` draws the bare screen with rounded corners and no bezel.
  frame: boolean
  shadow: boolean
  screenshot: AppScreenshot
  appearance: BannerAppearance
  x: number
  y: number
  /// The outer height — the bezel's, or the screen's when there is no frame.
  height: number
  rotation: number
}

export type BannerSpec = {
  width: number
  height: number
  background: BannerBackgroundId
  photo: PhotographFile
  focusX: number
  focusY: number
  photoOpacity: number
  photoArea: BannerPhotoArea
  logo: BannerLogo
  title: BannerText
  badge: BannerBadge
  tagline: BannerTagline
  /// Back to front: the last device is drawn on top.
  devices: BannerDevice[]
}

export const bannerLimits = { minimumSize: 16, maximumSize: 6000, exportScales: [1, 2, 3] as const }

export const bannerPresets = [
  { id: "wide-header", width: 1072, height: 128 },
  { id: "x-header", width: 1500, height: 500 },
  { id: "linkedin", width: 1584, height: 396 },
  { id: "github", width: 1280, height: 640 },
  { id: "link-card", width: 1200, height: 630 },
  { id: "release-card", width: 1080, height: 540 },
  { id: "square", width: 1080, height: 1080 },
  { id: "portrait", width: 1080, height: 1350 },
] as const

export type BannerPresetId = (typeof bannerPresets)[number]["id"]

type Gradient = { kind: "gradient"; colors: readonly [string, string]; accent: string; text: string; muted: string }
type Solid = { kind: "solid"; color: string; text: string; muted: string }
type Photo = { kind: "photo"; color: string; text: string; muted: string }

/// The gradients are the App Store creative's (`scripts/build-app-store-creative.mjs`), the solids
/// the design campaigns, so a banner sits beside the listing and the social posts.
export const bannerBackgrounds: Record<BannerBackgroundId, Gradient | Solid | Photo> = {
  violet: { kind: "gradient", colors: ["#17142B", "#5B3FD6"], accent: "#B9ABFF", text: "#FFFFFF", muted: "#C9C1F2" },
  green: { kind: "gradient", colors: ["#111D18", "#35755C"], accent: "#9CE7BE", text: "#FFFFFF", muted: "#B8D9C8" },
  graphite: { kind: "gradient", colors: ["#181818", "#55505E"], accent: "#E9DEFF", text: "#FFFFFF", muted: "#C4C0CA" },
  ink: { kind: "solid", color: designTokens.campaigns.ink.background, text: designTokens.campaigns.ink.text, muted: designTokens.campaigns.ink.muted },
  paper: { kind: "solid", color: designTokens.campaigns.paper.background, text: designTokens.campaigns.paper.text, muted: designTokens.campaigns.paper.muted },
  blueprint: {
    kind: "solid",
    color: designTokens.campaigns.blueprint.background,
    text: designTokens.campaigns.blueprint.text,
    muted: designTokens.campaigns.blueprint.muted,
  },
  photo: { kind: "photo", color: "#050505", text: "#FFFFFF", muted: "#D4D4D8" },
}

/**
 * The App Store creative's frame geometry (`deviceGeometry` in
 * `scripts/lib/app-store-creative-template.mjs`), in the 6.5-inch iPhone and 13-inch iPad canvases'
 * pixels. Everything here is scaled from it, so a banner's devices match the listing's.
 */
export const bannerDeviceGeometry = {
  iphone: { screen: { width: 990, height: 2142, radius: 126 }, border: 24, radius: 150, island: { width: 274, height: 78, top: 25 } },
  ipad: { screen: { width: 1756, height: 2341, radius: 74 }, border: 28, radius: 102, island: null },
} as const

export function screenshotSource(device: Pick<BannerDevice, "kind" | "appearance" | "screenshot">): string {
  const segment = device.kind === "ipad" ? "ipad/" : ""
  return `/app-screenshots/${segment}${device.appearance}/${device.screenshot}`
}

/// The device's unrotated width for its height.
export function deviceWidth(device: Pick<BannerDevice, "kind" | "frame" | "height">): number {
  const geometry = bannerDeviceGeometry[device.kind]
  const border = device.frame ? geometry.border * 2 : 0
  return (device.height * (geometry.screen.width + border)) / (geometry.screen.height + border)
}

/// The tagline, broken after its comma so it reads as two short lines on a wide, low banner.
const defaultTagline = phrase("tagline", "en").replace(/, /, ",\n")

let nextDeviceNumber = 0

export function newDeviceId(): string {
  nextDeviceNumber += 1
  return `device-${Date.now().toString(36)}-${nextDeviceNumber}`
}

export const defaultBannerSpec: BannerSpec = {
  width: 1072,
  height: 128,
  background: "violet",
  photo: "guitarist-in-motion.png",
  focusX: 60,
  focusY: 50,
  photoOpacity: 44,
  photoArea: "full",
  logo: { visible: true, x: 32, y: 34, size: 60 },
  title: { visible: true, text: siteConfig.name, x: 110, y: 44, size: 40 },
  badge: { visible: false, text: releaseCardCopy.badge, x: 372, y: 44, size: 14 },
  tagline: { visible: true, text: defaultTagline, x: 372, y: 36, size: 24, weight: 700, muted: false },
  devices: [
    {
      id: "device-ipad",
      kind: "ipad",
      frame: true,
      shadow: true,
      screenshot: "02-Song-Detail.png",
      appearance: "light",
      x: 776,
      y: 18,
      height: 320,
      rotation: 0,
    },
    {
      id: "device-iphone",
      kind: "iphone",
      frame: true,
      shadow: true,
      screenshot: "01-Song-List.png",
      appearance: "light",
      x: 940,
      y: 34,
      height: 240,
      rotation: 0,
    },
  ],
}

/// A card to post with an update, after Raycast's: the photograph on the right, a badge naming the
/// platforms and version, and the headline set large and light beneath it.
export const releaseNotesSpec: BannerSpec = {
  width: 1080,
  height: 540,
  background: "photo",
  photo: "studio-microphone-in-motion.png",
  focusX: 50,
  focusY: 40,
  photoOpacity: 75,
  photoArea: "right",
  logo: { visible: true, x: 64, y: 60, size: 44 },
  title: { visible: true, text: siteConfig.name, x: 122, y: 66, size: 28 },
  badge: { visible: true, text: releaseCardCopy.badge, x: 64, y: 246, size: 20 },
  tagline: { visible: true, text: releaseCardCopy.headline, x: 60, y: 312, size: 84, weight: 300, muted: false },
  devices: [],
}

export const bannerTemplates = [
  { id: "header", spec: defaultBannerSpec },
  { id: "releaseNotes", spec: releaseNotesSpec },
] as const

export type BannerTemplateId = (typeof bannerTemplates)[number]["id"]

export function newDevice(kind: BannerDeviceKind, spec: BannerSpec): BannerDevice {
  const height = Math.round(spec.height * 0.9)
  return {
    id: newDeviceId(),
    kind,
    frame: true,
    shadow: true,
    screenshot: kind === "ipad" ? "02-Song-Detail.png" : "01-Song-List.png",
    appearance: "light",
    x: Math.round((spec.width - deviceWidth({ kind, frame: true, height })) / 2),
    y: Math.round((spec.height - height) / 2),
    height,
    rotation: 0,
  }
}

export function clampCanvasSize(value: number): number {
  if (!Number.isFinite(value)) return bannerLimits.minimumSize
  return Math.min(bannerLimits.maximumSize, Math.max(bannerLimits.minimumSize, Math.round(value)))
}

/**
 * The spec at a new canvas size. With `scaleLayout`, the composition is scaled uniformly by as much
 * as fits the new canvas and centred in it, so a layout drawn for one banner keeps its proportions
 * on another rather than stretching along one axis or landing off the edge.
 */
export function resizeBanner(spec: BannerSpec, width: number, height: number, scaleLayout: boolean): BannerSpec {
  const next = { ...spec, width: clampCanvasSize(width), height: clampCanvasSize(height) }
  if (!scaleLayout) return next

  const scale = Math.min(next.width / spec.width, next.height / spec.height)
  const offsetX = (next.width - spec.width * scale) / 2
  const offsetY = (next.height - spec.height * scale) / 2
  const size = (value: number) => Math.max(1, Math.round(value * scale))
  const place = <T extends { x: number; y: number }>(item: T): T => ({
    ...item,
    x: Math.round(item.x * scale + offsetX),
    y: Math.round(item.y * scale + offsetY),
  })

  return {
    ...next,
    logo: { ...place(spec.logo), size: size(spec.logo.size) },
    title: { ...place(spec.title), size: size(spec.title.size) },
    badge: { ...place(spec.badge), size: size(spec.badge.size) },
    tagline: { ...place(spec.tagline), size: size(spec.tagline.size) },
    devices: spec.devices.map((device) => ({ ...place(device), height: size(device.height) })),
  }
}

/**
 * The banner's words as a `release` social definition, the Markdown the social editor opens and
 * `content/social/` holds: its headline, badge, and photograph, in every format. A banner is laid
 * out by hand at one size; the definition is laid out by the template at three, so only the words
 * and the picture travel — never the positions.
 */
export function releaseDefinition(spec: BannerSpec, created: string): string {
  const quote = (value: string) => JSON.stringify(value)
  const list = (values: string[]) => values.map((value) => `  - ${quote(value)}`)
  const headline = spec.tagline.text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  const badge = spec.badge.visible ? badgeSegments(spec.badge.text) : []
  const fromPhoto = spec.background === "photo"
  const photo = fromPhoto ? spec.photo : releaseNotesSpec.photo
  const focus = fromPhoto ? spec : releaseNotesSpec

  return [
    "---",
    "template: release",
    `eyebrow: ${quote(releaseCardCopy.eyebrow)}`,
    "formats:",
    "  - card",
    "  - post",
    "  - story",
    `photo: ${quote(photo)}`,
    `focus: ${focus.focusX}% ${focus.focusY}%`,
    ...(badge.length ? ["badge:", ...list(badge)] : []),
    ...(headline.length ? ["headline:", ...list(headline)] : []),
    `footnote: ${quote(new URL(siteConfig.url).host)}`,
    `alt: ${quote(releaseCardCopy.alt(headline.join(" ")))}`,
    `created: ${created}`,
    "---",
    "",
  ].join("\n")
}

/**
 * The reverse of `releaseDefinition`: a `release` social definition — the one the social editor
 * exports, or the one the backend's release log copies — laid onto the release-notes card. Only the
 * words, the photograph, and its focus are read; the positions are the template's.
 */
export function specFromReleaseDefinition(source: string, base: BannerSpec = releaseNotesSpec): BannerSpec {
  const split = source.trim().match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!split) throw new Error(bannerCopy.importErrors.frontmatter)
  const data: unknown = parseYaml(split[1] ?? "")
  if (!isRecord(data)) throw new Error(bannerCopy.importErrors.frontmatter)
  if (data.template !== "release") throw new Error(bannerCopy.importErrors.template(String(data.template ?? "")))

  const strings = (value: unknown) =>
    (Array.isArray(value) ? value : typeof value === "string" ? [value] : [])
      .map((entry) => String(entry).trim())
      .filter(Boolean)
  const headline = strings(data.headline)
  const badge = strings(data.badge)
  const [focusX, focusY] = typeof data.focus === "string"
    ? data.focus.split(/\s+/).map((part) => Number.parseFloat(part))
    : []

  return {
    ...base,
    background: "photo",
    photo: oneOf(data.photo, photographs.map((photo) => photo.file), base.photo),
    focusX: Number.isFinite(focusX) ? Math.min(100, Math.max(0, focusX ?? 0)) : base.focusX,
    focusY: Number.isFinite(focusY) ? Math.min(100, Math.max(0, focusY ?? 0)) : base.focusY,
    badge: { ...base.badge, visible: badge.length > 0, text: badge.length ? badge.join(" | ") : base.badge.text },
    tagline: { ...base.tagline, text: headline.length ? headline.join("\n") : base.tagline.text },
  }
}

/// A pasted or linked text that is worth trying as a definition, before parsing it.
export function looksLikeReleaseDefinition(source: string): boolean {
  return /^---\r?\n[\s\S]*?^template:\s*release\s*$/m.test(source.trim())
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function booleanOr(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback
}

function oneOf<T extends string | number>(value: unknown, options: readonly T[], fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback
}

/**
 * A spec read back from storage, with anything missing or malformed replaced by the default — a
 * stored spec from an older version of the builder should open, not throw.
 */
export function restoreBannerSpec(value: unknown): BannerSpec {
  const fallback = defaultBannerSpec
  if (!isRecord(value)) return fallback

  const logo = isRecord(value.logo) ? value.logo : {}
  const title = isRecord(value.title) ? value.title : {}
  const badge = isRecord(value.badge) ? value.badge : {}
  const tagline = isRecord(value.tagline) ? value.tagline : {}
  const devices = Array.isArray(value.devices) ? value.devices.filter(isRecord) : fallback.devices

  return {
    width: clampCanvasSize(numberOr(value.width, fallback.width)),
    height: clampCanvasSize(numberOr(value.height, fallback.height)),
    background: oneOf(value.background, Object.keys(bannerBackgrounds) as BannerBackgroundId[], fallback.background),
    photo: oneOf(value.photo, photographs.map((photo) => photo.file), fallback.photo),
    focusX: numberOr(value.focusX, fallback.focusX),
    focusY: numberOr(value.focusY, fallback.focusY),
    photoOpacity: Math.min(100, Math.max(0, numberOr(value.photoOpacity, fallback.photoOpacity))),
    photoArea: oneOf(value.photoArea, ["full", "right"] as const, fallback.photoArea),
    logo: {
      visible: booleanOr(logo.visible, fallback.logo.visible),
      x: numberOr(logo.x, fallback.logo.x),
      y: numberOr(logo.y, fallback.logo.y),
      size: numberOr(logo.size, fallback.logo.size),
    },
    title: {
      visible: booleanOr(title.visible, fallback.title.visible),
      text: stringOr(title.text, fallback.title.text),
      x: numberOr(title.x, fallback.title.x),
      y: numberOr(title.y, fallback.title.y),
      size: numberOr(title.size, fallback.title.size),
    },
    badge: {
      visible: booleanOr(badge.visible, fallback.badge.visible),
      text: stringOr(badge.text, fallback.badge.text),
      x: numberOr(badge.x, fallback.badge.x),
      y: numberOr(badge.y, fallback.badge.y),
      size: numberOr(badge.size, fallback.badge.size),
    },
    tagline: {
      visible: booleanOr(tagline.visible, fallback.tagline.visible),
      text: stringOr(tagline.text, fallback.tagline.text),
      x: numberOr(tagline.x, fallback.tagline.x),
      y: numberOr(tagline.y, fallback.tagline.y),
      size: numberOr(tagline.size, fallback.tagline.size),
      weight: oneOf(tagline.weight, bannerWeights, fallback.tagline.weight),
      muted: booleanOr(tagline.muted, fallback.tagline.muted),
    },
    devices: devices.map((device) => ({
      id: stringOr(device.id, newDeviceId()),
      kind: oneOf(device.kind, ["iphone", "ipad"] as const, "iphone"),
      frame: booleanOr(device.frame, true),
      shadow: booleanOr(device.shadow, true),
      screenshot: oneOf(device.screenshot, appScreenshots, "01-Song-List.png"),
      appearance: oneOf(device.appearance, ["light", "dark"] as const, "light"),
      x: numberOr(device.x, 0),
      y: numberOr(device.y, 0),
      height: Math.max(1, numberOr(device.height, 100)),
      rotation: numberOr(device.rotation, 0),
    })),
  }
}
