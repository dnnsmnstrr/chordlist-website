import "server-only"

import { readFile, readdir } from "node:fs/promises"
import path from "node:path"

import { parse as parseYaml } from "yaml"

import { splitFrontmatter } from "@/lib/frontmatter"
import {
  emptyDefinition,
  screenshotNames,
  type MotionDefinition,
} from "@/video/src/motion/custom/schema"

/**
 * Every content/social definition as a starting point for a motion definition: the same words,
 * the nearest template, and the same screenshot or photograph. A quote has no motion template of
 * its own, so it starts as a statement of the line it quotes.
 */
export type SocialStart = { slug: string; definition: MotionDefinition; caption: string }

const strings = (value: unknown) => (Array.isArray(value) ? value.map(String) : [])

function toDefinition(data: Record<string, unknown>): MotionDefinition {
  const template = String(data.template ?? "statement")
  const theme = data.theme === "paper" || data.theme === "blueprint" ? data.theme : "ink"
  const base: MotionDefinition = {
    ...emptyDefinition,
    campaign: theme,
    eyebrow: String(data.eyebrow ?? "").slice(0, 24),
    headline: strings(data.headline).slice(0, 4),
    footnote: String(data.footnote ?? "").slice(0, 60),
  }
  if (base.headline.length === 0) base.headline = [""]

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

export async function listSocialStarts(): Promise<SocialStart[]> {
  const directory = path.join(process.cwd(), "content", "social")
  const files = (await readdir(directory).catch(() => [])).filter((file) => file.endsWith(".md")).sort()
  const starts: SocialStart[] = []
  for (const file of files) {
    const { frontmatter, body } = splitFrontmatter(await readFile(path.join(directory, file), "utf8"))
    if (frontmatter === null) continue
    try {
      const data = (parseYaml(frontmatter) ?? {}) as Record<string, unknown>
      if (data.draft === true) continue
      starts.push({ slug: file.replace(/\.md$/, ""), definition: toDefinition(data), caption: body })
    } catch {
      // A malformed still fails pnpm build:social loudly; here it only costs one starting point.
    }
  }
  return starts
}
