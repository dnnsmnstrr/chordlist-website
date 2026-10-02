import "server-only"

import { access, mkdir, readdir, stat, writeFile } from "node:fs/promises"
import path from "node:path"

import { EditorialError } from "@/lib/editorial/store"

/**
 * Article images for /editorial: saved into public/blog/<slug>/, where the blog-post skill and every
 * existing post already keep them, and referenced from the body as ordinary Markdown.
 *
 * Every upload is resized and re-encoded here rather than stored as it arrived. A phone photo is
 * several megabytes and four thousand pixels wide; body images render as plain lazy `<img>`
 * elements, not through next/image, so whatever lands in public/ is exactly what a reader
 * downloads. The editorial guidelines ask for about 1600px and compressed — this makes that the
 * default instead of a step to remember.
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const IMAGE_EXTENSIONS = new Set([".webp", ".png", ".jpg", ".jpeg", ".gif", ".avif", ".svg"])

/** Wide enough for the article column on a 2x display; the guideline width for body images. */
const MAX_WIDTH = 1600
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024

export type ArticleImage = {
  name: string
  src: string
  bytes: number
}

function imageDirectory(slug: string) {
  if (!SLUG_PATTERN.test(slug)) throw new EditorialError(`"${slug}" is not a valid slug.`)
  return path.join(process.cwd(), "public", "blog", slug)
}

export async function listImages(slug: string): Promise<ArticleImage[]> {
  const directory = imageDirectory(slug)
  let names: string[]
  try {
    names = await readdir(directory)
  } catch {
    return []
  }

  const images = await Promise.all(
    names
      .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .map(async (name) => ({
        name,
        src: `/blog/${slug}/${name}`,
        bytes: (await stat(path.join(directory, name))).size,
      })),
  )
  return images.sort((a, b) => a.name.localeCompare(b.name))
}

/** "IMG_2041 (1).HEIC" → "img-2041-1". Never empty, never a path. */
function baseName(fileName: string) {
  const stem = path.parse(fileName).name
  const cleaned = stem
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
  return cleaned === "" ? "image" : cleaned
}

/** Never overwrites: an image already in a published post must keep meaning what it meant. */
async function freeName(directory: string, base: string) {
  const existing = new Set(await readdir(directory).catch(() => [] as string[]))
  if (!existing.has(`${base}.webp`)) return `${base}.webp`
  for (let index = 2; ; index += 1) {
    const candidate = `${base}-${index}.webp`
    if (!existing.has(candidate)) return candidate
  }
}

export async function saveImage(slug: string, file: File): Promise<ArticleImage> {
  if (file.size === 0) throw new EditorialError("That file is empty.")
  if (file.size > MAX_UPLOAD_BYTES) throw new EditorialError("Images can be up to 25 MB.")
  if (!file.type.startsWith("image/")) throw new EditorialError("Only image files can be added to a post.")

  const directory = imageDirectory(slug)
  // A folder for a post that does not exist is an orphan nobody will find to delete.
  await access(path.join(process.cwd(), "content", "blog", `${slug}.md`)).catch(() => {
    throw new EditorialError(`content/blog/${slug}.md does not exist.`)
  })

  // Loaded on demand: the tool only runs under `pnpm dev`, so a deployed function never needs it.
  const { default: sharp } = await import("sharp")

  let output: Buffer
  try {
    output = await sharp(Buffer.from(await file.arrayBuffer()), { animated: true })
      // Phone photos store their orientation as metadata; bake it in before the metadata is dropped.
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()
  } catch {
    throw new EditorialError(
      `${file.name} could not be read as an image. HEIC photos from an iPhone may need exporting as JPEG first.`,
    )
  }

  await mkdir(directory, { recursive: true })
  const name = await freeName(directory, baseName(file.name))
  await writeFile(path.join(directory, name), output)

  return { name, src: `/blog/${slug}/${name}`, bytes: output.length }
}
