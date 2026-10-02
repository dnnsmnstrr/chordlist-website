"use client"

import { useMemo, useState, useTransition, type FormEvent, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, CalendarDays, Check, PenLine, Trash2, Undo2 } from "lucide-react"

import { SocialPostCalendar } from "@/components/social-post-calendar"
import { editorialStage, type Cadence, type EditorialStage } from "@/lib/editorial-schedule"
import { cn } from "@/lib/utils"
import { editorialCopy as copy } from "@/locales/en"

export type PlannerPost = {
  slug: string
  title: string
  published: string
  publishedLabel: string
  isPublic: boolean
  draft: boolean
  approval: "none" | "approved" | "stale"
  approvedOn: string | null
  wordCount: number
  outlineCount: number
}

type EditorialPlannerProps = {
  posts: PlannerPost[]
  cadence: Cadence
  today: string
  tags: string[]
}

export type EditorialAction = Record<string, unknown> & { action: string }

/** Sends one change, then re-reads the files. Returns an error message or null. */
export async function sendEditorialAction(body: EditorialAction): Promise<string | null> {
  try {
    const response = await fetch("/api/editorial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (response.ok) return null
    const result = (await response.json().catch(() => ({}))) as { error?: string }
    return result.error ?? `The server answered ${response.status}.`
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .slice(0, 6)
    .join("-")
}

export function EditorialPlanner({ posts, cadence, today, tags }: EditorialPlannerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const queue = useMemo(() => posts.filter((post) => !post.isPublic), [posts])
  const live = useMemo(() => posts.filter((post) => post.isPublic).reverse(), [posts])
  const awaiting = queue.filter((post) => post.approval !== "approved").length

  async function run(body: EditorialAction) {
    setError(null)
    const failure = await sendEditorialAction(body)
    if (failure) setError(failure)
    startTransition(() => router.refresh())
    return failure === null
  }

  function move(index: number, delta: number) {
    const order = queue.map((post) => post.slug)
    const target = index + delta
    const current = order[index]
    const other = order[target]
    if (current === undefined || other === undefined) return
    order[index] = other
    order[target] = current
    void run({ action: "reorder", order })
  }

  function approve(post: PlannerPost) {
    if (!window.confirm(copy.queue.confirmApprove(post.title, post.publishedLabel))) return
    void run({ action: "approve", slug: post.slug })
  }

  function remove(post: PlannerPost) {
    if (!window.confirm(copy.queue.confirmDelete(post.title))) return
    void run({ action: "delete", slug: post.slug })
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className={cn("mx-auto w-full max-w-5xl px-6 py-16", isPending && "opacity-70 transition-opacity")}>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">{copy.eyebrow}</p>
            <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight">{copy.title}</h1>
            <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
              {copy.introduction}
            </p>
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              {copy.summary.live(live.length)} · {copy.summary.upcoming(queue.length)} ·{" "}
              {copy.summary.awaiting(awaiting)}
            </p>
          </div>
          <button type="button" onClick={() => setCalendarOpen(true)} className={secondaryButton}>
            <CalendarDays className="size-4" aria-hidden="true" />
            {copy.calendar}
          </button>
        </header>

        {error ? (
          <p role="alert" className="mt-8 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
            {error}
          </p>
        ) : null}

        <section className="mt-12">
          <h2 className="text-lg font-semibold tracking-tight">{copy.queue.title}</h2>
          {queue.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">{copy.queue.empty}</p>
          ) : (
            <ol className="mt-4 flex flex-col gap-3">
              {queue.map((post, index) => {
                const stage = editorialStage(post)
                const overdue = post.published <= today

                return (
                  <li
                    key={post.slug}
                    className={cn(
                      "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center",
                      stage === "approved" ? "border-border bg-card" : "border-dashed border-border",
                    )}
                  >
                    <div className="flex shrink-0 items-center gap-1 sm:flex-col">
                      <IconButton
                        label={copy.queue.moveUp(post.title)}
                        disabled={index === 0 || isPending}
                        onClick={() => move(index, -1)}
                      >
                        <ArrowUp className="size-4" aria-hidden="true" />
                      </IconButton>
                      <IconButton
                        label={copy.queue.moveDown(post.title)}
                        disabled={index === queue.length - 1 || isPending}
                        onClick={() => move(index, 1)}
                      >
                        <ArrowDown className="size-4" aria-hidden="true" />
                      </IconButton>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs text-muted-foreground">
                        <time dateTime={post.published}>{post.publishedLabel}</time>
                        {" · "}
                        {copy.queue.words(post.wordCount)}
                      </p>
                      <p className="mt-1 text-pretty font-medium">{post.title}</p>
                      <div className="mt-2">
                        <StageBadge stage={stage} />
                      </div>
                      {overdue ? <p className="mt-2 text-xs text-destructive">{copy.overdue}</p> : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/editorial/${post.slug}`} className={primaryButton}>
                        <PenLine className="size-4" aria-hidden="true" />
                        {copy.queue.write}
                      </Link>
                      {stage === "approved" ? (
                        <button
                          type="button"
                          onClick={() => void run({ action: "revoke", slug: post.slug })}
                          className={secondaryButton}
                        >
                          <Undo2 className="size-4" aria-hidden="true" />
                          {copy.queue.revoke}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={post.wordCount === 0}
                          onClick={() => approve(post)}
                          className={secondaryButton}
                        >
                          <Check className="size-4" aria-hidden="true" />
                          {copy.queue.approve}
                        </button>
                      )}
                      <IconButton label={`${copy.queue.delete}: ${post.title}`} onClick={() => remove(post)}>
                        <Trash2 className="size-4" aria-hidden="true" />
                      </IconButton>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <AddIdeaForm tags={tags} onSubmit={run} disabled={isPending} />
          <CadenceForm cadence={cadence} onSubmit={run} disabled={isPending} />
        </div>

        <section className="mt-12">
          <h2 className="text-lg font-semibold tracking-tight">{copy.live.title}</h2>
          {live.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">{copy.live.empty}</p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-border rounded-xl border border-border">
              {live.map((post) => (
                <li key={post.slug} className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="min-w-0 truncate text-sm">{post.title}</span>
                  <time dateTime={post.published} className="shrink-0 font-mono text-xs text-muted-foreground">
                    {post.publishedLabel}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {calendarOpen ? (
        <SocialPostCalendar
          posts={posts.map((post) => ({ ...post, scheduled: post.published }))}
          onClose={() => setCalendarOpen(false)}
          title={(post) => post.title}
          editHref={(post) => `/editorial/${post.slug}`}
          pending={(post) => !post.isPublic && post.approval !== "approved"}
        />
      ) : null}
    </main>
  )
}

function StageBadge({ stage }: { stage: EditorialStage }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-xs",
        stage === "approved" || stage === "live"
          ? "border-foreground/40 text-foreground"
          : stage === "stale"
            ? "border-destructive/50 text-destructive"
            : "border-dashed border-border text-muted-foreground",
      )}
    >
      {stage === "approved" || stage === "live" ? <Check className="size-3" aria-hidden="true" /> : null}
      {copy.status[stage]}
    </span>
  )
}

function AddIdeaForm({
  tags,
  onSubmit,
  disabled,
}: {
  tags: string[]
  onSubmit: (body: EditorialAction) => Promise<boolean>
  disabled: boolean
}) {
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [outline, setOutline] = useState("")

  async function submit(event: FormEvent) {
    event.preventDefault()
    const ok = await onSubmit({
      action: "create",
      slug: slugTouched ? slug : slugify(title),
      title,
      description,
      tags: selectedTags,
      outline: outline.split("\n"),
    })
    if (!ok) return
    setTitle("")
    setSlug("")
    setSlugTouched(false)
    setDescription("")
    setSelectedTags([])
    setOutline("")
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-xl border border-border p-5">
      <h2 className="text-lg font-semibold tracking-tight">{copy.add.title}</h2>
      <Field label={copy.add.titleLabel}>
        <input required value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} />
      </Field>
      <Field label={copy.add.slugLabel}>
        <input
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          value={slugTouched ? slug : slugify(title)}
          onChange={(event) => {
            setSlugTouched(true)
            setSlug(event.target.value)
          }}
          className={cn(inputClass, "font-mono")}
        />
      </Field>
      <Field label={copy.add.promiseLabel}>
        <input
          required
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={inputClass}
        />
      </Field>
      <TagPicker tags={tags} selected={selectedTags} onChange={setSelectedTags} label={copy.add.tagsLabel} />
      <Field label={copy.add.outlineLabel}>
        <textarea
          rows={5}
          value={outline}
          onChange={(event) => setOutline(event.target.value)}
          className={inputClass}
        />
      </Field>
      <button type="submit" disabled={disabled || selectedTags.length === 0} className={cn(primaryButton, "w-fit")}>
        {copy.add.submit}
      </button>
    </form>
  )
}

function CadenceForm({
  cadence,
  onSubmit,
  disabled,
}: {
  cadence: Cadence
  onSubmit: (body: EditorialAction) => Promise<boolean>
  disabled: boolean
}) {
  const [start, setStart] = useState(cadence.start)
  const [everyDays, setEveryDays] = useState(String(cadence.everyDays))
  const [skip, setSkip] = useState(cadence.skip.join("\n"))

  function submit(event: FormEvent) {
    event.preventDefault()
    void onSubmit({
      action: "cadence",
      start,
      everyDays: Number(everyDays),
      skip: skip
        .split(/\s+/)
        .map((line) => line.trim())
        .filter(Boolean),
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-xl border border-border p-5">
      <h2 className="text-lg font-semibold tracking-tight">{copy.cadence.title}</h2>
      <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{copy.cadence.explanation}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.cadence.start}>
          <input
            type="date"
            required
            value={start}
            onChange={(event) => setStart(event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label={copy.cadence.everyDays}>
          <input
            type="number"
            min={1}
            max={60}
            required
            value={everyDays}
            onChange={(event) => setEveryDays(event.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label={copy.cadence.skip} hint={copy.cadence.skipHint}>
        <textarea
          rows={3}
          value={skip}
          onChange={(event) => setSkip(event.target.value)}
          className={cn(inputClass, "font-mono")}
        />
      </Field>
      <button type="submit" disabled={disabled} className={cn(secondaryButton, "w-fit")}>
        {copy.cadence.save}
      </button>
    </form>
  )
}

export function TagPicker({
  tags,
  selected,
  onChange,
  label,
}: {
  tags: string[]
  selected: string[]
  onChange: (tags: string[]) => void
  label: string
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const active = selected.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? selected.filter((item) => item !== tag) : [...selected, tag])}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-xs transition-colors",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {tag}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      {children}
      {hint ? <span className="text-xs font-normal text-muted-foreground">{hint}</span> : null}
    </label>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  )
}

export const inputClass =
  "rounded-md border border-border bg-background px-3 py-2 text-sm font-normal text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"

export const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
