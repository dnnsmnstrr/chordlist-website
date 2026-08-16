import { execFile } from "node:child_process"
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { promisify } from "node:util"

const run = promisify(execFile)

/// Reads and writes the translation sources that live in the chordlist-app repository.
///
/// **Local development only.** Writing means a Node process with filesystem access to a sibling
/// checkout; on Vercel the filesystem is read-only and the app repository is not there at all.
/// Every entry point calls `assertEditable` first, so the editor cannot half-work in production —
/// it refuses outright, with a message that says why.
///
/// The app repository is located the same way `scripts/sync-app-assets.mjs` does it, so a checkout
/// that already syncs screenshots needs no further setup.

const websiteRoot = process.cwd()

export const appRepositoryPath = process.env.CHORDLIST_APP_REPO
  ? path.resolve(process.env.CHORDLIST_APP_REPO)
  : path.resolve(websiteRoot, "..", "chordlist-app")

export class TranslationStoreError extends Error {}

/// Runs one of the app repository's own scripts.
///
/// The editor writes the *sources* — `VOCABULARY.md`, `scripts/translations/<lang>.json` — and
/// then hands off to the script that derives everything else, rather than deriving it again here.
/// A second implementation of `build-vocabulary.py` in TypeScript is a second thing to keep
/// correct, and the whole point of the glossary is that one wording has one source.
///
/// Only reachable locally, so spawning a process costs nothing: the editor already requires a
/// checkout on disk.
async function runAppScript(script: string, args: string[] = []) {
  try {
    const { stderr } = await run("python3", [path.join(appRepositoryPath, script), ...args], {
      cwd: appRepositoryPath,
    })
    return stderr.trim()
  } catch (error) {
    const detail =
      error && typeof error === "object" && "stderr" in error
        ? String((error as { stderr: unknown }).stderr).trim()
        : String(error)
    throw new TranslationStoreError(`${script} failed:\n${detail}`)
  }
}

async function exists(filePath: string) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

/// Whether this process can actually write to the app repository, and why not when it cannot.
///
/// A result rather than an exception, because both failures are ordinary states — a deployment, or
/// a checkout without the app repository beside it — and the page renders an explanation for them.
/// Genuine I/O faults still throw and reach the error boundary, which is where they belong.
export async function editorAvailability(): Promise<
  { available: true } | { available: false; reason: string }
> {
  if (process.env.NODE_ENV === "production") {
    return {
      available: false,
      reason:
        "The translation editor only runs under `pnpm dev`. It writes files in the chordlist-app repository, which a deployed build cannot reach.",
    }
  }

  if (!(await exists(appRepositoryPath))) {
    return {
      available: false,
      reason: `No chordlist-app checkout at ${appRepositoryPath}. Clone it beside this repository, or set CHORDLIST_APP_REPO to its absolute path.`,
    }
  }

  return { available: true }
}

/// The same check for the route handlers, which do want to fail the request.
export async function assertEditable() {
  const availability = await editorAvailability()
  if (!availability.available) {
    throw new TranslationStoreError(availability.reason)
  }
}

// MARK: - Language wording

export type LanguageFile = {
  language: string
  translations: Record<string, string>
  plurals: Record<string, Record<string, Record<string, string>>>
}

const translationsDirectory = () => path.join(appRepositoryPath, "scripts", "translations")

/// Every language the app has wording for, by the files that exist rather than by a list.
export async function languageCodes(): Promise<string[]> {
  await assertEditable()
  const entries = await readdir(translationsDirectory())
  return entries
    .filter((entry) => entry.endsWith(".json"))
    .map((entry) => entry.replace(/\.json$/, ""))
    .sort()
}

export async function readLanguage(code: string): Promise<LanguageFile> {
  await assertEditable()
  const file = path.join(translationsDirectory(), `${code}.json`)
  if (!(await exists(file))) {
    throw new TranslationStoreError(`No translations for "${code}" at ${file}`)
  }
  return JSON.parse(await readFile(file, "utf8")) as LanguageFile
}

export async function writeLanguage(code: string, contents: LanguageFile) {
  await assertEditable()
  if (contents.language !== code) {
    throw new TranslationStoreError(
      `Refusing to write ${code}.json with language "${contents.language}".`,
    )
  }

  await mkdir(translationsDirectory(), { recursive: true })
  await writeFile(
    path.join(translationsDirectory(), `${code}.json`),
    `${JSON.stringify(contents, null, 2)}\n`,
    "utf8",
  )

  // Hands off to the applier, which settles the file's key order and pushes the wording into the
  // String Catalogs. Sorting here as well is how the two writers drifted the first time, and
  // running it means an edit reaches the app immediately rather than waiting for someone to
  // remember `sync-string-catalogs.sh`. A partly translated language is expected, not a failure.
  await runAppScript("scripts/apply-translations.py", ["--allow-untranslated"])
}

// MARK: - The catalog keys

/// Every string the app can show, read from the compiled-away String Catalogs.
///
/// The catalogs are the authority on which keys exist — it is what the Swift compiler extracted —
/// while the language files are the authority on their wording. A key present here and missing
/// from a language file is exactly what `apply-translations.py` reports as untranslated.
///
/// One row per *string*, not per catalog occurrence. Several strings appear in both the app and
/// the share extension — "Artist", "Title", the invalid-filename error — and a translation is
/// keyed by the string itself, so both catalogs share one piece of wording. Listing them twice
/// would show two rows that silently edit the same value.
export async function catalogKeys(): Promise<
  { key: string; catalogs: string[]; debugOnly: boolean }[]
> {
  await assertEditable()

  // Where each string was written, recorded by scripts/build-string-origins.py from the
  // compiler's own extraction. Absent when the app repository has not been synced since this was
  // introduced, in which case nothing is marked rather than everything being guessed at.
  let origins: Record<string, { files: string[]; debugOnly: boolean }> = {}
  const originsFile = path.join(appRepositoryPath, "string-origins.json")
  if (await exists(originsFile)) {
    origins = (
      JSON.parse(await readFile(originsFile, "utf8")) as {
        strings: Record<string, { files: string[]; debugOnly: boolean }>
      }
    ).strings
  }

  const sources = [
    { file: path.join(appRepositoryPath, "ChordListApp", "Localizable.xcstrings"), name: "app" },
    {
      file: path.join(appRepositoryPath, "ChordListAppShareExtension", "Localizable.xcstrings"),
      name: "share extension",
    },
  ]

  const byKey = new Map<string, string[]>()
  for (const { file, name } of sources) {
    if (!(await exists(file))) continue
    const parsed = JSON.parse(await readFile(file, "utf8")) as { strings: Record<string, unknown> }
    for (const key of Object.keys(parsed.strings)) {
      byKey.set(key, [...(byKey.get(key) ?? []), name])
    }
  }

  return [...byKey.entries()]
    .map(([key, catalogs]) => ({
      key,
      catalogs,
      debugOnly: origins[key]?.debugOnly ?? false,
    }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
}

// MARK: - The shared glossary

export type VocabularyTerm = {
  term: string
  translations: Record<string, string>
  match: "strict" | "loose"
  notes: string
}

export type VocabularyPhrase = {
  name: string
  translations: Record<string, string>
}

export type Vocabulary = {
  sourceLanguage: string
  languages: string[]
  terms: VocabularyTerm[]
  phrases: VocabularyPhrase[]
}

const vocabularyMarkdownPath = () => path.join(appRepositoryPath, "VOCABULARY.md")

export async function readVocabulary(): Promise<Vocabulary> {
  await assertEditable()
  const file = path.join(appRepositoryPath, "vocabulary.json")
  return JSON.parse(await readFile(file, "utf8")) as Vocabulary
}

/// Rewrites the `## Terms` and `## Phrases` tables in `VOCABULARY.md`, leaving the prose alone.
///
/// The Markdown is the source of truth and `vocabulary.json` is generated from it, so writing the
/// JSON directly would be writing the output and leaving the input behind. Editing the tables in
/// place keeps every sentence of guidance in the file — those are the part a person wrote.
export async function writeVocabulary(vocabulary: Vocabulary) {
  await assertEditable()

  const markdownPath = vocabularyMarkdownPath()
  const markdown = await readFile(markdownPath, "utf8")

  const termHeaders = ["Term", ...vocabulary.languages.filter((l) => l !== vocabulary.sourceLanguage), "Match", "Notes"]
  const termRows = vocabulary.terms.map((term) => [
    term.term,
    ...termHeaders.slice(1, -2).map((language) => term.translations[language] ?? ""),
    term.match,
    term.notes,
  ])

  const phraseHeaders = ["Phrase", ...vocabulary.languages]
  const phraseRows = vocabulary.phrases.map((phrase) => [
    phrase.name,
    ...vocabulary.languages.map((language) => phrase.translations[language] ?? ""),
  ])

  let updated = replaceTable(markdown, "Terms", termHeaders, termRows)
  updated = replaceTable(updated, "Phrases", phraseHeaders, phraseRows)

  await writeFile(markdownPath, updated, "utf8")

  // The Markdown is the source; `vocabulary.json` is derived from it. Deriving it here as well
  // would be a second implementation to keep in step with the first, so the generator is run
  // instead — the same one a person runs by hand.
  await runAppScript("scripts/build-vocabulary.py")
}

/// Swaps the table under `## <heading>` for a freshly rendered one, keeping everything around it.
function replaceTable(markdown: string, heading: string, headers: string[], rows: string[][]) {
  const headingIndex = markdown.indexOf(`## ${heading}`)
  if (headingIndex === -1) {
    throw new TranslationStoreError(`VOCABULARY.md has no "## ${heading}" section`)
  }

  const after = markdown.slice(headingIndex)
  const nextHeadingOffset = after.indexOf("\n## ", 1)
  const section = nextHeadingOffset === -1 ? after : after.slice(0, nextHeadingOffset)

  const lines = section.split("\n")
  const firstRow = lines.findIndex((line) => line.trimStart().startsWith("|"))
  if (firstRow === -1) {
    throw new TranslationStoreError(`The "${heading}" section has no table`)
  }
  let lastRow = firstRow
  while (lastRow + 1 < lines.length && (lines[lastRow + 1] ?? "").trimStart().startsWith("|")) {
    lastRow += 1
  }

  const escape = (cell: string) => cell.replace(/\|/g, "\\|")
  const table = [
    `| ${headers.map(escape).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escape).join(" | ")} |`),
  ]

  const rebuilt = [...lines.slice(0, firstRow), ...table, ...lines.slice(lastRow + 1)].join("\n")
  return markdown.slice(0, headingIndex) + rebuilt + (nextHeadingOffset === -1 ? "" : after.slice(nextHeadingOffset))
}
