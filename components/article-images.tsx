"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { ImagePlus } from "lucide-react"

import { inputClass, primaryButton, secondaryButton } from "@/components/editorial-planner"
import { cn } from "@/lib/utils"
import { editorialCopy } from "@/locales/en"

const copy = editorialCopy.writing.images

export type ArticleImage = {
  name: string
  src: string
  bytes: number
}

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
  uploading: number
  onUpload: (files: File[]) => void
  onInsert: (image: ArticleImage) => void
}

export function ArticleImagePanel({ images, uploading, onUpload, onInsert }: ArticleImagePanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">{copy.title}</h2>
      <p className="text-xs text-muted-foreground">{copy.hint}</p>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.empty}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-2">
          {images.map((image) => (
            <li key={image.src}>
              <button
                type="button"
                onClick={() => onInsert(image)}
                aria-label={copy.insertLabel(image.name)}
                title={copy.insertLabel(image.name)}
                className="group flex w-full flex-col gap-1 rounded-lg border border-border p-1.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- a local thumbnail of a file in public/ */}
                <img src={image.src} alt="" className="aspect-video w-full rounded-md object-cover" />
                <span className="truncate font-mono text-[11px] text-muted-foreground">{image.name}</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {copy.size(Math.round(image.bytes / 1024))} · {copy.insert}
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
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading > 0}
        className={cn(secondaryButton, "w-fit")}
      >
        <ImagePlus className="size-4" aria-hidden="true" />
        {uploading > 0 ? copy.uploading(uploading) : copy.add}
      </button>
    </section>
  )
}

type ImageInsertDialogProps = {
  image: ArticleImage
  onInsert: (alt: string, caption: string) => void
  onCancel: () => void
}

/** Asks for the alt text before an image goes into the body — the guidelines require it. */
export function ImageInsertDialog({ image, onInsert, onCancel }: ImageInsertDialogProps) {
  const [alt, setAlt] = useState("")
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

  function submit(event: FormEvent) {
    event.preventDefault()
    if (alt.trim() === "") return
    onInsert(alt, caption)
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
        <p className="font-mono text-xs text-muted-foreground">{image.src}</p>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {copy.altLabel}
          <textarea
            ref={altRef}
            required
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            className={cn(inputClass, "resize-none [field-sizing:content]")}
          />
          <span className="text-xs font-normal text-muted-foreground">{copy.altHint}</span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {copy.captionLabel}
          <input value={caption} onChange={(event) => setCaption(event.target.value)} className={inputClass} />
          <span className="text-xs font-normal text-muted-foreground">{copy.captionHint}</span>
        </label>

        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={alt.trim() === ""} className={primaryButton}>
            {copy.confirm}
          </button>
          <button type="button" onClick={onCancel} className={secondaryButton}>
            {copy.cancel}
          </button>
        </div>
      </form>
    </div>
  )
}
