"use client"

import designTokens from "@/design/tokens.json"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import dynamic from "next/dynamic"
import { Check, Clapperboard, LoaderCircle, Upload } from "lucide-react"

import { InlineMarkup } from "@/components/inline-markup"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motionEditorCopy as copy } from "@/locales/en"
import { chaptersFor } from "@/video/src/motion/recording"
import {
  SLUG_PATTERN,
  emptyDefinition,
  motionFormats,
  motionTemplates,
  recordingChapters,
  resolveDefinition,
  screenshotNames,
  storedDefinitionSchema,
  totalSeconds,
  type MotionDefinition,
  type MotionMedia,
  type StoredDefinition,
} from "@/video/src/motion/custom/schema"
import {
  findSnippet,
  isSnippetRef,
  resolveField,
  type SnippetCatalog,
  type SnippetKind,
  type SnippetRef,
} from "@/video/src/motion/custom/snippets"

// The Player draws with WebGL and loads fonts on import, so it never runs on the server.
const MotionPreview = dynamic(() => import("@/components/motion-preview").then((module) => module.MotionPreview), {
  ssr: false,
  loading: () => <div className="aspect-[9/16] w-full animate-pulse rounded-xl bg-muted" />,
})

type Output = { format: string; video: string; poster: string }
type Saved = { slug: string; definition: StoredDefinition; caption: string; created: string; outputs: Output[] }
type SocialStart = { slug: string; definition: StoredDefinition; caption: string }
type Usage = Record<string, number>
type Photo = { file: string; alt: string }
type UploadedAsset = { file: string; kind: "image" | "video"; bytes: number }
type Job = { state: "running" | "done" | "failed"; stage: keyof typeof copy.render.stages; progress: number; message: string }

type MotionEditorProps = {
  saved: Saved[]
  socialStarts: SocialStart[]
  photos: Photo[]
  recordingsSynced: boolean
  catalog: SnippetCatalog
  usage: Usage
}

const steps = ["start", "words", "media", "look", "render"] as const
type Step = (typeof steps)[number]
type Template = MotionDefinition["template"]
type Format = MotionDefinition["formats"][number]

/** The headline as words, following a snippet reference, for lists and labels. */
function headlineText(definition: StoredDefinition, catalog: SnippetCatalog) {
  try {
    return resolveField(definition.headline, "headline", catalog).join(" ")
  } catch {
    return ""
  }
}

const mediaPath = (path: string) => `/api/motion/media/${path}`

/** The media a template starts with when it is chosen, so the preview is never empty. */
function defaultMedia(template: Template, photos: Photo[]): MotionMedia {
  if (template === "screen") return { kind: "screenshot", name: "02-Song-Detail" }
  if (template === "photo" && photos[0]) return { kind: "photo", file: photos[0].file }
  return { kind: "none" }
}

async function send<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init)
  const body = (await response.json().catch(() => ({}))) as T & { error?: string }
  if (!response.ok) throw new Error(body.error ?? response.statusText)
  return body
}

/**
 * The /motion wizard. Five steps — start, words, media, look, render — beside a live preview of
 * the definition as it will render. Saving writes content/motion/<slug>.md; rendering runs
 * `pnpm build:motion` for that one definition on this machine and lists the files it produced.
 */
export function MotionEditor({ saved, socialStarts, photos, recordingsSynced, catalog: initialCatalog, usage: initialUsage }: MotionEditorProps) {
  const [step, setStep] = useState<Step>("start")
  const [slug, setSlug] = useState("")
  const [definition, setDefinition] = useState<StoredDefinition>(emptyDefinition)
  const [catalog, setCatalog] = useState(initialCatalog)
  const [usage, setUsage] = useState(initialUsage)
  const [caption, setCaption] = useState("")
  const [dirty, setDirty] = useState(false)
  const [status, setStatus] = useState<{ tone: "info" | "error"; text: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [job, setJob] = useState<Job | null>(null)
  const [outputs, setOutputs] = useState<Output[]>([])
  const [previewFormat, setPreviewFormat] = useState<Format>("story")

  const update = (patch: Partial<StoredDefinition>) => {
    setDefinition((current) => ({ ...current, ...patch }))
    setDirty(true)
  }

  const validation = useMemo(() => storedDefinitionSchema.safeParse(definition), [definition])
  // The definition as it will render: snippet references followed, so the preview shows the
  // snippets as they stand now, including an edit made a moment ago.
  const resolved = useMemo((): { definition: MotionDefinition } | { error: string } => {
    if (!validation.success) return { error: validation.error.issues[0]?.message ?? "" }
    try {
      return { definition: resolveDefinition(validation.data, catalog) }
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) }
    }
  }, [validation, catalog])
  const slugValid = SLUG_PATTERN.test(slug)
  const shownFormat = definition.formats.includes(previewFormat) ? previewFormat : (definition.formats[0] ?? "story")

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  function load(next: { slug: string; definition: StoredDefinition; caption: string }, outputsForSlug: Output[] = []) {
    setSlug(next.slug)
    setDefinition(next.definition)
    setCaption(next.caption)
    setOutputs(outputsForSlug)
    setJob(null)
    setDirty(false)
    setStatus(null)
    setStep("words")
  }

  async function save() {
    setSaving(true)
    setStatus(null)
    try {
      await send("/api/motion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, definition, caption }),
      })
      setDirty(false)
      setStatus({ tone: "info", text: copy.render.saved })
      return true
    } catch (error) {
      setStatus({ tone: "error", text: error instanceof Error ? error.message : String(error) })
      return false
    } finally {
      setSaving(false)
    }
  }

  async function render() {
    if (dirty && !(await save())) return
    try {
      const { job: started } = await send<{ job: Job }>("/api/motion/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
      setJob(started)
    } catch (error) {
      setStatus({ tone: "error", text: error instanceof Error ? error.message : String(error) })
    }
  }

  // Poll a running render until it settles, then show what it produced.
  useEffect(() => {
    if (job?.state !== "running") return
    const timer = window.setInterval(async () => {
      const result = await send<{ job: Job | null; outputs: Output[] }>(`/api/motion/render?slug=${slug}`).catch(() => null)
      if (!result?.job) return
      setJob(result.job)
      if (result.job.state !== "running") setOutputs(result.outputs)
    }, 1500)
    return () => window.clearInterval(timer)
  }, [job?.state, slug])

  const stepIndex = steps.indexOf(step)
  const canLeaveStart = slugValid

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="max-w-3xl border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{copy.eyebrow}</p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight">{copy.title}</h1>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          <InlineMarkup text={copy.introduction} />
        </p>
      </header>

      <nav aria-label={copy.title} className="mt-8">
        <ol className="flex flex-wrap gap-2">
          {steps.map((name, index) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => (name === "start" || canLeaveStart) && setStep(name)}
                disabled={name !== "start" && !canLeaveStart}
                aria-current={step === name ? "step" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm transition-colors duration-150",
                  step === name ? "bg-primary text-primary-foreground" : "hover:bg-muted disabled:opacity-50",
                )}
              >
                <span className="font-mono text-xs">{index + 1}</span>
                {copy.steps[name]}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <section className="min-w-0">
          {step === "start" ? (
            <StartStep
              slug={slug}
              onSlug={(value) => {
                setSlug(value)
                setDirty(true)
              }}
              template={definition.template}
              onTemplate={(template) => update({ template, media: defaultMedia(template, photos) })}
              socialStarts={socialStarts}
              catalog={catalog}
              onSocial={(start) => {
                load({ ...start, slug: slug || start.slug })
                // A still is a starting point, not a saved video: there is nothing on disk yet.
                setDirty(true)
              }}
              saved={saved}
              onSaved={(entry) => load(entry, entry.outputs)}
            />
          ) : null}
          {step === "words" ? (
            <WordsStep
              definition={definition}
              update={update}
              caption={caption}
              onCaption={(value) => {
                setCaption(value)
                setDirty(true)
              }}
              snippets={{
                catalog,
                usage,
                onCatalog: (next, nextUsage) => {
                  setCatalog(next)
                  setUsage(nextUsage)
                },
              }}
            />
          ) : null}
          {step === "media" ? (
            <MediaStep slug={slugValid ? slug : ""} definition={definition} update={update} photos={photos} recordingsSynced={recordingsSynced} />
          ) : null}
          {step === "look" ? <LookStep definition={definition} update={update} /> : null}
          {step === "render" ? (
            <RenderStep
              definition={definition}
              valid={"definition" in resolved && slugValid}
              issues={"definition" in resolved ? [] : [resolved.error]}
              dirty={dirty}
              saving={saving}
              onSave={save}
              onRender={render}
              job={job}
              outputs={outputs}
            />
          ) : null}

          {status ? (
            <p role="status" className={cn("mt-6 text-sm", status.tone === "error" ? "text-destructive" : "text-muted-foreground")}>
              {status.text}
            </p>
          ) : null}

          <div className="mt-10 flex justify-between gap-3 border-t border-border pt-6">
            <Button variant="outline" disabled={stepIndex === 0} onClick={() => setStep(steps[stepIndex - 1] ?? "start")}>
              {copy.navigation.back}
            </Button>
            {stepIndex < steps.length - 1 ? (
              <Button disabled={!canLeaveStart} onClick={() => setStep(steps[stepIndex + 1] ?? "render")}>
                {copy.navigation.next}
              </Button>
            ) : null}
          </div>
        </section>

        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{copy.preview.heading}</h2>
            <label className="sr-only" htmlFor="motion-preview-format">
              {copy.preview.format}
            </label>
            <select
              id="motion-preview-format"
              value={shownFormat}
              onChange={(event) => setPreviewFormat(event.target.value as Format)}
              className="min-h-11 rounded-lg border border-input bg-background px-3 text-sm"
            >
              {definition.formats.map((format) => (
                <option key={format} value={format}>
                  {copy.look.formatNames[format]}
                </option>
              ))}
            </select>
          </div>
          <div className={cn("mt-3 overflow-hidden rounded-xl border border-border", shownFormat === "wide" ? "" : "mx-auto max-w-xs")}>
            {"definition" in resolved ? (
              <MotionPreview key={shownFormat} slug={slug} definition={resolved.definition} format={shownFormat} />
            ) : (
              <p className="p-6 text-sm text-muted-foreground">{resolved.error}</p>
            )}
          </div>
          {dirty ? <p className="mt-3 font-mono text-xs text-muted-foreground">{copy.render.unsaved}</p> : null}
        </aside>
      </div>
    </div>
  )
}

type FieldProps = { id: string; label: string; hint?: string; children: ReactNode }

function Field({ id, label, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint ? <p className="text-pretty text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

const inputClass =
  "min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

function Choice({ selected, onClick, children, className }: { selected: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "relative rounded-xl border p-4 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2",
        selected ? "border-foreground bg-muted" : "border-border hover:bg-muted",
        className,
      )}
    >
      {selected ? <Check aria-hidden="true" className="absolute top-3 right-3 size-4" /> : null}
      {children}
    </button>
  )
}

type StartStepProps = {
  catalog: SnippetCatalog
  slug: string
  onSlug: (slug: string) => void
  template: Template
  onTemplate: (template: Template) => void
  socialStarts: SocialStart[]
  onSocial: (start: SocialStart) => void
  saved: Saved[]
  onSaved: (entry: Saved) => void
}

function StartStep({ catalog, slug, onSlug, template, onTemplate, socialStarts, onSocial, saved, onSaved }: StartStepProps) {
  return (
    <div className="flex flex-col gap-10">
      <Field id="motion-slug" label={copy.start.nameLabel} hint={copy.start.nameHint}>
        <input
          id="motion-slug"
          className={cn(inputClass, "font-mono")}
          value={slug}
          placeholder={copy.start.namePlaceholder}
          onChange={(event) => onSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
          aria-invalid={slug !== "" && !SLUG_PATTERN.test(slug)}
        />
      </Field>

      <section>
        <h2 className="text-lg font-semibold tracking-tight">{copy.start.templateHeading}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {motionTemplates.map((name) => (
            <li key={name}>
              <Choice selected={template === name} onClick={() => onTemplate(name)} className="h-full w-full">
                <span className="block font-medium">{copy.templates[name].title}</span>
                <span className="mt-1 block text-pretty text-sm text-muted-foreground">{copy.templates[name].description}</span>
              </Choice>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Field id="motion-social" label={copy.start.socialHeading} hint={copy.start.socialHint}>
          <select
            id="motion-social"
            className={inputClass}
            value=""
            onChange={(event) => {
              const start = socialStarts.find((entry) => entry.slug === event.target.value)
              if (start) onSocial(start)
            }}
          >
            <option value="">{copy.start.socialPlaceholder}</option>
            {socialStarts.map((start) => (
              <option key={start.slug} value={start.slug}>
                {start.slug} — {headlineText(start.definition, catalog)}
              </option>
            ))}
          </select>
        </Field>
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-tight">{copy.start.existingHeading}</h2>
        {saved.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{copy.start.existingEmpty}</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {saved.map((entry) => (
              <li key={entry.slug} className="flex items-center gap-3 rounded-xl border border-border p-3">
                {entry.outputs[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a local, generated poster
                  <img src={entry.outputs[0].poster} alt="" className="h-16 w-auto rounded-md border border-border" />
                ) : (
                  <Clapperboard aria-hidden="true" className="size-6 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm">{entry.slug}</p>
                  <p className="truncate text-xs text-muted-foreground">{headlineText(entry.definition, catalog)}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => onSaved(entry)}>
                  {copy.start.edit}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

type StepProps = { definition: StoredDefinition; update: (patch: Partial<StoredDefinition>) => void }

type SnippetProps = {
  catalog: SnippetCatalog
  usage: Usage
  onCatalog: (catalog: SnippetCatalog, usage: Usage) => void
}

type WordsStepProps = StepProps & { caption: string; onCaption: (value: string) => void; snippets: SnippetProps }

function WordsStep({ definition, update, caption, onCaption, snippets }: WordsStepProps) {
  const { template } = definition
  return (
    <div className="flex flex-col gap-6">
      <LinkableField
        id="motion-eyebrow"
        kind="eyebrow"
        label={copy.words.eyebrow}
        hint={copy.words.eyebrowHint}
        value={definition.eyebrow}
        onChange={(eyebrow) => update({ eyebrow })}
        snippets={snippets}
        maxLength={24}
      />
      <LinkableField
        id="motion-headline"
        kind="headline"
        label={copy.words.headline}
        hint={copy.words.headlineHint}
        value={definition.headline}
        onChange={(headline) => update({ headline })}
        snippets={snippets}
      />
      {template === "statement" || template === "screen" || template === "photo" ? (
        <LinkableField
          id="motion-subline"
          kind="subline"
          label={copy.words.subline}
          hint={copy.words.sublineHint}
          value={definition.subline}
          onChange={(subline) => update({ subline })}
          snippets={snippets}
          maxLength={90}
        />
      ) : null}
      {template === "progression" ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="motion-chords" label={copy.words.chords} hint={copy.words.chordsHint}>
            <input
              id="motion-chords"
              className={cn(inputClass, "font-mono")}
              value={definition.chords.join(" ")}
              onChange={(event) => update({ chords: event.target.value.split(/\s+/).filter(Boolean).slice(0, 6) })}
            />
          </Field>
          <Field id="motion-numerals" label={copy.words.numerals}>
            <input id="motion-numerals" className={cn(inputClass, "font-mono")} value={definition.numerals} onChange={(event) => update({ numerals: event.target.value })} />
          </Field>
        </div>
      ) : null}
      {template === "file" ? (
        <>
          <Field id="motion-filename" label={copy.words.filename}>
            <input id="motion-filename" className={cn(inputClass, "font-mono")} value={definition.filename} onChange={(event) => update({ filename: event.target.value })} />
          </Field>
          <Field id="motion-file" label={copy.words.fileLines} hint={copy.words.fileLinesHint}>
            <textarea
              id="motion-file"
              className={cn(inputClass, "min-h-64 font-mono text-xs whitespace-pre")}
              wrap="off"
              value={definition.fileLines.join("\n")}
              onChange={(event) => update({ fileLines: event.target.value === "" ? [] : event.target.value.split("\n").slice(0, 18) })}
            />
          </Field>
        </>
      ) : null}
      <LinkableField
        id="motion-footnote"
        kind="footnote"
        label={copy.words.footnote}
        hint={copy.words.footnoteHint}
        value={definition.footnote}
        onChange={(footnote) => update({ footnote })}
        snippets={snippets}
        mono
        maxLength={60}
      />
      <Field id="motion-caption" label={copy.words.caption} hint={copy.words.captionHint}>
        <textarea id="motion-caption" className={cn(inputClass, "min-h-24")} value={caption} onChange={(event) => onCaption(event.target.value)} />
        {/* A caption is usually put together from parts, so a snippet is inserted as text, not linked. */}
        <SnippetSelect
          kind="caption"
          catalog={snippets.catalog}
          placeholder={copy.snippets.insert}
          label={`${copy.words.caption}: ${copy.snippets.insert}`}
          onPick={(snippet) => onCaption(caption.trim() === "" ? String(snippet.value) : `${caption.trimEnd()}\n\n${String(snippet.value)}`)}
        />
      </Field>
    </div>
  )
}

type SnippetSelectProps = {
  kind: SnippetKind
  catalog: SnippetCatalog
  placeholder: string
  label: string
  onPick: (snippet: SnippetCatalog[number]) => void
}

/** The catalog's snippets for one field, grouped by where they come from. */
function SnippetSelect({ kind, catalog, placeholder, label, onPick }: SnippetSelectProps) {
  const options = catalog.filter((snippet) => snippet.kind === kind)
  if (options.length === 0) return null
  const preview = (value: string | string[]) => {
    const text = Array.isArray(value) ? value.join(" ") : value
    return text.length > 48 ? `${text.slice(0, 47)}…` : text
  }
  return (
    <select
      aria-label={label}
      className={cn(inputClass, "text-muted-foreground")}
      value=""
      onChange={(event) => {
        const snippet = options.find((option) => option.id === event.target.value)
        if (snippet) onPick(snippet)
      }}
    >
      <option value="">{placeholder}</option>
      {(["snippets", "vocabulary", "social"] as const).map((source) => {
        const group = options.filter((option) => option.source === source)
        return group.length === 0 ? null : (
          <optgroup key={source} label={copy.snippets.sources[source]}>
            {group.map((option) => (
              <option key={option.id} value={option.id}>
                {option.id} — {preview(option.value)}
              </option>
            ))}
          </optgroup>
        )
      })}
    </select>
  )
}

type LinkableFieldProps<T extends string | string[]> = {
  id: string
  kind: SnippetKind
  label: string
  hint: string
  value: T | SnippetRef
  onChange: (value: T | SnippetRef) => void
  snippets: SnippetProps
  mono?: boolean
  maxLength?: number
}

/**
 * A text field that can hold its own words or link to a snippet. Linked, it shows the snippet's
 * wording and where it comes from; the wizard's own snippets can be edited in place, which changes
 * every video linked to them. Plain, it offers the catalog and can save its text as a new snippet.
 */
function LinkableField<T extends string | string[]>({ id, kind, label, hint, value, onChange, snippets, mono, maxLength }: LinkableFieldProps<T>) {
  const { catalog, usage, onCatalog } = snippets
  const multiline = kind === "headline"
  const toText = (input: string | string[]) => (Array.isArray(input) ? input.join("\n") : input)
  const fromText = (text: string) => (multiline ? text.split("\n").slice(0, 4) : text) as T
  const linked = isSnippetRef(value) ? findSnippet(catalog, kind, value.snippet) : undefined
  const [mode, setMode] = useState<"idle" | "editing" | "naming">("idle")
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")

  async function store(key: string, wording: string | string[]) {
    setError("")
    try {
      const result = await send<{ catalog: SnippetCatalog; usage: Usage }>("/api/motion/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, key, value: wording }),
      })
      onCatalog(result.catalog, result.usage)
      setMode("idle")
      return true
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
      return false
    }
  }

  const textClass = cn(inputClass, mono && "font-mono", multiline && "min-h-28 text-base font-semibold")

  return (
    <Field id={id} label={label} hint={hint}>
      {isSnippetRef(value) ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border p-3">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
            <span className="text-foreground">{copy.snippets.linked(value.snippet)}</span>
            {linked ? <span>{copy.snippets.sources[linked.source]}</span> : null}
            {usage[`${kind}:${value.snippet}`] ? <span>{copy.snippets.usedBy(usage[`${kind}:${value.snippet}`] ?? 0)}</span> : null}
          </p>
          {mode === "editing" && linked ? (
            multiline ? (
              <textarea id={id} className={textClass} rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} />
            ) : (
              <input id={id} className={textClass} value={draft} maxLength={maxLength} onChange={(event) => setDraft(event.target.value)} />
            )
          ) : (
            <p id={id} className={cn("whitespace-pre-line text-sm", mono && "font-mono", multiline && "text-base font-semibold")}>
              {linked ? toText(linked.value) : ""}
            </p>
          )}
          {linked?.source === "vocabulary" || linked?.source === "social" ? (
            <p className="text-xs text-muted-foreground">{copy.snippets.readOnly[linked.source]}</p>
          ) : null}
          {mode === "editing" ? <p className="text-xs text-muted-foreground">{copy.snippets.editHint}</p> : null}
          <div className="flex flex-wrap gap-2">
            {mode === "editing" && linked ? (
              <>
                <Button size="sm" onClick={() => void store(linked.id, fromText(draft))}>
                  {copy.snippets.save}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setMode("idle")}>
                  {copy.snippets.cancel}
                </Button>
              </>
            ) : (
              <>
                {linked?.source === "snippets" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDraft(toText(linked.value))
                      setMode("editing")
                    }}
                  >
                    {copy.snippets.edit}
                  </Button>
                ) : null}
                <Button size="sm" variant="ghost" title={copy.snippets.unlinkHint} onClick={() => onChange((linked ? linked.value : fromText("")) as T)}>
                  {copy.snippets.unlink}
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          {multiline ? (
            <textarea id={id} className={textClass} rows={4} value={toText(value)} onChange={(event) => onChange(fromText(event.target.value))} />
          ) : (
            <input id={id} className={textClass} value={toText(value)} maxLength={maxLength} onChange={(event) => onChange(fromText(event.target.value))} />
          )}
          <div className="flex flex-wrap items-start gap-2">
            <div className="min-w-0 flex-1">
              <SnippetSelect
                kind={kind}
                catalog={catalog}
                placeholder={copy.snippets.choose}
                label={`${label}: ${copy.snippets.choose}`}
                onPick={(snippet) => onChange({ snippet: snippet.id })}
              />
            </div>
            {mode === "naming" ? null : (
              <Button variant="outline" disabled={toText(value).trim() === ""} onClick={() => setMode("naming")}>
                {copy.snippets.saveAs}
              </Button>
            )}
          </div>
          {mode === "naming" ? (
            <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border p-3">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <label htmlFor={`${id}-snippet-key`} className="text-xs font-medium">
                  {copy.snippets.keyLabel}
                </label>
                <input
                  id={`${id}-snippet-key`}
                  className={cn(inputClass, "font-mono")}
                  placeholder={copy.snippets.keyPlaceholder}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                />
              </div>
              <Button
                onClick={async () => {
                  const key = draft
                  if (await store(key, value as string | string[])) onChange({ snippet: key })
                }}
              >
                {copy.snippets.save}
              </Button>
              <Button variant="ghost" onClick={() => setMode("idle")}>
                {copy.snippets.cancel}
              </Button>
            </div>
          ) : null}
        </>
      )}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </Field>
  )
}

type MediaStepProps = StepProps & { slug: string; photos: Photo[]; recordingsSynced: boolean }

function MediaStep({ slug, definition, update, photos, recordingsSynced }: MediaStepProps) {
  const { template, media, appearance } = definition
  const [uploads, setUploads] = useState<UploadedAsset[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!slug) return
    send<{ assets: UploadedAsset[] }>(`/api/motion/assets?slug=${slug}`)
      .then((result) => setUploads(result.assets))
      .catch(() => setUploads([]))
  }, [slug])

  if (template !== "screen" && template !== "photo") return <p className="text-sm text-muted-foreground">{copy.media.none}</p>

  const sources: MotionMedia["kind"][] = template === "screen" ? ["screenshot", "recording", "colorScroll", "upload"] : ["photo", "upload"]
  const source = sources.includes(media.kind) ? media.kind : sources[0]!

  async function upload(file: File) {
    setUploading(true)
    setError("")
    try {
      const form = new FormData()
      form.set("slug", slug)
      form.set("file", file)
      const { asset } = await send<{ asset: UploadedAsset }>("/api/motion/assets", { method: "POST", body: form })
      setUploads((current) => [...current.filter((entry) => entry.file !== asset.file), asset])
      update({ media: { kind: "upload", file: asset.file } })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div role="radiogroup" className="flex flex-wrap gap-2">
        {sources.map((kind) => (
          <button
            key={kind}
            type="button"
            role="radio"
            aria-checked={source === kind}
            onClick={() => {
              if (kind === "screenshot") update({ media: { kind, name: "02-Song-Detail" } })
              if (kind === "recording") update({ media: { kind, chapter: "handsFree", offset: 0 } })
              if (kind === "colorScroll") update({ media: { kind } })
              if (kind === "photo" && photos[0]) update({ media: { kind, file: photos[0].file } })
              if (kind === "upload" && uploads[0]) update({ media: { kind, file: uploads[0].file } })
              if (kind === "upload" && !uploads[0]) update({ media: { kind: "none" } })
            }}
            className={cn(
              "min-h-11 rounded-full border px-4 text-sm transition-colors duration-150",
              source === kind ? "border-foreground bg-muted" : "border-border hover:bg-muted",
            )}
          >
            {copy.media.sources[kind as keyof typeof copy.media.sources]}
          </button>
        ))}
      </div>

      {source === "screenshot" ? (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {screenshotNames.map((name) => (
            <li key={name}>
              <Choice selected={media.kind === "screenshot" && media.name === name} onClick={() => update({ media: { kind: "screenshot", name } })} className="w-full p-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- a thumbnail of a synced capture */}
                <img src={`/app-screenshots/${appearance}/${name}.png`} alt={name.replace(/^\d+-/, "").replace(/-/g, " ")} className="w-full rounded-md" />
              </Choice>
            </li>
          ))}
        </ul>
      ) : null}

      {source === "recording" ? (
        recordingsSynced ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">{copy.media.recordingHint}</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {recordingChapters.map((chapter) => (
                <li key={chapter}>
                  <Choice
                    selected={media.kind === "recording" && media.chapter === chapter}
                    onClick={() => update({ media: { kind: "recording", chapter, offset: 0 } })}
                    className="w-full p-3 text-sm"
                  >
                    {copy.media.chapters[chapter]}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {copy.media.seconds(chaptersFor(appearance)[chapter].end - chaptersFor(appearance)[chapter].start)}
                    </span>
                  </Choice>
                </li>
              ))}
            </ul>
            {media.kind === "recording" ? (
              <Field id="motion-offset" label={`${copy.media.offset} · ${copy.media.seconds(media.offset)}`}>
                <input
                  id="motion-offset"
                  type="range"
                  min={0}
                  max={Math.max(0, chaptersFor(appearance)[media.chapter].end - chaptersFor(appearance)[media.chapter].start - 0.5)}
                  step={0.1}
                  value={media.offset}
                  onChange={(event) => update({ media: { ...media, offset: Number(event.target.value) } })}
                  className="min-h-11"
                />
              </Field>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{copy.media.recordingMissing}</p>
        )
      ) : null}

      {source === "colorScroll" ? <p className="text-sm text-muted-foreground">{copy.media.colorScrollHint}</p> : null}

      {source === "photo" ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.file}>
              <Choice selected={media.kind === "photo" && media.file === photo.file} onClick={() => update({ media: { kind: "photo", file: photo.file } })} className="w-full p-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- a thumbnail of a photography master */}
                <img src={mediaPath(`generated/motion/photos/${photo.file}`)} alt={photo.alt} className="aspect-[4/3] w-full rounded-md object-cover" />
              </Choice>
            </li>
          ))}
        </ul>
      ) : null}

      {source === "upload" ? (
        slug ? (
          <div className="flex flex-col gap-4">
            <div>
              <input
                ref={fileInput}
                id="motion-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void upload(file)
                  event.target.value = ""
                }}
              />
              <Button variant="outline" disabled={uploading} onClick={() => fileInput.current?.click()}>
                {uploading ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <Upload aria-hidden="true" />}
                {uploading ? copy.media.uploading : copy.media.upload}
              </Button>
              <p className="mt-2 text-pretty text-xs text-muted-foreground">{copy.media.uploadHint}</p>
              {error ? <p role="alert" className="mt-2 text-sm text-destructive">{error}</p> : null}
            </div>
            {uploads.length === 0 ? (
              <p className="text-sm text-muted-foreground">{copy.media.uploadsEmpty}</p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {uploads.map((asset) => (
                  <li key={asset.file}>
                    <Choice selected={media.kind === "upload" && media.file === asset.file} onClick={() => update({ media: { kind: "upload", file: asset.file } })} className="w-full p-2">
                      {asset.kind === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element -- a thumbnail of a local upload
                        <img src={mediaPath(`generated/motion/uploads/${slug}/${asset.file}`)} alt="" className="aspect-[4/3] w-full rounded-md object-cover" />
                      ) : (
                        <video src={mediaPath(`generated/motion/uploads/${slug}/${asset.file}`)} muted className="aspect-[4/3] w-full rounded-md object-cover" />
                      )}
                      <span className="mt-2 block truncate font-mono text-xs">{asset.file}</span>
                    </Choice>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{copy.media.nameFirst}</p>
        )
      ) : null}
    </div>
  )
}

function LookStep({ definition, update }: StepProps) {
  const campaigns = ["ink", "paper", "blueprint", "warm-stage"] as const
  return (
    <div className="flex flex-col gap-8">
      <fieldset>
        <legend className="text-sm font-medium">{copy.look.campaign}</legend>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {campaigns.map((campaign) => {
            const theme = designTokens.campaigns[campaign]
            return (
              <Choice key={campaign} selected={definition.campaign === campaign} onClick={() => update({ campaign })} className="p-3">
                <span
                  aria-hidden="true"
                  className="flex h-12 items-end rounded-md border border-border p-2 font-mono text-xs"
                  style={{ backgroundColor: theme.background, color: theme.text }}
                >
                  Aa
                </span>
                <span className="mt-2 block text-sm">{copy.look.campaigns[campaign]}</span>
              </Choice>
            )
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">{copy.look.appearance}</legend>
        <div className="mt-3 flex gap-2">
          {(["light", "dark"] as const).map((appearance) => (
            <Choice key={appearance} selected={definition.appearance === appearance} onClick={() => update({ appearance })} className="min-w-28 px-4 py-3 text-sm">
              {copy.look.appearances[appearance]}
            </Choice>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">{copy.look.formats}</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {motionFormats.map((format) => {
            const checked = definition.formats.includes(format)
            return (
              <label key={format} className="flex min-h-11 items-center gap-3 rounded-lg border border-border px-3 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    update({
                      formats: checked ? definition.formats.filter((entry) => entry !== format) : motionFormats.filter((entry) => entry === format || definition.formats.includes(entry)),
                    })
                  }
                />
                {copy.look.formatNames[format]}
              </label>
            )
          })}
        </div>
      </fieldset>

      <Field id="motion-duration" label={`${copy.look.duration} · ${copy.media.seconds(definition.duration)}`}>
        <input
          id="motion-duration"
          type="range"
          min={3}
          max={30}
          step={0.5}
          value={definition.duration}
          onChange={(event) => update({ duration: Number(event.target.value) })}
          className="min-h-11"
        />
      </Field>

      <label className="flex min-h-11 items-start gap-3 text-sm">
        <input type="checkbox" checked={definition.endCard} onChange={(event) => update({ endCard: event.target.checked })} className="mt-1" />
        <span>
          <span className="font-medium">{copy.look.endCard}</span>
          <span className="block text-xs text-muted-foreground">{copy.look.endCardHint}</span>
        </span>
      </label>
    </div>
  )
}

type RenderStepProps = {
  definition: StoredDefinition
  valid: boolean
  issues: string[]
  dirty: boolean
  saving: boolean
  onSave: () => Promise<boolean>
  onRender: () => Promise<void>
  job: Job | null
  outputs: Output[]
}

function RenderStep({ definition, valid, issues, dirty, saving, onSave, onRender, job, outputs }: RenderStepProps) {
  const running = job?.state === "running"
  return (
    <div className="flex flex-col gap-6">
      <p className="font-mono text-sm text-muted-foreground">
        {copy.templates[definition.template].title} · {copy.render.summary(definition.formats.length, totalSeconds(definition))}
      </p>
      {issues.length > 0 ? (
        <ul role="alert" className="list-disc pl-5 text-sm text-destructive">
          {issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" disabled={!valid || saving || !dirty} onClick={() => void onSave()}>
          {saving ? copy.render.saving : copy.render.save}
        </Button>
        <Button disabled={!valid || saving || running} onClick={() => void onRender()}>
          {running ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <Clapperboard aria-hidden="true" />}
          {copy.render.render}
        </Button>
      </div>

      {job ? (
        <div role="status" className="flex flex-col gap-2">
          {running ? (
            <>
              <p className="font-mono text-sm">{copy.render.rendering(copy.render.stages[job.stage], Math.round(job.progress * 100))}</p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${Math.round(job.progress * 100)}%` }} />
              </div>
            </>
          ) : job.state === "done" ? (
            <p className="text-sm">{copy.render.done}</p>
          ) : (
            <p className="text-sm text-destructive">
              {copy.render.failed} {job.message}
            </p>
          )}
        </div>
      ) : null}

      {outputs.length > 0 ? (
        <section>
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{copy.render.outputs}</h2>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {outputs.map((output) => (
              <li key={output.video} className="flex flex-col gap-2">
                <video src={output.video} poster={output.poster} controls muted playsInline className="w-full rounded-lg border border-border" />
                <a href={output.video} className="font-mono text-xs underline-offset-4 hover:underline">
                  {copy.render.open} {output.video}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
