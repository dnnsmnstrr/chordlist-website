import "server-only"

import { access, mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises"
import path from "node:path"

import { collectionAlt, readMaster } from "@/lib/editorial/collection"
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
  /** Alt text from the photography catalog, when the image is one of the collection's. */
  alt?: string
}

async function withAlt(image: ArticleImage): Promise<ArticleImage> {
  const alt = await collectionAlt(image.name)
  return alt ? { ...image, alt } : image
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
      .map(async (name) =>
        withAlt({
          name,
          src: `/blog/${slug}/${name}`,
          bytes: (await stat(path.join(directory, name))).size,
        }),
      ),
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

/** A folder for a post that does not exist is an orphan nobody will find to delete. */
async function requirePost(slug: string) {
  await access(path.join(process.cwd(), "content", "blog", `${slug}.md`)).catch(() => {
    throw new EditorialError(`content/blog/${slug}.md does not exist.`)
  })
}

/** Resized to the article width and re-encoded as WebP. Throws if the bytes are not an image. */
async function encodeForWeb(input: Buffer) {
  // Loaded on demand: the tool only runs under `pnpm dev`, so a deployed function never needs it.
  const { default: sharp } = await import("sharp")
  return (
    sharp(input, { animated: true })
      // Phone photos store their orientation as metadata; bake it in before the metadata is dropped.
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()
  )
}

async function store(slug: string, base: string, output: Buffer): Promise<ArticleImage> {
  const directory = imageDirectory(slug)
  await mkdir(directory, { recursive: true })
  const name = await freeName(directory, base)
  await writeFile(path.join(directory, name), output)
  return withAlt({ name, src: `/blog/${slug}/${name}`, bytes: output.length })
}

export async function saveImage(slug: string, file: File): Promise<ArticleImage> {
  if (file.size === 0) throw new EditorialError("That file is empty.")
  if (file.size > MAX_UPLOAD_BYTES) throw new EditorialError("Images can be up to 25 MB.")
  if (!file.type.startsWith("image/")) throw new EditorialError("Only image files can be added to a post.")

  imageDirectory(slug) // Validates the slug before it is used in any path.
  await requirePost(slug)

  let output: Buffer
  try {
    output = await encodeForWeb(Buffer.from(await file.arrayBuffer()))
  } catch {
    throw new EditorialError(
      `${file.name} could not be read as an image. HEIC photos from an iPhone may need exporting as JPEG first.`,
    )
  }

  return store(slug, baseName(file.name), output)
}

/**
 * Copies a master from the photography collection into the post's folder, web-sized. A post that
 * already has it under the master's name gets that file back rather than a second copy.
 */
export async function importFromCollection(slug: string, file: string): Promise<{ image: ArticleImage; isNew: boolean }> {
  const directory = imageDirectory(slug)
  await requirePost(slug)

  const master = await readMaster(file)
  if (!master) throw new EditorialError(`${file} is not in the photography collection.`)

  const base = baseName(file)
  const existing = await stat(path.join(directory, `${base}.webp`)).catch(() => null)
  if (existing) {
    const image = await withAlt({ name: `${base}.webp`, src: `/blog/${slug}/${base}.webp`, bytes: existing.size })
    return { image, isNew: false }
  }

  return { image: await store(slug, base, await encodeForWeb(master)), isNew: true }
}

/** Every post that mentions this image — in its body or as its key visual. */
async function postsUsing(src: string) {
  const directory = path.join(process.cwd(), "content", "blog")
  const names = (await readdir(directory)).filter((name) => name.endsWith(".md"))
  const users = await Promise.all(
    names.map(async (name) => ((await readFile(path.join(directory, name), "utf8")).includes(src) ? name : null)),
  )
  return users.filter((name): name is string => name !== null)
}

/**
 * Gives a freshly uploaded image the name the writer chose. Only an image nothing refers to yet can
 * be renamed — once a post links to it, the name is part of that post — and it never replaces
 * another file, for the same reason uploads never do.
 */
export async function renameImage(slug: string, from: string, to: string): Promise<ArticleImage> {
  const directory = imageDirectory(slug)
  const current = path.basename(from)
  if (current !== from || !IMAGE_EXTENSIONS.has(path.extname(current).toLowerCase())) {
    throw new EditorialError(`"${from}" is not an image in public/blog/${slug}/.`)
  }

  const name = `${baseName(to)}${path.extname(current).toLowerCase()}`
  const source = path.join(directory, current)
  const info = await stat(source).catch(() => {
    throw new EditorialError(`public/blog/${slug}/${current} does not exist.`)
  })
  if (name === current) return withAlt({ name, src: `/blog/${slug}/${name}`, bytes: info.size })

  const users = await postsUsing(`/blog/${slug}/${current}`)
  if (users.length > 0) {
    throw new EditorialError(`${current} is already used in ${users.join(", ")}, so its name has to stay.`)
  }
  const taken = await access(path.join(directory, name)).then(
    () => true,
    () => false,
  )
  if (taken) throw new EditorialError(`public/blog/${slug}/${name} already exists. Pick another name.`)

  await rename(source, path.join(directory, name))
  return withAlt({ name, src: `/blog/${slug}/${name}`, bytes: info.size })
}
