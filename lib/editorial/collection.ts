import "server-only"

import { readFile, readdir } from "node:fs/promises"
import path from "node:path"

/**
 * The photography collection: the lossless masters in assets/visual-references/analog-photography/,
 * made for the blog and the rest of the site (see docs/visual-language.md).
 *
 * Writing mode offers them as a library. Picking one copies a web-sized WebP into the post's own
 * folder, so a post never depends on a file outside public/blog/<slug>/. Alt text comes from
 * `catalog.json` beside the masters — written once, against the picture, rather than retyped for
 * every post that uses it.
 */

const COLLECTION_DIRECTORY = path.join(process.cwd(), "assets", "visual-references", "analog-photography")
const CATALOG_PATH = path.join(COLLECTION_DIRECTORY, "catalog.json")

/** Wide enough for the collection grid on a 2x display, small enough to send eight at once. */
const THUMBNAIL_WIDTH = 480

export type CollectionImage = {
  /** The master's filename, e.g. `phone-on-sheet-music.png`. */
  file: string
  alt: string
}

type Catalog = Record<string, { alt?: unknown }>

async function readCatalog(): Promise<Catalog> {
  try {
    return JSON.parse(await readFile(CATALOG_PATH, "utf8")) as Catalog
  } catch {
    return {}
  }
}

function stem(name: string) {
  return path.parse(name).name
}

export async function listCollection(): Promise<CollectionImage[]> {
  const [names, catalog] = await Promise.all([readdir(COLLECTION_DIRECTORY).catch(() => []), readCatalog()])
  return names
    .filter((name) => name.toLowerCase().endsWith(".png"))
    .sort()
    .map((file) => {
      const alt = catalog[file]?.alt
      return { file, alt: typeof alt === "string" ? alt : "" }
    })
}

/**
 * The catalog's alt text for an image named after a master — `phone-on-sheet-music.webp` in a post
 * folder is the master `phone-on-sheet-music.png` — or undefined when it is not one of them.
 */
export async function collectionAlt(name: string): Promise<string | undefined> {
  const catalog = await readCatalog()
  const entry = Object.entries(catalog).find(([file]) => stem(file) === stem(name))
  const alt = entry?.[1].alt
  return typeof alt === "string" && alt.trim() !== "" ? alt : undefined
}

/** The master's bytes, or null for anything that is not a file in the collection. */
export async function readMaster(file: string): Promise<Buffer | null> {
  const masters = await listCollection()
  if (!masters.some((master) => master.file === file)) return null
  return readFile(path.join(COLLECTION_DIRECTORY, file))
}

export async function collectionThumbnail(file: string): Promise<Buffer | null> {
  const master = await readMaster(file)
  if (!master) return null
  const { default: sharp } = await import("sharp")
  return sharp(master).resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true }).webp({ quality: 70 }).toBuffer()
}
