import "server-only"

import { copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises"
import path from "node:path"

import sharp from "sharp"
import photographyCatalog from "@/assets/visual-references/analog-photography/catalog.json"
import { parseDefinitionFile, serializeDefinitionFile } from "@/video/src/motion/custom/definition-file"
import { SLUG_PATTERN, definitionSchema, type MotionDefinition } from "@/video/src/motion/custom/schema"

/**
 * The /motion wizard's reads and writes. A definition is content/motion/<slug>.md — the same shape
 * as a content/social definition: YAML frontmatter that builds the video, a body that is its
 * caption. Uploaded media lives in assets/motion/<slug>/ beside the photography masters, committed
 * with the definition so a render is reproducible from the repository alone, and is copied into
 * Remotion's public directory (video/public/generated/motion/) for the preview and the render.
 */

const root = process.cwd()
const DEFINITIONS = path.join(root, "content", "motion")
const UPLOADS = path.join(root, "assets", "motion")
const PHOTOS = path.join(root, "assets", "visual-references", "analog-photography")
export const REMOTION_PUBLIC = path.join(root, "video", "public")
const GENERATED = path.join(REMOTION_PUBLIC, "generated", "motion")
export const OUTPUTS = path.join(root, "public", "motion")

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"])
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v"])
const MAX_IMAGE_BYTES = 25 * 1024 * 1024
const MAX_VIDEO_BYTES = 80 * 1024 * 1024
/** Tall enough for a full phone capture at story size; anything larger only weighs the repository. */
const MAX_IMAGE_EDGE = 2700

export class MotionError extends Error {}

export function assertLocal() {
  if (process.env.NODE_ENV === "production") {
    throw new MotionError("The motion editor only works on a local checkout. Run `pnpm dev` and use it there.")
  }
}

export function assertSlug(slug: string) {
  if (!SLUG_PATTERN.test(slug)) throw new MotionError(`"${slug}" is not a valid name. Use lowercase words joined by hyphens.`)
}

export type StoredDefinition = {
  slug: string
  definition: MotionDefinition
  caption: string
  created: string
}

export async function readDefinition(slug: string): Promise<StoredDefinition> {
  assertSlug(slug)
  const source = await readFile(path.join(DEFINITIONS, `${slug}.md`), "utf8")
  try {
    return { slug, ...parseDefinitionFile(source, `content/motion/${slug}.md`) }
  } catch (error) {
    throw new MotionError(error instanceof Error ? error.message : String(error))
  }
}

export async function listDefinitions(): Promise<StoredDefinition[]> {
  const files = (await readdir(DEFINITIONS).catch(() => [])).filter((file) => file.endsWith(".md")).sort()
  const definitions: StoredDefinition[] = []
  for (const file of files) {
    try {
      definitions.push(await readDefinition(file.replace(/\.md$/, "")))
    } catch {
      // A broken definition fails `pnpm build:motion` loudly; the wizard just leaves it out.
    }
  }
  return definitions
}

export async function writeDefinition(slug: string, input: unknown, caption: string): Promise<StoredDefinition> {
  assertSlug(slug)
  const parsed = definitionSchema.safeParse(input)
  if (!parsed.success) {
    throw new MotionError(parsed.error.issues.map((issue) => `${issue.path.join(".") || "definition"}: ${issue.message}`).join("; "))
  }
  const existing = await readDefinition(slug).catch(() => null)
  const stored = { slug, definition: parsed.data, caption: caption.trim(), created: existing?.created || new Date().toISOString().slice(0, 10) }
  await mkdir(DEFINITIONS, { recursive: true })
  await writeFile(path.join(DEFINITIONS, `${slug}.md`), serializeDefinitionFile(stored))
  return stored
}

export type MotionAsset = { file: string; kind: "image" | "video"; bytes: number }

export async function listUploads(slug: string): Promise<MotionAsset[]> {
  assertSlug(slug)
  const directory = path.join(UPLOADS, slug)
  const names = await readdir(directory).catch(() => [])
  const assets: MotionAsset[] = []
  for (const file of names.sort()) {
    const extension = path.extname(file).toLowerCase()
    const kind = VIDEO_EXTENSIONS.has(extension) ? "video" : IMAGE_EXTENSIONS.has(extension) ? "image" : null
    if (!kind) continue
    assets.push({ file, kind, bytes: (await stat(path.join(directory, file))).size })
  }
  return assets
}

/** "IMG_2041 (1).HEIC" → "img-2041-1". Never empty, never a path. */
function baseName(fileName: string) {
  const cleaned = path
    .parse(fileName)
    .name.toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
  return cleaned === "" ? "asset" : cleaned
}

async function freeName(directory: string, stem: string, extension: string) {
  const taken = new Set(await readdir(directory).catch(() => []))
  for (let index = 1; ; index++) {
    const name = index === 1 ? `${stem}${extension}` : `${stem}-${index}${extension}`
    if (!taken.has(name)) return name
  }
}

/**
 * Saves an upload for one definition. Images are resized and re-encoded as WebP, because whatever
 * lands here is committed; videos are kept as they arrived, since re-encoding one belongs to the
 * render, and are refused past a size that would bloat the repository.
 */
export async function saveUpload(slug: string, file: File): Promise<MotionAsset> {
  assertSlug(slug)
  const extension = path.extname(file.name).toLowerCase()
  const directory = path.join(UPLOADS, slug)
  await mkdir(directory, { recursive: true })

  if (VIDEO_EXTENSIONS.has(extension)) {
    if (file.size > MAX_VIDEO_BYTES) throw new MotionError("That video is over 80 MB. Trim it first; it is committed with the definition.")
    const name = await freeName(directory, baseName(file.name), extension)
    await writeFile(path.join(directory, name), Buffer.from(await file.arrayBuffer()))
    await mirror(slug, name)
    return { file: name, kind: "video", bytes: file.size }
  }

  if (!IMAGE_EXTENSIONS.has(extension)) throw new MotionError("Upload an image (PNG, JPEG, WebP, AVIF) or a video (MP4, WebM, MOV).")
  if (file.size > MAX_IMAGE_BYTES) throw new MotionError("That image is over 25 MB.")
  const output = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({ width: MAX_IMAGE_EDGE, height: MAX_IMAGE_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88 })
    .toBuffer()
  const name = await freeName(directory, baseName(file.name), ".webp")
  await writeFile(path.join(directory, name), output)
  await mirror(slug, name)
  return { file: name, kind: "image", bytes: output.length }
}

/** Copies one upload into Remotion's public directory, so the preview sees it before the next sync. */
async function mirror(slug: string, file: string) {
  const target = path.join(GENERATED, "uploads", slug)
  await mkdir(target, { recursive: true })
  await copyFile(path.join(UPLOADS, slug, file), path.join(target, file))
}

export type Photo = { file: string; alt: string }

/** The photography masters, with the alt text the catalog already carries for each. */
export async function listPhotos(): Promise<Photo[]> {
  const catalog = photographyCatalog as Record<string, { alt?: string }>
  const files = (await readdir(PHOTOS).catch(() => [])).filter((file) => file.endsWith(".png")).sort()
  return files.map((file) => ({ file, alt: catalog[file]?.alt ?? "" }))
}

export type RenderedOutput = { format: string; video: string; poster: string }

/** What `pnpm build:motion` has already rendered for a definition. */
export async function listOutputs(slug: string): Promise<RenderedOutput[]> {
  assertSlug(slug)
  const files = await readdir(path.join(OUTPUTS, slug)).catch(() => [])
  return files
    .filter((file) => file.endsWith(".mp4"))
    .sort()
    .map((file) => {
      const format = file.replace(/\.mp4$/, "")
      return { format, video: `/motion/${slug}/${file}`, poster: `/motion/${slug}/${format}.jpg` }
    })
}
