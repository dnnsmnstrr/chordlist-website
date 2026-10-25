"use client"

import designTokens from "@/design/tokens.json"

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent, type ReactNode } from "react"
import { ArrowDown, ArrowUp, Download, ExternalLink, Plus, RotateCcw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  bannerBackgrounds,
  bannerDeviceGeometry,
  bannerLimits,
  bannerPresets,
  bannerTemplates,
  bannerWeights,
  defaultBannerSpec,
  deviceWidth,
  looksLikeReleaseDefinition,
  newDevice,
  releaseDefinition,
  resizeBanner,
  restoreBannerSpec,
  screenshotSource,
  specFromReleaseDefinition,
  type BannerDevice,
  type BannerDeviceKind,
  type BannerElementId,
  type BannerSpec,
} from "@/lib/banner"
import { cn } from "@/lib/utils"
import { appScreenshots, badgeSegments, drawBadge, drawMark, photographs, photographSource } from "@/lib/visual-assets"
import { bannerCopy, visualAssetCopy } from "@/locales/en"

type Box = { x: number; y: number; width: number; height: number }

/// Where everything landed on the last draw, by element id or device id — what the drag handles
/// and the centring buttons measure against, since only the canvas knows how wide text renders.
type Layout = Record<string, Box>

type Assets = {
  sans: string
  mono: string
  photo: HTMLImageElement | null
  screens: Map<string, HTMLImageElement>
}

type Drag = { id: string; pointerX: number; pointerY: number; startX: number; startY: number; unit: number }

const storageKey = "chordlist.banner-builder"
const lineHeight = 1.15

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-ring/30"

const imageCache = new Map<string, Promise<HTMLImageElement>>()

function loadImage(src: string): Promise<HTMLImageElement> {
  let pending = imageCache.get(src)
  if (!pending) {
    pending = new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = src
    })
    // A failed load is not cached, so a screenshot that appears after a sync is picked up on retry.
    pending.catch(() => imageCache.delete(src))
    imageCache.set(src, pending)
  }
  return pending
}

function fontFamily(variable: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
  return value || fallback
}

async function loadAssets(spec: BannerSpec): Promise<Assets> {
  const sans = fontFamily("--font-geist-sans", "Arial, sans-serif")
  const mono = fontFamily("--font-geist-mono", "monospace")
  // A canvas draws with whatever is loaded at that moment, so the weights it uses are asked for
  // explicitly rather than hoping the page has already rendered text in each of them.
  await Promise.all([
    document.fonts.load(`400 32px ${mono}`),
    document.fonts.load(`300 32px ${sans}`),
    document.fonts.load(`400 32px ${sans}`),
    document.fonts.load(`700 32px ${sans}`),
  ]).catch(() => undefined)

  const photoSource = spec.customPhoto || photographSource(spec.photo)
  const sources = [...new Set(spec.devices.map(screenshotSource))]
  const [photo, ...screens] = await Promise.all([
    spec.background === "photo" && photoSource ? loadImage(photoSource).catch(() => null) : null,
    ...sources.map((source) => loadImage(source).catch(() => null)),
  ])

  const loaded = new Map<string, HTMLImageElement>()
  sources.forEach((source, index) => {
    const image = screens[index]
    if (image) loaded.set(source, image)
  })
  return { sans, mono, photo: photo ?? null, screens: loaded }
}

function drawBackground(context: CanvasRenderingContext2D, spec: BannerSpec, assets: Assets) {
  const { width, height } = spec
  const background = bannerBackgrounds[spec.background]

  if (background.kind === "gradient") {
    // CSS's `linear-gradient(145deg, …)`, the App Store creative's backdrop: the gradient line runs
    // through the centre at that angle and is exactly long enough to reach both far corners.
    const angle = (145 * Math.PI) / 180
    const dx = Math.sin(angle)
    const dy = -Math.cos(angle)
    const half = (Math.abs(width * dx) + Math.abs(height * dy)) / 2
    const gradient = context.createLinearGradient(
      width / 2 - dx * half,
      height / 2 - dy * half,
      width / 2 + dx * half,
      height / 2 + dy * half,
    )
    gradient.addColorStop(0, background.colors[0])
    gradient.addColorStop(1, background.colors[1])
    context.fillStyle = gradient
    context.fillRect(0, 0, width, height)

    // The creative's accent glow in the top-right corner, feathered: at a banner's height the hard
    // disc the template draws would read as a shape rather than as light.
    const radius = Math.max(width, height) * 0.4
    const glow = context.createRadialGradient(width, 0, 0, width, 0, radius)
    glow.addColorStop(0, background.accent)
    glow.addColorStop(1, "transparent")
    context.save()
    context.globalAlpha = 0.28
    context.fillStyle = glow
    context.fillRect(0, 0, width, height)
    context.restore()
    return
  }

  context.fillStyle = background.color
  context.fillRect(0, 0, width, height)
  if (background.kind !== "photo" || !assets.photo) return

  // The area the photograph covers: the whole canvas, or its right side, leaving the left to the words.
  const area =
    spec.photoArea === "right"
      ? { x: width * 0.38, y: 0, width: width * 0.62, height }
      : { x: 0, y: 0, width, height }
  const image = assets.photo
  const factor = Math.max(area.width / image.naturalWidth, area.height / image.naturalHeight)
  const drawWidth = image.naturalWidth * factor
  const drawHeight = image.naturalHeight * factor
  context.save()
  context.beginPath()
  context.rect(area.x, area.y, area.width, area.height)
  context.clip()
  // The analog treatment's photograph: faint over near-black, so the words and devices stay legible.
  context.globalAlpha = spec.photoOpacity / 100
  context.drawImage(
    image,
    area.x + (area.width - drawWidth) * (spec.focusX / 100),
    area.y + (area.height - drawHeight) * (spec.focusY / 100),
    drawWidth,
    drawHeight,
  )
  context.restore()

  if (spec.photoArea === "right") {
    // The photograph's left edge dissolves into the ground, so there is no seam where it starts.
    const fade = context.createLinearGradient(area.x, 0, area.x + area.width * 0.55, 0)
    fade.addColorStop(0, background.color)
    fade.addColorStop(1, "rgba(5,5,5,0)")
    context.fillStyle = fade
    context.fillRect(area.x, 0, area.width * 0.55, height)
    return
  }

  if (spec.title.visible || spec.tagline.visible || spec.badge.visible) {
    const scrim = context.createLinearGradient(0, 0, width, 0)
    scrim.addColorStop(0, "rgba(2,2,2,0.72)")
    scrim.addColorStop(0.46, "rgba(2,2,2,0.48)")
    scrim.addColorStop(0.82, "rgba(2,2,2,0.08)")
    scrim.addColorStop(1, "rgba(2,2,2,0)")
    context.fillStyle = scrim
    context.fillRect(0, 0, width, height)
  }
}

/// The axis-aligned box around a rectangle rotated about its centre.
function rotatedBox(x: number, y: number, width: number, height: number, degrees: number): Box {
  const radians = (degrees * Math.PI) / 180
  const cos = Math.abs(Math.cos(radians))
  const sin = Math.abs(Math.sin(radians))
  const boxWidth = width * cos + height * sin
  const boxHeight = width * sin + height * cos
  return { x: x + (width - boxWidth) / 2, y: y + (height - boxHeight) / 2, width: boxWidth, height: boxHeight }
}

function drawDevice(
  context: CanvasRenderingContext2D,
  device: BannerDevice,
  image: HTMLImageElement | undefined,
  pixelScale: number,
): Box {
  const geometry = bannerDeviceGeometry[device.kind]
  const width = deviceWidth(device)
  const height = device.height
  const unit = height / (geometry.screen.height + (device.frame ? geometry.border * 2 : 0))
  const border = device.frame ? geometry.border * unit : 0
  const screen = { x: border, y: border, width: width - border * 2, height: height - border * 2 }

  context.save()
  context.translate(device.x + width / 2, device.y + height / 2)
  context.rotate((device.rotation * Math.PI) / 180)
  context.translate(-width / 2, -height / 2)

  if (device.shadow) {
    // The screenshot template's `0 42px 100px rgba(0,0,0,0.38)`, in the frame's own units. Shadow
    // offsets ignore the transform, so they are scaled to the export by hand.
    context.shadowColor = "rgba(0,0,0,0.38)"
    context.shadowOffsetY = 42 * unit * pixelScale
    context.shadowBlur = 100 * unit * pixelScale
  }
  context.fillStyle = device.frame ? "#0A0A0D" : "#000000"
  context.beginPath()
  context.roundRect(0, 0, width, height, (device.frame ? geometry.radius : geometry.screen.radius) * unit)
  context.fill()
  context.shadowColor = "transparent"

  context.save()
  context.beginPath()
  context.roundRect(screen.x, screen.y, screen.width, screen.height, geometry.screen.radius * unit)
  context.clip()
  // Stretched to the screen, as the template does — the captures are taken at the frame's ratio.
  if (image) context.drawImage(image, screen.x, screen.y, screen.width, screen.height)
  context.restore()

  if (geometry.island) {
    const island = {
      width: geometry.island.width * unit,
      height: geometry.island.height * unit,
      top: geometry.island.top * unit,
    }
    context.fillStyle = "#000000"
    context.strokeStyle = "rgba(255,255,255,0.12)"
    context.lineWidth = Math.max(0.5, unit * 2)
    context.beginPath()
    context.roundRect(
      screen.x + (screen.width - island.width) / 2,
      screen.y + island.top,
      island.width,
      island.height,
      island.height / 2,
    )
    context.fill()
    context.stroke()
  }
  context.restore()

  return rotatedBox(device.x, device.y, width, height, device.rotation)
}

function drawText(
  context: CanvasRenderingContext2D,
  text: string,
  options: { x: number; y: number; size: number; weight: number; family: string; color: string; tracking: number },
): Box {
  const rows = text.split("\n")
  context.save()
  context.font = `${options.weight} ${options.size}px ${options.family}`
  context.letterSpacing = `${(options.tracking * options.size).toFixed(2)}px`
  context.fillStyle = options.color
  context.textBaseline = "middle"
  const row = options.size * lineHeight
  let width = 0
  rows.forEach((line, index) => {
    context.fillText(line, options.x, options.y + row * index + row / 2)
    width = Math.max(width, context.measureText(line).width)
  })
  context.restore()
  return { x: options.x, y: options.y, width, height: row * rows.length }
}

/** Draws the whole banner in canvas pixels — the caller scales the context for a sharper export. */
function drawBanner(context: CanvasRenderingContext2D, spec: BannerSpec, assets: Assets, pixelScale: number): Layout {
  const layout: Layout = {}
  const background = bannerBackgrounds[spec.background]

  drawBackground(context, spec, assets)

  for (const device of spec.devices) {
    layout[device.id] = drawDevice(context, device, assets.screens.get(screenshotSource(device)), pixelScale)
  }

  if (spec.logo.visible) {
    const { x, y, size } = spec.logo
    // The tile takes the text colour and the glyph the ground, so the mark inverts on paper.
    const glyph = background.kind === "solid" ? background.color : designTokens.brand.glyph
    drawMark(context, x, y, size, background.text, glyph)
    layout.logo = { x, y, width: size, height: size }
  }

  if (spec.title.visible && spec.title.text.trim()) {
    layout.title = drawText(context, spec.title.text, {
      ...spec.title,
      weight: 400,
      family: assets.mono,
      color: background.text,
      tracking: -0.035,
    })
  }

  if (spec.badge.visible && spec.badge.text.trim()) {
    layout.badge = drawBadge(context, badgeSegments(spec.badge.text), {
      ...spec.badge,
      family: assets.mono,
      color: background.text,
    })
  }

  if (spec.tagline.visible && spec.tagline.text.trim()) {
    layout.tagline = drawText(context, spec.tagline.text, {
      ...spec.tagline,
      family: assets.sans,
      color: spec.tagline.muted ? background.muted : background.text,
      tracking: -0.02,
    })
  }

  return layout
}

function renderToCanvas(canvas: HTMLCanvasElement, spec: BannerSpec, assets: Assets, pixelScale: number): Layout {
  canvas.width = Math.round(spec.width * pixelScale)
  canvas.height = Math.round(spec.height * pixelScale)
  const context = canvas.getContext("2d")
  if (!context) return {}
  context.scale(pixelScale, pixelScale)
  return drawBanner(context, spec, assets, pixelScale)
}

function isElement(id: string): id is BannerElementId {
  return id === "logo" || id === "title" || id === "badge" || id === "tagline"
}

function readStoredSpec(): BannerSpec | null {
  try {
    const stored = window.localStorage.getItem(storageKey)
    return stored ? restoreBannerSpec(JSON.parse(stored)) : null
  } catch {
    return null
  }
}

/**
 * A `release` definition handed over in `?config=`, encoded the way the social editor's share links
 * are: base64 of the URI-encoded Markdown. The release log in the admin console links here this way.
 */
function readLinkedSpec(): { spec: BannerSpec } | { error: string } | null {
  const encoded = new URLSearchParams(window.location.search).get("config")
  if (!encoded) return null
  try {
    // A "+" left unescaped in the link arrives as a space; base64 never contains one.
    return { spec: specFromReleaseDefinition(decodeURIComponent(atob(encoded.replaceAll(" ", "+")))) }
  } catch (error) {
    return { error: error instanceof Error ? error.message : bannerCopy.importErrors.frontmatter }
  }
}

function writeStoredSpec(spec: BannerSpec) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(spec))
  } catch {
    // Private windows and blocked storage only cost the remembered layout.
  }
}

function elementName(spec: BannerSpec, id: string): string {
  if (isElement(id)) return bannerCopy.elements[id]
  const index = spec.devices.findIndex((device) => device.id === id)
  const device = spec.devices[index]
  return device ? bannerCopy.devices.label(bannerCopy.devices.kinds[device.kind], index + 1) : id
}

function subscribeToNothing() {
  return () => {}
}

/**
 * The builder, once it is running in a browser. The stored layout is only readable there, so the
 * server renders nothing rather than a default layout the restored one would immediately replace.
 */
export function BannerBuilder() {
  const inBrowser = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  )
  return inBrowser ? <BannerEditor /> : <div className="min-h-[60vh]" />
}

function BannerEditor() {
  const [linked] = useState(readLinkedSpec)
  const [spec, setSpec] = useState<BannerSpec>(
    () => (linked && "spec" in linked ? linked.spec : null) ?? readStoredSpec() ?? defaultBannerSpec,
  )
  const [notice, setNotice] = useState<{ tone: "info" | "error"; text: string } | null>(() =>
    linked ? ("spec" in linked ? { tone: "info", text: bannerCopy.importNotice.opened } : { tone: "error", text: linked.error }) : null,
  )
  const [layout, setLayout] = useState<Layout>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [scaleLayout, setScaleLayout] = useState(true)
  const [exportScale, setExportScale] = useState<number>(2)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<Drag | null>(null)

  useEffect(() => writeStoredSpec(spec), [spec])

  // The link has done its job once the layout is open; a reload should keep the edits, not reapply it.
  useEffect(() => {
    if (!linked) return
    const url = new URL(window.location.href)
    url.searchParams.delete("config")
    window.history.replaceState(window.history.state, "", url)
  }, [linked])

  // Paste a release config anywhere outside a field to lay it onto the release-notes card.
  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const target = event.target
      if (target instanceof HTMLElement && (target.matches("input, textarea, select") || target.isContentEditable)) return
      const source = event.clipboardData?.getData("text/plain") ?? ""
      if (!looksLikeReleaseDefinition(source)) return
      event.preventDefault()
      try {
        setSpec(specFromReleaseDefinition(source))
        setSelected(null)
        setNotice({ tone: "info", text: bannerCopy.importNotice.pasted })
      } catch (error) {
        setNotice({ tone: "error", text: error instanceof Error ? error.message : bannerCopy.importErrors.frontmatter })
      }
    }
    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [])

  useEffect(() => {
    let current = true
    loadAssets(spec).then((assets) => {
      const canvas = canvasRef.current
      if (!current || !canvas) return
      // Twice the canvas on a high-density screen, capped so a large banner stays quick to redraw.
      const density = window.devicePixelRatio > 1 && spec.width * 2 <= 4000 ? 2 : 1
      setLayout(renderToCanvas(canvas, spec, assets, density))
    })
    return () => {
      current = false
    }
  }, [spec])

  function update(change: (spec: BannerSpec) => BannerSpec) {
    setSpec((previous) => change(previous))
  }

  function updateDevice(id: string, change: Partial<BannerDevice>) {
    update((previous) => ({
      ...previous,
      devices: previous.devices.map((device) => (device.id === id ? { ...device, ...change } : device)),
    }))
  }

  function position(id: string): { x: number; y: number } | null {
    if (isElement(id)) return spec[id]
    return spec.devices.find((device) => device.id === id) ?? null
  }

  function move(id: string, x: number, y: number) {
    if (isElement(id)) {
      update((previous) => ({ ...previous, [id]: { ...previous[id], x, y } }))
    } else {
      updateDevice(id, { x, y })
    }
  }

  /// Centres an element on one axis by its drawn size; a device by its unrotated frame, since it
  /// rotates about its own centre.
  function center(id: string, axis: "x" | "y") {
    const current = position(id)
    if (!current) return
    const device = spec.devices.find((entry) => entry.id === id)
    const box = layout[id]
    const size = device
      ? axis === "x"
        ? deviceWidth(device)
        : device.height
      : axis === "x"
        ? box?.width
        : box?.height
    if (size === undefined) return
    const value = Math.round(((axis === "x" ? spec.width : spec.height) - size) / 2)
    move(id, axis === "x" ? value : current.x, axis === "y" ? value : current.y)
  }

  function moveDevice(id: string, offset: -1 | 1) {
    update((previous) => {
      const index = previous.devices.findIndex((device) => device.id === id)
      const target = index + offset
      if (index < 0 || target < 0 || target >= previous.devices.length) return previous
      const devices = [...previous.devices]
      const [device] = devices.splice(index, 1)
      if (device) devices.splice(target, 0, device)
      return { ...previous, devices }
    })
  }

  function resize(width: number, height: number) {
    update((previous) => resizeBanner(previous, width, height, scaleLayout))
  }

  function startDrag(event: PointerEvent<HTMLButtonElement>, id: string) {
    const current = position(id)
    const overlay = overlayRef.current
    if (!current || !overlay) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setSelected(id)
    dragRef.current = {
      id,
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: current.x,
      startY: current.y,
      unit: spec.width / overlay.getBoundingClientRect().width,
    }
  }

  function continueDrag(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    if (!drag) return
    move(
      drag.id,
      Math.round(drag.startX + (event.clientX - drag.pointerX) * drag.unit),
      Math.round(drag.startY + (event.clientY - drag.pointerY) * drag.unit),
    )
  }

  function endDrag() {
    dragRef.current = null
  }

  function nudge(event: KeyboardEvent<HTMLButtonElement>, id: string) {
    const steps: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }
    const step = steps[event.key]
    const current = position(id)
    if (!step || !current) return
    event.preventDefault()
    const distance = event.shiftKey ? 10 : 1
    move(id, current.x + step[0] * distance, current.y + step[1] * distance)
  }

  async function download() {
    const assets = await loadAssets(spec)
    const canvas = document.createElement("canvas")
    renderToCanvas(canvas, spec, assets, exportScale)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
    if (!blob) return
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = bannerCopy.export.filename(spec.width, spec.height, exportScale)
    link.click()
    URL.revokeObjectURL(link.href)
  }

  /// Hands the words and the photograph to the social editor, in a new tab so this layout stays open.
  /// The editor reads a definition from `?config=` the way its own share links write one.
  function openInSocialEditor() {
    const markdown = releaseDefinition(spec, new Date().toISOString().slice(0, 10))
    window.open(`/social/editor?config=${btoa(encodeURIComponent(markdown))}`, "_blank", "noopener")
  }

  function reset() {
    setSpec(defaultBannerSpec)
    setSelected(null)
  }

  function applyTemplate(template: BannerSpec) {
    setSpec(template)
    setSelected(null)
  }

  // In drawing order, back to front: a later handle stacks above an earlier one, so a click lands on
  // whatever is drawn on top, and Tab walks the layers the way they are painted.
  const handles = [
    ...spec.devices.map((device) => device.id),
    ...(["logo", "title", "badge", "tagline"] as const).filter((id) => spec[id].visible),
  ]

  return (
    <div className="flex flex-col gap-8">
      <section className="sticky top-0 z-10 -mx-6 border-b border-border bg-background/95 px-6 py-4 backdrop-blur">
        <div
          className="relative mx-auto max-w-full"
          style={{ aspectRatio: `${spec.width} / ${spec.height}`, width: `min(100%, calc(42vh * ${spec.width / spec.height}))` }}
        >
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={bannerCopy.previewLabel(spec.width, spec.height)}
            className="absolute inset-0 size-full rounded-sm shadow-sm ring-1 ring-border"
          />
          <div ref={overlayRef} className="absolute inset-0 overflow-hidden">
            {handles.map((id) => {
              const box = layout[id]
              if (!box) return null
              const isSelected = selected === id
              return (
                <button
                  key={id}
                  type="button"
                  aria-label={bannerCopy.handleLabel(elementName(spec, id))}
                  aria-pressed={isSelected}
                  onPointerDown={(event) => startDrag(event, id)}
                  onPointerMove={continueDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onKeyDown={(event) => nudge(event, id)}
                  onFocus={() => setSelected(id)}
                  className={cn(
                    "absolute cursor-move touch-none rounded-[2px] outline-offset-0 transition-[outline-color] hover:outline hover:outline-1 hover:outline-sky-400/80 focus-visible:outline-2 focus-visible:outline-sky-400",
                    isSelected && "outline outline-2 outline-dashed outline-sky-400",
                  )}
                  style={{
                    left: `${(box.x / spec.width) * 100}%`,
                    top: `${(box.y / spec.height) * 100}%`,
                    width: `${(box.width / spec.width) * 100}%`,
                    height: `${(box.height / spec.height) * 100}%`,
                  }}
                />
              )
            })}
          </div>
        </div>

        <div className="mx-auto mt-4 flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {bannerCopy.previewMeta(spec.width, spec.height)}
            {selected ? ` · ${elementName(spec, selected)}` : null}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="radiogroup"
              aria-label={bannerCopy.export.scale}
              className="flex items-center gap-1 rounded-full border border-border p-1"
            >
              {bannerLimits.exportScales.map((scale) => (
                <button
                  key={scale}
                  type="button"
                  role="radio"
                  aria-checked={exportScale === scale}
                  onClick={() => setExportScale(scale)}
                  className={cn(
                    "rounded-full px-3 py-1 font-mono text-xs transition-colors",
                    exportScale === scale
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {bannerCopy.export.scaleOption(scale)}
                </button>
              ))}
            </div>
            <Button variant="outline" title={bannerCopy.export.openInSocialEditorHint} onClick={openInSocialEditor}>
              <ExternalLink aria-hidden="true" />
              {bannerCopy.export.openInSocialEditor}
            </Button>
            <Button variant="outline" onClick={reset}>
              <RotateCcw aria-hidden="true" />
              {bannerCopy.export.reset}
            </Button>
            <Button onClick={download}>
              <Download aria-hidden="true" />
              {bannerCopy.export.download}
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Panel title={bannerCopy.templates.title}>
          <div className="flex flex-wrap gap-2" role="group" aria-label={bannerCopy.templates.title}>
            {bannerTemplates.map((template) => (
              <Button key={template.id} variant="outline" size="sm" onClick={() => applyTemplate(template.spec)}>
                {bannerCopy.templates.options[template.id]}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{bannerCopy.templates.hint}</p>
          {notice ? (
            <p role="status" className={cn("text-xs", notice.tone === "error" ? "text-destructive" : "text-muted-foreground")}>
              {notice.text}
            </p>
          ) : null}
        </Panel>

        <Panel title={bannerCopy.canvas.title}>
          <div className="flex flex-wrap gap-2" role="group" aria-label={bannerCopy.canvas.presets}>
            {bannerPresets.map((preset) => {
              const active = preset.width === spec.width && preset.height === spec.height
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => resize(preset.width, preset.height)}
                  className={cn(
                    "rounded-full border border-border px-3 py-1 text-xs transition-colors",
                    active ? "bg-foreground text-background" : "hover:bg-muted",
                  )}
                >
                  {bannerCopy.canvas.presetLabels[preset.id]}
                </button>
              )
            })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={bannerCopy.canvas.width}
              value={spec.width}
              min={bannerLimits.minimumSize}
              max={bannerLimits.maximumSize}
              commitOnBlur
              onChange={(width) => resize(width, spec.height)}
            />
            <NumberField
              label={bannerCopy.canvas.height}
              value={spec.height}
              min={bannerLimits.minimumSize}
              max={bannerLimits.maximumSize}
              commitOnBlur
              onChange={(height) => resize(spec.width, height)}
            />
          </div>
          <Checkbox label={bannerCopy.canvas.scaleLayout} checked={scaleLayout} onChange={setScaleLayout} />
        </Panel>

        <Panel title={bannerCopy.background.title}>
          <Select
            label={bannerCopy.background.title}
            value={spec.background}
            options={entries(bannerCopy.background.options)}
            onChange={(background) => update((previous) => ({ ...previous, background }))}
          />
          {spec.background === "photo" ? (
            <>
              <Select
                label={bannerCopy.background.photo}
                value={spec.customPhoto ? "custom" : spec.photo}
                options={[
                  ...(spec.customPhoto ? [["custom", bannerCopy.background.custom] as const] : []),
                  ...photographs.map((photo) => [photo.file, visualAssetCopy.photographs[photo.file]] as const),
                ]}
                onChange={(photo) => update((previous) => photo === "custom"
                  ? previous
                  : { ...previous, photo, customPhoto: undefined })}
              />
              <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                {bannerCopy.background.upload}
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-foreground file:mr-3 file:rounded-lg file:border file:border-border file:bg-background file:px-3 file:py-2 file:text-sm file:font-medium"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    if (!file.type.startsWith("image/")) {
                      setNotice({ tone: "error", text: bannerCopy.background.invalidImage })
                      event.target.value = ""
                      return
                    }
                    const reader = new FileReader()
                    reader.onload = () => {
                      if (typeof reader.result !== "string") return
                      update((previous) => ({ ...previous, customPhoto: reader.result as string }))
                      setNotice({ tone: "info", text: bannerCopy.background.uploaded })
                    }
                    reader.onerror = () => setNotice({ tone: "error", text: bannerCopy.background.invalidImage })
                    reader.readAsDataURL(file)
                  }}
                />
                <span>{bannerCopy.background.uploadHint}</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label={bannerCopy.background.area}
                  value={spec.photoArea}
                  options={entries(bannerCopy.background.areas)}
                  onChange={(photoArea) => update((previous) => ({ ...previous, photoArea }))}
                />
                <NumberField
                  label={bannerCopy.background.opacity}
                  value={spec.photoOpacity}
                  min={0}
                  max={100}
                  onChange={(photoOpacity) => update((previous) => ({ ...previous, photoOpacity }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label={bannerCopy.background.focusX}
                  value={spec.focusX}
                  min={0}
                  max={100}
                  onChange={(focusX) => update((previous) => ({ ...previous, focusX }))}
                />
                <NumberField
                  label={bannerCopy.background.focusY}
                  value={spec.focusY}
                  min={0}
                  max={100}
                  onChange={(focusY) => update((previous) => ({ ...previous, focusY }))}
                />
              </div>
            </>
          ) : null}
        </Panel>

        <Panel title={bannerCopy.elements.logo} selected={selected === "logo"} onSelect={() => setSelected("logo")}>
          <Checkbox
            label={bannerCopy.fields.show}
            checked={spec.logo.visible}
            onChange={(visible) => update((previous) => ({ ...previous, logo: { ...previous.logo, visible } }))}
          />
          <PlacementFields
            id="logo"
            x={spec.logo.x}
            y={spec.logo.y}
            onMove={move}
            onCenter={center}
            size={{ label: bannerCopy.fields.size, value: spec.logo.size }}
            onSize={(size) => update((previous) => ({ ...previous, logo: { ...previous.logo, size } }))}
          />
        </Panel>

        <Panel title={bannerCopy.elements.title} selected={selected === "title"} onSelect={() => setSelected("title")}>
          <Checkbox
            label={bannerCopy.fields.show}
            checked={spec.title.visible}
            onChange={(visible) => update((previous) => ({ ...previous, title: { ...previous.title, visible } }))}
          />
          <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            {bannerCopy.fields.text}
            <input
              className={inputClass}
              value={spec.title.text}
              onChange={(event) => {
                const text = event.target.value
                update((previous) => ({ ...previous, title: { ...previous.title, text } }))
              }}
            />
          </label>
          <PlacementFields
            id="title"
            x={spec.title.x}
            y={spec.title.y}
            onMove={move}
            onCenter={center}
            size={{ label: bannerCopy.fields.fontSize, value: spec.title.size }}
            onSize={(size) => update((previous) => ({ ...previous, title: { ...previous.title, size } }))}
          />
        </Panel>

        <Panel title={bannerCopy.elements.badge} selected={selected === "badge"} onSelect={() => setSelected("badge")}>
          <Checkbox
            label={bannerCopy.fields.show}
            checked={spec.badge.visible}
            onChange={(visible) => update((previous) => ({ ...previous, badge: { ...previous.badge, visible } }))}
          />
          <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            {bannerCopy.fields.text}
            <input
              className={inputClass}
              value={spec.badge.text}
              onChange={(event) => {
                const text = event.target.value
                update((previous) => ({ ...previous, badge: { ...previous.badge, text } }))
              }}
            />
            <span>{bannerCopy.fields.badgeHint}</span>
          </label>
          <PlacementFields
            id="badge"
            x={spec.badge.x}
            y={spec.badge.y}
            onMove={move}
            onCenter={center}
            size={{ label: bannerCopy.fields.fontSize, value: spec.badge.size }}
            onSize={(size) => update((previous) => ({ ...previous, badge: { ...previous.badge, size } }))}
          />
        </Panel>

        <Panel
          title={bannerCopy.elements.tagline}
          selected={selected === "tagline"}
          onSelect={() => setSelected("tagline")}
        >
          <Checkbox
            label={bannerCopy.fields.show}
            checked={spec.tagline.visible}
            onChange={(visible) => update((previous) => ({ ...previous, tagline: { ...previous.tagline, visible } }))}
          />
          <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            {bannerCopy.fields.text}
            <textarea
              rows={3}
              className={cn(inputClass, "resize-y")}
              value={spec.tagline.text}
              onChange={(event) => {
                const text = event.target.value
                update((previous) => ({ ...previous, tagline: { ...previous.tagline, text } }))
              }}
            />
            <span>{bannerCopy.fields.textHint}</span>
          </label>
          <PlacementFields
            id="tagline"
            x={spec.tagline.x}
            y={spec.tagline.y}
            onMove={move}
            onCenter={center}
            size={{ label: bannerCopy.fields.fontSize, value: spec.tagline.size }}
            onSize={(size) => update((previous) => ({ ...previous, tagline: { ...previous.tagline, size } }))}
          />
          <div className="grid grid-cols-2 items-end gap-3">
            <Select
              label={bannerCopy.fields.weight}
              value={String(spec.tagline.weight)}
              options={bannerWeights.map((weight) => [String(weight), bannerCopy.fields.weights[weight]] as const)}
              onChange={(value) => {
                const weight = bannerWeights.find((candidate) => String(candidate) === value)
                if (weight) update((previous) => ({ ...previous, tagline: { ...previous.tagline, weight } }))
              }}
            />
            <Checkbox
              label={bannerCopy.fields.muted}
              checked={spec.tagline.muted}
              onChange={(muted) => update((previous) => ({ ...previous, tagline: { ...previous.tagline, muted } }))}
            />
          </div>
        </Panel>
      </div>

      <section className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <h2 className="text-xl font-semibold tracking-tight">{bannerCopy.devices.title}</h2>
          <div className="flex gap-2">
            {(["iphone", "ipad"] as const satisfies readonly BannerDeviceKind[]).map((kind) => (
              <Button
                key={kind}
                variant="outline"
                onClick={() => {
                  const device = newDevice(kind, spec)
                  update((previous) => ({ ...previous, devices: [...previous.devices, device] }))
                  setSelected(device.id)
                }}
              >
                <Plus aria-hidden="true" />
                {bannerCopy.devices.add(bannerCopy.devices.kinds[kind])}
              </Button>
            ))}
          </div>
        </div>

        {spec.devices.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">{bannerCopy.devices.empty}</p>
        ) : (
          <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {spec.devices.map((device, index) => (
              <li key={device.id}>
                <Panel
                  title={elementName(spec, device.id)}
                  selected={selected === device.id}
                  onSelect={() => setSelected(device.id)}
                  actions={
                    <>
                      <IconButton
                        label={bannerCopy.devices.backward}
                        disabled={index === 0}
                        onClick={() => moveDevice(device.id, -1)}
                      >
                        <ArrowDown aria-hidden="true" />
                      </IconButton>
                      <IconButton
                        label={bannerCopy.devices.forward}
                        disabled={index === spec.devices.length - 1}
                        onClick={() => moveDevice(device.id, 1)}
                      >
                        <ArrowUp aria-hidden="true" />
                      </IconButton>
                      <IconButton
                        label={bannerCopy.devices.remove}
                        onClick={() =>
                          update((previous) => ({
                            ...previous,
                            devices: previous.devices.filter((entry) => entry.id !== device.id),
                          }))
                        }
                      >
                        <Trash2 aria-hidden="true" />
                      </IconButton>
                    </>
                  }
                >
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label={bannerCopy.devices.kind}
                      value={device.kind}
                      options={entries(bannerCopy.devices.kinds)}
                      onChange={(kind) => updateDevice(device.id, { kind })}
                    />
                    <Select
                      label={bannerCopy.devices.frame}
                      value={device.frame ? "framed" : "bare"}
                      options={entries(bannerCopy.devices.frameOptions)}
                      onChange={(frame) => updateDevice(device.id, { frame: frame === "framed" })}
                    />
                    <Select
                      label={bannerCopy.devices.screenshot}
                      value={device.screenshot}
                      options={appScreenshots.map((file) => [file, visualAssetCopy.screenshots[file]] as const)}
                      onChange={(screenshot) => updateDevice(device.id, { screenshot })}
                    />
                    <Select
                      label={bannerCopy.devices.appearance}
                      value={device.appearance}
                      options={entries(bannerCopy.devices.appearances)}
                      onChange={(appearance) => updateDevice(device.id, { appearance })}
                    />
                  </div>
                  <PlacementFields
                    id={device.id}
                    x={device.x}
                    y={device.y}
                    onMove={move}
                    onCenter={center}
                    size={{ label: bannerCopy.fields.height, value: device.height }}
                    onSize={(height) => updateDevice(device.id, { height })}
                  />
                  <div className="grid grid-cols-2 items-end gap-3">
                    <NumberField
                      label={bannerCopy.fields.rotation}
                      value={device.rotation}
                      min={-180}
                      max={180}
                      onChange={(rotation) => updateDevice(device.id, { rotation })}
                    />
                    <Checkbox
                      label={bannerCopy.devices.shadow}
                      checked={device.shadow}
                      onChange={(shadow) => updateDevice(device.id, { shadow })}
                    />
                  </div>
                </Panel>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

type PanelProps = {
  title: string
  children: ReactNode
  selected?: boolean
  onSelect?: () => void
  actions?: ReactNode
}

function Panel({ title, children, selected = false, onSelect, actions }: PanelProps) {
  return (
    <fieldset
      onFocusCapture={onSelect}
      className={cn(
        "flex h-full min-w-0 flex-col gap-4 rounded-xl border border-border p-5 transition-colors",
        selected && "border-sky-400/70 ring-1 ring-sky-400/40",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <legend className="contents">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{title}</span>
        </legend>
        {actions ? <div className="flex gap-1">{actions}</div> : null}
      </div>
      {children}
    </fieldset>
  )
}

type PlacementFieldsProps = {
  id: string
  x: number
  y: number
  onMove: (id: string, x: number, y: number) => void
  onCenter: (id: string, axis: "x" | "y") => void
  size: { label: string; value: number }
  onSize: (value: number) => void
}

function PlacementFields({ id, x, y, onMove, onCenter, size, onSize }: PlacementFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <NumberField label={bannerCopy.fields.x} value={x} onChange={(value) => onMove(id, value, y)} />
        <NumberField label={bannerCopy.fields.y} value={y} onChange={(value) => onMove(id, x, value)} />
        <NumberField label={size.label} value={size.value} min={1} onChange={(value) => onSize(Math.max(1, value))} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => onCenter(id, "x")}>
          {bannerCopy.fields.centerHorizontally}
        </Button>
        <Button variant="outline" size="sm" onClick={() => onCenter(id, "y")}>
          {bannerCopy.fields.centerVertically}
        </Button>
      </div>
    </>
  )
}

type NumberFieldProps = {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  /// Applies the value on blur or Enter instead of per keystroke — for the canvas size, where every
  /// intermediate value ("1", "10", "107") would rescale the layout.
  commitOnBlur?: boolean
}

function NumberField({ label, value, onChange, min, max, commitOnBlur = false }: NumberFieldProps) {
  // The text being typed, while it is not yet a number ("-", "") or not yet committed.
  const [draft, setDraft] = useState<string | null>(null)

  function commit(text: string) {
    const parsed = Number(text)
    if (text.trim() === "" || !Number.isFinite(parsed)) return
    const clamped = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, parsed))
    if (clamped !== value) onChange(clamped)
  }

  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs text-muted-foreground">
      {label}
      <input
        type="number"
        inputMode="numeric"
        className={cn(inputClass, "font-mono tabular-nums")}
        value={draft ?? String(value)}
        min={min}
        max={max}
        onChange={(event) => {
          setDraft(event.target.value)
          if (!commitOnBlur) commit(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && draft !== null) {
            commit(draft)
            setDraft(null)
          }
        }}
        onBlur={() => {
          if (draft !== null && commitOnBlur) commit(draft)
          setDraft(null)
        }}
      />
    </label>
  )
}

/// `Object.entries` with the keys kept, for a copy map whose keys are the option values.
function entries<Key extends string>(record: Record<Key, string>): [Key, string][] {
  return Object.entries(record) as [Key, string][]
}

type SelectProps<Value extends string> = {
  label: string
  value: Value
  options: readonly (readonly [Value, string])[]
  onChange: (value: Value) => void
}

function Select<Value extends string>({ label, value, options, onChange }: SelectProps<Value>) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs text-muted-foreground">
      {label}
      <select className={inputClass} value={value} onChange={(event) => {
          const option = options.find(([candidate]) => candidate === event.target.value)
          if (option) onChange(option[0])
        }}>
        {options.map(([option, optionLabel]) => (
          <option key={option} value={option}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  )
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        className="size-4 accent-foreground"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  )
}

type IconButtonProps = { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }

function IconButton({ label, onClick, disabled = false, children }: IconButtonProps) {
  return (
    <Button variant="ghost" size="icon-sm" aria-label={label} title={label} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  )
}
