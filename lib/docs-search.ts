import { plainInlineText } from "@/lib/inline-markup"
import { matchesSearchTokens, searchSnippet, searchTokens } from "@/lib/text-search"
import { docsCopy } from "@/locales/en"

type SectionKey = keyof typeof docsCopy.sections

/**
 * The anchor each section of /docs renders under. The page reads its ids from here and the search
 * links to them, so the two cannot drift; a new section does not compile until it has one.
 */
export const docsSectionIds = {
  gettingStarted: "getting-started",
  library: "library",
  playing: "playing",
  addingSongs: "adding-songs",
  chords: "chords",
  chordPro: "chordpro",
  fileFormat: "file-format",
  otherApps: "other-apps",
  obsidian: "obsidian",
  offline: "offline",
  unlimited: "unlimited",
  troubleshooting: "troubleshooting",
} as const satisfies Record<SectionKey, string>

/**
 * The annotated screenshots, named by the section whose `callouts` explain them. The ids prefix
 * every marker and callout, so a marker, its explanation, and a search result all agree.
 */
export const docsFigureIds = {
  playing: "playing",
  addingSongs: "adding",
  unlimited: "unlock",
} as const satisfies Partial<Record<SectionKey, string>>

/** The id of marker `number` on a figure's screenshot. */
export function screenshotMarkerId(figureId: string, number: number): string {
  return `${figureId}-marker-${number}`
}

/** The id of callout `number` in a figure's list. */
export function screenshotCalloutId(figureId: string, number: number): string {
  return `${figureId}-callout-${number}`
}

/** The id of one question in a section's collapsible list, shared by the page and the search. */
export function docsQuestionId(section: SectionKey, index: number): string {
  return `${docsSectionIds[section]}-question-${index + 1}`
}

export type DocsSearchEntry = {
  /** Where a result jumps to: a question's own id, or else its section. */
  targetId: string
  /** Whether the target is a closed-by-default `<details>` that has to be opened on arrival. */
  isQuestion: boolean
  section: string
  title: string
  text: string
  /** Words this entry also matches on, and that nothing renders. */
  keywords: readonly string[]
}

/**
 * Keys whose strings repeat what the reader sees elsewhere, or name a thing rather than say
 * something: alt text describes a screenshot the callouts already explain.
 */
const skippedKeys = new Set(["alt", "keywords", "fieldsColumns"])

type Collected = { title: string; text: string; questionIndex?: number; calloutIndex?: number }

/**
 * Every passage of one section as its own entry, so a result can quote the sentence that matched
 * instead of the whole section. An object with a `title` and `body`, or a `question` and `answer`,
 * is one passage under its own title; every other string is a passage under the section's title.
 */
function collect(
  value: unknown,
  sectionTitle: string,
  out: Collected[],
  key?: string,
  index?: number,
  listKey?: string,
): void {
  if (key !== undefined && skippedKeys.has(key)) return

  if (typeof value === "string") {
    out.push({ title: sectionTitle, text: plainInlineText(value) })
    return
  }

  if (Array.isArray(value)) {
    // A list of short names — the section headings — reads as one passage, not one per chip.
    if (value.every((item) => typeof item === "string" && item.length <= 24)) {
      out.push({ title: sectionTitle, text: value.join(", ") })
      return
    }
    value.forEach((item, itemIndex) => collect(item, sectionTitle, out, undefined, itemIndex, key))
    return
  }

  if (value === null || typeof value !== "object") return

  const record = value as Record<string, unknown>
  if (typeof record.question === "string" && typeof record.answer === "string") {
    out.push({ title: plainInlineText(record.question), text: plainInlineText(record.answer), questionIndex: index })
    return
  }
  if (typeof record.title === "string" && typeof record.body === "string") {
    // A chord example is found by what it shows as well as by what it says.
    const code = typeof record.code === "string" ? ` ${record.code}` : ""
    out.push({
      title: plainInlineText(record.title),
      text: plainInlineText(record.body) + code,
      calloutIndex: listKey === "callouts" ? index : undefined,
    })
    return
  }
  if (typeof record.field === "string" && typeof record.purpose === "string") {
    out.push({ title: record.field, text: plainInlineText(record.purpose) })
    return
  }

  for (const [childKey, child] of Object.entries(record)) {
    // A section's own title is the label on every result, not a passage of its own.
    if (childKey === "title" && key === undefined && index === undefined) continue
    collect(child, sectionTitle, out, childKey)
  }
}

/** Every searchable passage on /docs, in page order. */
export function docsSearchEntries(): DocsSearchEntry[] {
  const entries: DocsSearchEntry[] = []

  for (const sectionKey of Object.keys(docsSectionIds) as SectionKey[]) {
    const section: { title: string; keywords?: readonly string[] } = docsCopy.sections[sectionKey]
    const collected: Collected[] = []
    collect(section, section.title, collected)

    const seen = new Set<string>()
    collected.forEach((passage, passageIndex) => {
      const signature = `${passage.title}\n${passage.text}`
      if (seen.has(signature)) return
      seen.add(signature)

      entries.push({
        targetId: passageTargetId(sectionKey, passage),
        isQuestion: passage.questionIndex !== undefined,
        section: section.title,
        title: passage.title,
        text: passage.text,
        // The section's aliases ride on its first passage, so "price" reaches the section once
        // rather than listing every sentence in it.
        keywords: passageIndex === 0 ? (section.keywords ?? []) : [],
      })
    })
  }

  return entries
}

/** The most precise place a passage can be jumped to: its question, its callout, or its section. */
function passageTargetId(sectionKey: SectionKey, passage: Collected): string {
  if (passage.questionIndex !== undefined) return docsQuestionId(sectionKey, passage.questionIndex)

  const figureId: string | undefined = (docsFigureIds as Partial<Record<SectionKey, string>>)[sectionKey]
  if (figureId && passage.calloutIndex !== undefined) return screenshotCalloutId(figureId, passage.calloutIndex + 1)

  return docsSectionIds[sectionKey]
}

function entrySearchText(entry: DocsSearchEntry): string {
  return [entry.section, entry.title, entry.text, ...entry.keywords].join(" ")
}

/**
 * The entries matching a query: every token has to appear somewhere in the passage, its title, its
 * section's name, or its aliases. Ranked by where the words are, then page order: a passage whose
 * own title matches first, because a query that names a feature wants the place that explains it;
 * then passages whose visible words match; last, ones found only through a section's aliases,
 * whose quoted sentence would show none of the words the reader typed.
 */
export function searchDocs(entries: readonly DocsSearchEntry[], query: string): DocsSearchEntry[] {
  const tokens = searchTokens(query)
  if (tokens.length === 0) return []

  const rank = (entry: DocsSearchEntry): number => {
    if (matchesSearchTokens(`${entry.section} ${entry.title}`, tokens) && entry.title !== entry.section) return 0
    if (matchesSearchTokens(`${entry.section} ${entry.title} ${entry.text}`, tokens)) return 1
    return 2
  }

  return entries
    .filter((entry) => matchesSearchTokens(entrySearchText(entry), tokens))
    .map((entry, order) => ({ entry, order, rank: rank(entry) }))
    .sort((left, right) => left.rank - right.rank || left.order - right.order)
    .map(({ entry }) => entry)
}

/** A window of the passage around its first match. See `searchSnippet` in lib/text-search.ts. */
export function docsSnippet(text: string, tokens: readonly string[], length = 140): string {
  return searchSnippet(text, tokens, length)
}
