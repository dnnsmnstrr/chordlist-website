import "server-only"

import { readFile, readdir } from "node:fs/promises"
import path from "node:path"

import { parse as parseYaml } from "yaml"

import { splitFrontmatter } from "@/lib/frontmatter"
import {
  emptyDefinition,
  screenshotNames,
  type StoredDefinition,
} from "@/video/src/motion/custom/schema"
import { findSnippet, type SnippetCatalog, type SnippetKind } from "@/video/src/motion/custom/snippets"

/**
 * Every content/social definition as a starting point for a motion definition: the nearest
 * template, the same screenshot or photograph, and the same words — linked to the still as
 * snippets, so a change to the still's wording reaches the video on its next render. A quote has
 * no motion template of its own, so it starts as a statement of the line it quotes.
 */
export type SocialStart = { slug: string; definition: StoredDefinition; caption: string }

const strings = (value: unknown) => (Array.isArray(value) ? value.map(String) : [])

function toDefinition(slug: string, data: Record<string, unknown>, catalog: SnippetCatalog): StoredDefinition {
  const template = String(data.template ?? "statement")
  const theme = data.theme === "paper" || data.theme === "blueprint" ? data.theme : "ink"
  // Linked where the still's wording fits the field; copied (and trimmed) where it does not.
  const link = <T,>(kind: SnippetKind, fallback: T) =>
    findSnippet(catalog, kind, `social/${slug}`) ? { snippet: `social/${slug}` } : fallback
  const headline = strings(data.headline).slice(0, 4)
  const base: StoredDefinition = {
    ...emptyDefinition,
    campaign: theme,
    eyebrow: link("eyebrow", String(data.eyebrow ?? "").slice(0, 24)),
    headline: link("headline", headline.length > 0 ? headline : [""]),
    footnote: link("footnote", String(data.footnote ?? "").slice(0, 60)),
  }

  switch (template) {
    case "screenshot": {
      const name = String(data.screenshot ?? "").replace(/\.png$/, "")
      const known = (screenshotNames as readonly string[]).includes(name)
      return {
        ...base,
        template: "screen",
        media: known ? { kind: "screenshot", name: name as (typeof screenshotNames)[number] } : { kind: "none" },
      }
    }
    case "progression":
      return {
        ...base,
        template: "progression",
        chords: strings(data.chords).slice(0, 6),
        numerals: String(data.numerals ?? ""),
      }
    case "file":
      return {
        ...base,
        template: "file",
        filename: String(data.filename ?? "").slice(0, 40),
        fileLines: [...strings(data.frontmatter), ...(data.frontmatter ? [""] : []), ...strings(data.lines)].slice(0, 18),
      }
    case "photo":
      return { ...base, template: "photo", media: { kind: "photo", file: String(data.photo ?? "") } }
    default:
      return { ...base, template: "statement" }
  }
}

export async function listSocialStarts(catalog: SnippetCatalog): Promise<SocialStart[]> {
  const directory = path.join(process.cwd(), "content", "social")
  const files = (await readdir(directory).catch(() => [])).filter((file) => file.endsWith(".md")).sort()
  const starts: SocialStart[] = []
  for (const file of files) {
    const { frontmatter, body } = splitFrontmatter(await readFile(path.join(directory, file), "utf8"))
    if (frontmatter === null) continue
    try {
      const data = (parseYaml(frontmatter) ?? {}) as Record<string, unknown>
      if (data.draft === true) continue
      const slug = file.replace(/\.md$/, "")
      starts.push({ slug, definition: toDefinition(slug, data, catalog), caption: body })
    } catch {
      // A malformed still fails pnpm build:social loudly; here it only costs one starting point.
    }
  }
  return starts
}
