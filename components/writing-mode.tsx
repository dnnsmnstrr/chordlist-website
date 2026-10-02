"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, ExternalLink, ListTree, Maximize2, Minimize2, Undo2 } from "lucide-react"

import {
  ArticleImagePanel,
  ImageInsertDialog,
  imageFiles,
  imageMarkdown,
  uploadArticleImage,
  type ArticleImage,
} from "@/components/article-images"
import {
  TagPicker,
  inputClass,
  primaryButton,
  secondaryButton,
  sendEditorialAction,
} from "@/components/editorial-planner"
import { cn } from "@/lib/utils"
import { editorialCopy } from "@/locales/en"

const copy = editorialCopy.writing

type WritingPost = {
  slug: string
  href: string
  title: string
  description: string
  tags: string[]
  outline: string[]
  body: string
  publishedLabel: string
  isPublic: boolean
  approval: "none" | "approved" | "stale"
}

type WritingModeProps = {
  post: WritingPost
  tags: string[]
  images: ArticleImage[]
}

type Fields = Pick<WritingPost, "title" | "description" | "tags" | "body"> & { outline: string }
type SaveState = "saved" | "unsaved" | "saving" | "failed"

/** Long enough to stay out of the way mid-sentence, short enough that a closed tab loses little. */
const AUTOSAVE_DELAY = 800

function countWords(text: string) {
  return text.split(/\s+/).filter(Boolean).length
}

export function WritingMode({ post, tags, images: initialImages }: WritingModeProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [fields, setFields] = useState<Fields>({
    title: post.title,
    description: post.description,
    tags: post.tags,
    body: post.body,
    outline: post.outline.join("\n"),
  })
  const [approval, setApproval] = useState(post.approval)
  const [saveState, setSaveState] = useState<SaveState>("saved")
  const [error, setError] = useState<string | null>(null)
  const [showOutline, setShowOutline] = useState(true)
  const [focus, setFocus] = useState(false)
  const [images, setImages] = useState(initialImages)
  const [uploading, setUploading] = useState(0)
  // Images waiting for their alt text, inserted one at a time in the order they arrived.
  const [toDescribe, setToDescribe] = useState<ArticleImage[]>([])

  const bodyRef = useRef<HTMLTextAreaElement>(null)
  // Where the next image goes. Read when an insert starts, because the dialog takes focus away
  // from the page and with it the caret.
  const insertAt = useRef<number | null>(null)

  // The fields that changed since the last save, so a save sends only what the writer touched.
  const dirty = useRef<Partial<Fields>>({})
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null

    const patch = dirty.current
    if (Object.keys(patch).length === 0) return true
    dirty.current = {}

    setSaveState("saving")
    const failure = await sendEditorialAction({
      action: "update",
      slug: post.slug,
      ...patch,
      ...(patch.outline !== undefined ? { outline: patch.outline.split("\n") } : {}),
    })

    if (failure) {
      // Put the patch back so the next attempt still carries it.
      dirty.current = { ...patch, ...dirty.current }
      setError(failure)
      setSaveState("failed")
      return false
    }

    setError(null)
    setSaveState(Object.keys(dirty.current).length > 0 ? "unsaved" : "saved")
    return true
  }, [post.slug])

  function update<Key extends keyof Fields>(key: Key, value: Fields[Key]) {
    setFields((current) => ({ ...current, [key]: value }))
    dirty.current = { ...dirty.current, [key]: value }
    setSaveState("unsaved")

    // The outline is planning notes and is not part of what gets approved; everything else is.
    if (key !== "outline" && approval === "approved") setApproval("stale")

    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => void save(), AUTOSAVE_DELAY)
  }

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (Object.keys(dirty.current).length === 0) return
      void save()
      event.preventDefault()
    }
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault()
        void save()
      }
      if (event.key === "Escape") setFocus(false)
    }

    window.addEventListener("beforeunload", onBeforeUnload)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [save])

  function rememberCaret() {
    insertAt.current = bodyRef.current?.selectionStart ?? fields.body.length
  }

  async function uploadImages(files: File[]) {
    if (files.length === 0) return
    rememberCaret()
    setUploading((count) => count + files.length)

    for (const file of files) {
      const result = await uploadArticleImage(post.slug, file)
      setUploading((count) => count - 1)
      if (typeof result === "string") {
        setError(result)
        continue
      }
      setImages((current) => [...current.filter((image) => image.src !== result.src), result])
      setToDescribe((queue) => [...queue, result])
    }
  }

  function chooseImage(image: ArticleImage) {
    rememberCaret()
    setToDescribe((queue) => [...queue, image])
  }

  /** Puts the image in a paragraph of its own at the remembered caret, then moves past it. */
  function insertImage(image: ArticleImage, alt: string, caption: string) {
    const body = fields.body
    const at = Math.min(insertAt.current ?? body.length, body.length)
    const before = body.slice(0, at).replace(/\s*$/, "")
    const after = body.slice(at).replace(/^\s*/, "")
    const lead = before === "" ? "" : `${before}\n\n`
    const markdown = imageMarkdown(image.src, alt, caption)

    update("body", `${lead}${markdown}${after === "" ? "\n" : `\n\n${after}`}`)
    insertAt.current = lead.length + markdown.length + 2
    setToDescribe((queue) => queue.slice(1))

    const caret = insertAt.current
    requestAnimationFrame(() => {
      bodyRef.current?.focus()
      bodyRef.current?.setSelectionRange(caret, caret)
    })
  }

  async function approve() {
    if (!(await save())) return
    if (!window.confirm(editorialCopy.queue.confirmApprove(fields.title, post.publishedLabel))) return
    const failure = await sendEditorialAction({ action: "approve", slug: post.slug })
    if (failure) {
      setError(failure)
      return
    }
    setApproval("approved")
    startTransition(() => router.refresh())
  }

  async function revoke() {
    const failure = await sendEditorialAction({ action: "revoke", slug: post.slug })
    if (failure) {
      setError(failure)
      return
    }
    setApproval("none")
    startTransition(() => router.refresh())
  }

  const words = countWords(fields.body)
  const outlineItems = fields.outline.split("\n").filter((line) => line.trim() !== "")

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <div
        className={cn(
          "sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-2 backdrop-blur-sm transition-opacity sm:px-6",
          focus && "border-transparent opacity-30 hover:opacity-100 focus-within:opacity-100",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/editorial" className={cn(secondaryButton, "border-transparent px-2")}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            {copy.back}
          </Link>
          <span className="hidden truncate text-sm font-medium sm:inline">{fields.title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground" aria-live="polite">
            {editorialCopy.queue.words(words)} · {uploading > 0 ? copy.images.uploading(uploading) : copy[saveState]}
          </span>
          {!focus ? (
            <button
              type="button"
              aria-pressed={showOutline}
              onClick={() => setShowOutline((value) => !value)}
              className={cn(secondaryButton, "px-2")}
            >
              <ListTree className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{copy.showOutline}</span>
            </button>
          ) : null}
          <button
            type="button"
            aria-pressed={focus}
            onClick={() => setFocus((value) => !value)}
            className={cn(secondaryButton, "px-2")}
          >
            {focus ? (
              <Minimize2 className="size-4" aria-hidden="true" />
            ) : (
              <Maximize2 className="size-4" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">{copy.focus}</span>
          </button>
          <a href={post.href} target="_blank" rel="noreferrer" className={cn(secondaryButton, "px-2")}>
            <ExternalLink className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{copy.preview}</span>
          </a>
        </div>
      </div>

      {error ? (
        <p role="alert" className="border-b border-destructive/40 bg-destructive/10 px-6 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <div className="flex flex-1 flex-col lg:flex-row">
        {showOutline && !focus ? (
          // Below lg the page comes first: on a phone the point is to write, and the outline is a scroll away.
          <aside className="order-last flex w-full shrink-0 flex-col gap-8 border-t border-border p-6 lg:sticky lg:order-first lg:top-[49px] lg:h-[calc(100vh-49px)] lg:w-96 lg:overflow-y-auto lg:border-t-0 lg:border-r">
            <section className="flex flex-col gap-2">
              <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {copy.outlineTitle}
              </h2>
              <p className="text-xs text-muted-foreground">{copy.outlineHint}</p>
              <textarea
                aria-label={copy.outlineTitle}
                value={fields.outline}
                onChange={(event) => update("outline", event.target.value)}
                className={cn(inputClass, "min-h-40 resize-none leading-relaxed [field-sizing:content]")}
              />
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {copy.detailsTitle}
              </h2>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                {copy.titleLabel}
                <input
                  value={fields.title}
                  onChange={(event) => update("title", event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                {copy.promiseLabel}
                <textarea
                  value={fields.description}
                  onChange={(event) => update("description", event.target.value)}
                  className={cn(inputClass, "resize-none [field-sizing:content]")}
                />
              </label>
              <TagPicker
                tags={tags}
                selected={fields.tags}
                onChange={(next) => next.length > 0 && update("tags", next)}
                label={copy.tagsLabel}
              />
            </section>

            <ArticleImagePanel
              images={images}
              uploading={uploading}
              onUpload={(files) => void uploadImages(files)}
              onInsert={chooseImage}
            />

            <ApprovalPanel
              approval={approval}
              isPublic={post.isPublic}
              publishedLabel={post.publishedLabel}
              canApprove={words > 0}
              onApprove={approve}
              onRevoke={revoke}
            />
          </aside>
        ) : null}

        <div className="flex flex-1 justify-center px-6 py-10 sm:py-16">
          <div className="flex w-full max-w-2xl flex-col gap-6">
            {focus ? null : (
              <h1 className="text-balance text-3xl font-semibold tracking-tight">{fields.title}</h1>
            )}
            {/* Focus mode hides the panel, so the outline stays in view as a quiet list above the page. */}
            {focus && outlineItems.length > 0 ? (
              <ul className="flex flex-col gap-1 border-l border-border pl-4 text-sm text-muted-foreground">
                {outlineItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : null}
            <textarea
              ref={bodyRef}
              aria-label={fields.title}
              autoFocus
              value={fields.body}
              placeholder={copy.placeholder}
              onChange={(event) => update("body", event.target.value)}
              onBlur={() => void save()}
              onPaste={(event) => {
                const files = imageFiles(event.clipboardData)
                if (files.length === 0) return
                event.preventDefault()
                void uploadImages(files)
              }}
              onDragOver={(event) => {
                if (event.dataTransfer.types.includes("Files")) event.preventDefault()
              }}
              onDrop={(event) => {
                const files = imageFiles(event.dataTransfer)
                if (files.length === 0) return
                event.preventDefault()
                void uploadImages(files)
              }}
              className="min-h-[70vh] w-full resize-none bg-transparent text-lg leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-none [field-sizing:content]"
            />
          </div>
        </div>
      </div>
      {toDescribe[0] ? (
        <ImageInsertDialog
          key={`${toDescribe[0].src}-${toDescribe.length}`}
          image={toDescribe[0]}
          onInsert={(alt, caption) => toDescribe[0] && insertImage(toDescribe[0], alt, caption)}
          onCancel={() => setToDescribe((queue) => queue.slice(1))}
        />
      ) : null}
    </main>
  )
}

function ApprovalPanel({
  approval,
  isPublic,
  publishedLabel,
  canApprove,
  onApprove,
  onRevoke,
}: {
  approval: WritingPost["approval"]
  isPublic: boolean
  publishedLabel: string
  canApprove: boolean
  onApprove: () => void
  onRevoke: () => void
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4",
        approval === "approved" ? "border-border bg-card" : "border-dashed border-border",
        approval === "stale" && "border-destructive/50",
      )}
    >
      <p className="font-mono text-xs text-muted-foreground">{copy.scheduled(publishedLabel)}</p>
      <p className="text-sm font-medium">
        {isPublic
          ? editorialCopy.status.live
          : approval === "approved"
            ? editorialCopy.status.approved
            : approval === "stale"
              ? editorialCopy.status.stale
              : canApprove
                ? editorialCopy.status.writing
                : editorialCopy.status.idea}
      </p>
      {approval === "approved" ? (
        <>
          <p className="text-pretty text-xs leading-relaxed text-muted-foreground">{copy.approvedNotice}</p>
          <button type="button" onClick={onRevoke} className={cn(secondaryButton, "w-fit")}>
            <Undo2 className="size-4" aria-hidden="true" />
            {copy.revoke}
          </button>
        </>
      ) : (
        <>
          {approval === "stale" ? (
            <p className="text-pretty text-xs leading-relaxed text-destructive">{copy.staleNotice}</p>
          ) : null}
          <button type="button" disabled={!canApprove} onClick={onApprove} className={cn(primaryButton, "w-fit")}>
            <Check className="size-4" aria-hidden="true" />
            {copy.approve}
          </button>
        </>
      )}
    </section>
  )
}
