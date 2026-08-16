import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { NextResponse } from "next/server"

import {
  TranslationStoreError,
  appRepositoryPath,
  assertEditable,
  languageCodes,
  readVocabulary,
  writeLanguage,
  writeVocabulary,
} from "@/lib/translations/store"

export const dynamic = "force-dynamic"

/// Provisions a new language across everything that can be provisioned automatically.
///
/// Deliberately not everything. Two steps are left to a person and reported back rather than
/// attempted:
///
/// - `knownRegions` in the Xcode project, because editing `project.pbxproj` from a web form to
///   save one line is a bad trade against the chance of corrupting it.
/// - A fixture set in `ScreenshotFixtureCatalog`, because those are songs a speaker of the
///   language has to choose; scaffolding them would only produce placeholder text to delete.
///
/// Everything it does write leaves the language *empty*, not machine-translated. An untranslated
/// key is visible — `apply-translations.py` lists it and the build fails — whereas a plausible
/// wrong translation is not.
export async function POST(request: Request) {
  try {
    await assertEditable()

    const { code, name } = (await request.json()) as { code: string; name?: string }

    if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(code)) {
      throw new TranslationStoreError(
        `"${code}" is not a language code. Expected something like "fr" or "pt-BR".`,
      )
    }

    const existing = await languageCodes()
    if (existing.includes(code)) {
      throw new TranslationStoreError(`${code} already exists in scripts/translations/.`)
    }

    // 1. An empty wording file. Plurals are seeded from the keys English already varies, so the
    //    categories are present and only need filling in.
    const english = JSON.parse(
      await readFile(path.join(appRepositoryPath, "scripts", "translations", "de.json"), "utf8"),
    ) as { plurals: Record<string, Record<string, Record<string, string>>> }

    const plurals: Record<string, Record<string, Record<string, string>>> = {}
    for (const [key, byLanguage] of Object.entries(english.plurals)) {
      const categories = byLanguage.en ?? { one: "", other: "" }
      plurals[key] = {
        en: categories,
        [code]: Object.fromEntries(Object.keys(categories).map((category) => [category, ""])),
      }
    }

    await writeLanguage(code, {
      language: code,
      translations: {},
      plurals,
    })

    // 2. A column in the glossary, empty for the new language.
    const vocabulary = await readVocabulary()
    if (!vocabulary.languages.includes(code)) {
      vocabulary.languages = [...vocabulary.languages, code]
    }
    for (const term of vocabulary.terms) {
      term.translations[code] = term.translations[code] ?? ""
    }
    for (const phrase of vocabulary.phrases) {
      phrase.translations[code] = phrase.translations[code] ?? ""
    }
    await writeVocabulary(vocabulary)

    // 3. Register it with the applier.
    const applierPath = path.join(appRepositoryPath, "scripts", "apply-translations.py")
    const applier = await readFile(applierPath, "utf8")
    const codes = [...existing, code].map((c) => `"${c}"`).join(", ")
    const updated = applier.replace(/^LANGUAGES = \[.*\]$/m, `LANGUAGES = [${codes}]`)
    if (updated === applier) {
      throw new TranslationStoreError(
        "Could not find the LANGUAGES line in apply-translations.py; add the code by hand.",
      )
    }
    await writeFile(applierPath, updated, "utf8")

    return NextResponse.json({
      ok: true,
      code,
      name: name ?? code,
      wrote: [
        `scripts/translations/${code}.json`,
        "VOCABULARY.md",
        "vocabulary.json",
        "scripts/apply-translations.py",
      ],
      // Surfaced in the UI rather than buried, because a language is not shippable until these
      // are done and nothing else will remind anyone.
      manualSteps: [
        `Add \`${code}\` to knownRegions in ChordListApp.xcodeproj/project.pbxproj.`,
        `Add a \`${code}\` case to the language switch in scripts/capture-screenshots.sh, with its region and keyboard.`,
        `Add a fixture set to ScreenshotFixtureCatalog and a branch in current(forLocalization:) — songs a speaker of the language would recognise.`,
        `Copy locales/de.ts to locales/${code}.ts in the website repository and translate it.`,
        `Run scripts/sync-string-catalogs.sh in the app repository to write the new language into the String Catalogs.`,
      ],
    })
  } catch (error) {
    if (error instanceof TranslationStoreError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
