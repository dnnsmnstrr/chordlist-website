"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Check, Copy, Download, ImagePlus, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"

type FormatName = "card" | "post" | "story"
type TemplateName = "statement" | "progression" | "quote" | "screenshot" | "photo"
type ThemeName = "ink" | "paper" | "blueprint"

type EditorConfig = {
  slug: string
  template: TemplateName
  theme: ThemeName
  formats: FormatName[]
  eyebrow: string
  headline: string
  footnote: string
  chords: string
  numerals: string
  attribution: string
  screenshot: string
  photo: string
  focusX: number
  focusY: number
  alt: string
  caption: string
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

const screenshots = [
  "01-Song-List---4-Chord-Library.png",
  "02-Song-Detail---Matching-Suggestions.png",
  "03-Creation-Flow---New-Song.png",
  "04-Search---Piano-Results.png",
  "05-Tag-Filter---Piano.png",
] as const

const initialConfig: EditorConfig = {
  slug: "files-in-your-pocket",
  template: "statement",
  theme: "ink",
  formats: ["card", "post"],
  eyebrow: "Feature",
  headline: "Your lyrics and chords,\nas files in your pocket.",
  footnote: "chordlist.app",
  chords: "C G Am F",
  numerals: "I · V · vi · IV",
  attribution: "Why plain-text songbooks last",
  screenshot: screenshots[1],
  photo: photos[0].name,
  focusX: 60,
  focusY: 50,
  alt: "A chordlist social card reading “Your lyrics and chords, as files in your pocket.”",
  caption: "Your songbook should feel like yours. chordlist keeps lyrics and chords in plain Markdown files you control.",
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
) {
  const factor = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const drawWidth = image.naturalWidth * factor
  const drawHeight = image.naturalHeight * factor
  const x = (width - drawWidth) * (focusX / 100)
  const y = (height - drawHeight) * (focusY / 100)
  context.drawImage(image, x, y, drawWidth, drawHeight)
}

async function renderPost(
  canvas: HTMLCanvasElement,
  config: EditorConfig,
  formatName: FormatName,
  photoSrc: string,
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

  if (config.template === "photo" && photoSrc) {
    const image = await loadImage(photoSrc)
    drawCover(context, image, format.width, format.height, config.focusX, config.focusY)
    const gradient = context.createLinearGradient(0, 0, 0, format.height)
    gradient.addColorStop(0, "rgba(10,10,10,.88)")
    gradient.addColorStop(0.38, "rgba(10,10,10,.55)")
    gradient.addColorStop(0.62, "rgba(10,10,10,.62)")
    gradient.addColorStop(1, "rgba(10,10,10,.92)")
    context.fillStyle = gradient
    context.fillRect(0, 0, format.width, format.height)
  }

  const activeTheme = config.template === "photo" ? themes.ink : theme
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
    context.fillText(
      config.eyebrow.trim(),
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

  if (config.template === "screenshot") {
    const image = await loadImage(`/app-screenshots/dark/${config.screenshot}`)
    const sideBySide = innerWidth > bodyHeight
    if (sideBySide) {
      const shotHeight = bodyHeight
      const shotWidth = (image.naturalWidth / image.naturalHeight) * shotHeight
      const copyWidth = innerWidth - shotWidth - 60 * scale
      const size = fitFont(context, headline, 52 * scale, copyWidth, 700, sans)
      const copyHeight = headline.length * size * 1.18
      drawTextLines(context, headline, padding, bodyTop + (bodyHeight - copyHeight) / 2, size, 1.18, activeTheme.text, 700, sans)
      context.drawImage(image, format.width - padding - shotWidth, bodyTop, shotWidth, shotHeight)
    } else {
      const copySize = fitFont(context, headline, 52 * scale, innerWidth, 700, sans)
      const copyHeight = headline.length * copySize * 1.18
      drawTextLines(context, headline, padding, bodyTop, copySize, 1.18, activeTheme.text, 700, sans)
      const availableHeight = Math.max(0, bodyHeight - copyHeight - 50 * scale)
      const shotHeight = Math.min(availableHeight, bodyHeight * 0.68)
      const shotWidth = (image.naturalWidth / image.naturalHeight) * shotHeight
      context.drawImage(image, padding, bodyBottom - shotHeight, shotWidth, shotHeight)
    }
  }
}

function yamlString(value: string) {
  return JSON.stringify(value)
}

function configMarkdown(config: EditorConfig) {
  const output = ["---", `template: ${config.template}`]
  if (config.template !== "photo" && config.theme !== "ink") output.push(`theme: ${config.theme}`)
  if (config.eyebrow.trim()) output.push(`eyebrow: ${yamlString(config.eyebrow.trim())}`)
  output.push("formats:", ...config.formats.map((format) => `  - ${format}`))

  if (config.template === "screenshot") output.push(`screenshot: ${yamlString(config.screenshot)}`)
  if (config.template === "photo") {
    output.push(`photo: ${yamlString(config.photo)}`)
    output.push(`focus: ${config.focusX}% ${config.focusY}%`)
  }
  if (config.template === "progression") {
    output.push("chords:", ...config.chords.split(/\s+/).filter(Boolean).map((chord) => `  - ${yamlString(chord)}`))
    if (config.numerals.trim()) output.push(`numerals: ${yamlString(config.numerals.trim())}`)
  }
  const headline = lines(config.headline)
  if (headline.length) output.push("headline:", ...headline.map((line) => `  - ${yamlString(line)}`))
  if (config.template === "quote" && config.attribution.trim()) {
    output.push(`attribution: ${yamlString(config.attribution.trim())}`)
  }
  if (config.footnote.trim()) output.push(`footnote: ${yamlString(config.footnote.trim())}`)
  output.push(`alt: ${yamlString(config.alt.trim())}`)
  output.push(`created: ${new Date().toISOString().slice(0, 10)}`, "---", "", config.caption.trim(), "")
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
  const [status, setStatus] = useState<"idle" | "copied" | "exported">("idle")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const photoSrc = useMemo(() => {
    if (customPhoto?.name === config.photo) return customPhoto.src
    return photos.find((photo) => photo.name === config.photo)?.src ?? photos[0].src
  }, [config.photo, customPhoto])

  useEffect(() => {
    if (!canvasRef.current) return
    let current = true
    renderPost(canvasRef.current, config, activeFormat, photoSrc).catch(() => {
      if (current) setStatus("idle")
    })
    return () => {
      current = false
    }
  }, [activeFormat, config, photoSrc])

  useEffect(() => {
    if (status === "idle") return
    const timeout = window.setTimeout(() => setStatus("idle"), 1800)
    return () => window.clearTimeout(timeout)
  }, [status])

  useEffect(() => () => {
    if (customPhoto) URL.revokeObjectURL(customPhoto.src)
  }, [customPhoto])

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
    await renderPost(canvas, config, activeFormat, photoSrc)
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
          <div className="flex items-center gap-2">
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

      <main className="mx-auto grid max-w-[1500px] lg:grid-cols-[390px_minmax(0,1fr)]">
        <aside className="border-b border-border px-5 py-6 lg:border-r lg:border-b-0 lg:px-6">
          <Section title="Layout">
            <div className="grid grid-cols-2 gap-2">
              {templates.map((template) => (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => update("template", template.name)}
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

            <Field label="Headline" hint="One rendered line per row">
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

          {config.template !== "photo" && config.template !== "screenshot" ? (
            <Section title="Background">
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
            </Section>
          ) : null}

          {config.template === "photo" ? (
            <Section title="Photo background">
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
            </Section>
          ) : null}

          {config.template === "screenshot" ? (
            <Section title="App screenshot">
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
            <div className="mb-4 flex w-full items-center justify-between gap-4 text-xs text-muted-foreground">
              <span className="font-mono uppercase tracking-[0.14em]">Live preview</span>
              <span>{selectedFormat.width} × {selectedFormat.height} px</span>
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
    </div>
  )
}
