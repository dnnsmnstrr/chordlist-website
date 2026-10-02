"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { ImagePlus, Images, X } from "lucide-react"

import { inputClass, primaryButton, secondaryButton } from "@/components/editorial-planner"
import { cn } from "@/lib/utils"
import { editorialCopy } from "@/locales/en"

const copy = editorialCopy.writing.images

export type ArticleImage = {
  name: string
  src: string
  bytes: number
  /** Alt text from the photography catalog, when the image is one of the collection's. */
  alt?: string
}

type CollectionImage = { file: string; alt: string }

/** Uploads one image into the post's folder. Returns the saved image or an error message. */
export async function uploadArticleImage(slug: string, file: File): Promise<ArticleImage | string> {
  const form = new FormData()
  form.set("slug", slug)
  form.set("file", file)

  try {
    const response = await fetch("/api/editorial/images", { method: "POST", body: form })
    const result = (await response.json().catch(() => ({}))) as { image?: ArticleImage; error?: string }
    if (response.ok && result.image) return result.image
    return result.error ?? `The server answered ${response.status}.`
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
}

/** Renames an image that was just uploaded. Returns the renamed image or an error message. */
export async function renameArticleImage(slug: string, from: string, to: string): Promise<ArticleImage | string> {
  try {
    const response = await fetch("/api/editorial/images", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, from, to }),
    })
    const result = (await response.json().catch(() => ({}))) as { image?: ArticleImage; error?: string }
    if (response.ok && result.image) return result.image
    return result.error ?? `The server answered ${response.status}.`
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
}

/** Copies a master from the photography collection into the post's folder. */
export async function importCollectionImage(
  slug: string,
  file: string,
): Promise<{ image: ArticleImage; isNew: boolean } | string> {
  try {
    const response = await fetch("/api/editorial/collection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, file }),
    })
    const result = (await response.json().catch(() => ({}))) as {
      image?: ArticleImage
      isNew?: boolean
      error?: string
    }
    if (response.ok && result.image) return { image: result.image, isNew: result.isNew === true }
    return result.error ?? `The server answered ${response.status}.`
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
}

/** "phone-on-sheet-music.webp" → "phone-on-sheet-music": the part of a name the writer can change. */
function stem(name: string) {
  const dot = name.lastIndexOf(".")
  return dot > 0 ? name.slice(0, dot) : name
}

/** The image files in a drop or a paste, ignoring text and anything else that came along. */
export function imageFiles(data: DataTransfer | null): File[] {
  if (!data) return []
  return [...data.files].filter((file) => file.type.startsWith("image/"))
}

/**
 * The Markdown for one image, as `lib/markdown.ts` renders it: the alt text for screen readers,
 * the title as a visible caption. Brackets and quotes are escaped so a caption cannot end the
 * syntax early.
 */
export function imageMarkdown(src: string, alt: string, caption: string) {
  const escapedAlt = alt.trim().replace(/([[\]\\])/g, "\\$1")
  const title = caption.trim() === "" ? "" : ` "${caption.trim().replace(/(["\\])/g, "\\$1")}"`
  return `![${escapedAlt}](${src}${title})`
}

type ArticleImagePanelProps = {
  images: ArticleImage[]
  cover: string | null
  coverAlt: string
  uploading: number
  onUpload: (files: File[]) => void
  onChoose: (image: ArticleImage) => void
  onOpenCollection: () => void
  onRemoveCover: () => void
}

export function ArticleImagePanel({
  images,
  cover,
  coverAlt,
  uploading,
  onUpload,
  onChoose,
  onOpenCollection,
  onRemoveCover,
}: ArticleImagePanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">{copy.keyVisualTitle}</h2>
      <p className="text-xs text-muted-foreground">{copy.keyVisualHint}</p>
      {cover ? (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- a local preview of a file in public/ */}
          <img
            src={cover}
            alt={coverAlt}
            className="aspect-[1200/630] w-full rounded-lg border border-border object-cover"
          />
          <p className="text-xs text-muted-foreground">{coverAlt}</p>
          <button type="button" onClick={onRemoveCover} className={cn(secondaryButton, "w-fit")}>
            <X className="size-4" aria-hidden="true" />
            {copy.removeKeyVisual}
          </button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{copy.keyVisualEmpty}</p>
      )}

      <h2 className="mt-5 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">{copy.title}</h2>
      <p className="text-xs text-muted-foreground">{copy.hint}</p>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.empty}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-2">
          {images.map((image) => (
            <li key={image.src}>
              <button
                type="button"
                onClick={() => onChoose(image)}
                aria-label={copy.useLabel(image.name)}
                title={copy.useLabel(image.name)}
                className="group flex w-full flex-col gap-1 rounded-lg border border-border p-1.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- a local thumbnail of a file in public/ */}
                <img src={image.src} alt="" className="aspect-video w-full rounded-md object-cover" />
                <span className="truncate font-mono text-[11px] text-muted-foreground">{image.name}</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {copy.size(Math.round(image.bytes / 1024))} ·{" "}
                  {image.src === cover ? copy.keyVisualBadge : copy.use}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          onUpload([...(event.target.files ?? [])])
          event.target.value = ""
        }}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading > 0}
          className={cn(secondaryButton, "w-fit")}
        >
          <ImagePlus className="size-4" aria-hidden="true" />
          {uploading > 0 ? copy.uploading(uploading) : copy.add}
        </button>
        <button type="button" onClick={onOpenCollection} disabled={uploading > 0} className={cn(secondaryButton, "w-fit")}>
          <Images className="size-4" aria-hidden="true" />
          {copy.fromCollection}
        </button>
      </div>
    </section>
  )
}

type ImageInsertDialogProps = {
  image: ArticleImage
  /** A file uploaded a moment ago, which nothing links to yet — so its name can still change. */
  isNew: boolean
  initialAlt: string
  onInsert: (alt: string, caption: string, name: string) => void
  onUseAsCover: (alt: string, name: string) => void
  onCancel: () => void
}

/**
 * Asks for the alt text before an image goes into the body or above it — the guidelines require
 * it — and, for a fresh upload, the file name it is saved under.
 */
export function ImageInsertDialog({ image, isNew, initialAlt, onInsert, onUseAsCover, onCancel }: ImageInsertDialogProps) {
  const [name, setName] = useState(stem(image.name))
  const [alt, setAlt] = useState(initialAlt)
  const [caption, setCaption] = useState("")
  const altRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    altRef.current?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onCancel])

  const ready = alt.trim() !== "" && name.trim() !== ""

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!ready) return
    onInsert(alt, caption, name)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-insert-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <form
        onSubmit={submit}
        className="flex max-h-full w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-xl border border-border bg-background p-5"
      >
        <h2 id="image-insert-title" className="text-lg font-semibold tracking-tight">
          {copy.dialogTitle}
        </h2>
        {/* eslint-disable-next-line @next/next/no-img-element -- previewing the file just saved to public/ */}
        <img src={image.src} alt="" className="max-h-64 w-full rounded-lg border border-border object-contain" />

        {isNew ? (
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            {copy.fileNameLabel}
            <span className="flex items-center gap-1">
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                spellCheck={false}
                className={cn(inputClass, "flex-1 font-mono")}
              />
              <span className="font-mono text-xs text-muted-foreground">{image.name.slice(stem(image.name).length)}</span>
            </span>
            <span className="text-xs font-normal text-muted-foreground">{copy.fileNameHint}</span>
          </label>
        ) : (
          <p className="font-mono text-xs text-muted-foreground">{image.src}</p>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {copy.altLabel}
          <textarea
            ref={altRef}
            required
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            className={cn(inputClass, "resize-none [field-sizing:content]")}
          />
          <span className="text-xs font-normal text-muted-foreground">
            {initialAlt !== "" && alt === initialAlt && image.alt === initialAlt ? copy.altFromCatalog : copy.altHint}
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {copy.captionLabel}
          <input value={caption} onChange={(event) => setCaption(event.target.value)} className={inputClass} />
          <span className="text-xs font-normal text-muted-foreground">{copy.captionHint}</span>
        </label>

        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={!ready} className={primaryButton}>
            {copy.confirm}
          </button>
          <button type="button" disabled={!ready} onClick={() => onUseAsCover(alt, name)} className={secondaryButton}>
            {copy.useAsKeyVisual}
          </button>
          <button type="button" onClick={onCancel} className={secondaryButton}>
            {copy.cancel}
          </button>
        </div>
      </form>
    </div>
  )
}

type CollectionPickerProps = {
  onPick: (file: string) => void
  onClose: () => void
}

/** The photography collection as a grid. Picking one hands its filename back; the caller copies it. */
export function CollectionPicker({ onPick, onClose }: CollectionPickerProps) {
  const [images, setImages] = useState<CollectionImage[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/editorial/collection")
      .then(async (response) => {
        const result = (await response.json().catch(() => ({}))) as { images?: CollectionImage[]; error?: string }
        if (cancelled) return
        if (response.ok && result.images) setImages(result.images)
        else setError(result.error ?? `The server answered ${response.status}.`)
      })
      .catch((reason: unknown) => !cancelled && setError(reason instanceof Error ? reason.message : String(reason)))
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="collection-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="flex max-h-full w-full max-w-3xl flex-col gap-4 overflow-y-auto rounded-xl border border-border bg-background p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id="collection-title" className="text-lg font-semibold tracking-tight">
              {copy.collectionTitle}
            </h2>
            <p className="text-pretty text-xs text-muted-foreground">{copy.collectionHint}</p>
          </div>
          <button type="button" onClick={onClose} className={cn(secondaryButton, "px-2")} aria-label={copy.close}>
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : images === null ? (
          <p className="text-sm text-muted-foreground">{copy.collectionLoading}</p>
        ) : images.length === 0 ? (
          <p className="text-sm text-muted-foreground">{copy.collectionEmpty}</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image) => (
              <li key={image.file}>
                <button
                  type="button"
                  onClick={() => onPick(image.file)}
                  aria-label={copy.collectionPick(image.file)}
                  className="flex w-full flex-col gap-1.5 rounded-lg border border-border p-1.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- a thumbnail served by the editorial API */}
                  <img
                    src={`/api/editorial/collection?file=${encodeURIComponent(image.file)}`}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-md object-cover"
                  />
                  <span className="truncate font-mono text-[11px] text-muted-foreground">{image.file}</span>
                  <span className="line-clamp-2 text-xs text-muted-foreground">
                    {image.alt === "" ? copy.collectionNoAlt : image.alt}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
