import { NextResponse } from "next/server"

import {
  TranslationStoreError,
  appRepositoryPath,
  assertEditable,
  catalogKeys,
  languageCodes,
  readLanguage,
  readVocabulary,
  writeLanguage,
  writeVocabulary,
  type Vocabulary,
} from "@/lib/translations/store"
import { refuseUnlessAdmin } from "@/lib/server/admin-auth"

/// The translation editor's data, read and written on the local filesystem.
///
/// Never statically rendered and never cached: it reflects files that change while the dev server
/// is running. Deployed builds refuse it outright — see `assertEditable`.
export const dynamic = "force-dynamic"

function failure(error: unknown) {
  if (error instanceof TranslationStoreError) {
    return NextResponse.json({ error: error.message }, { status: 409 })
  }
  const message = error instanceof Error ? error.message : String(error)
  return NextResponse.json({ error: message }, { status: 500 })
}

export async function GET() {
  const refusal = await refuseUnlessAdmin()
  if (refusal) return refusal

  try {
    await assertEditable()

    const codes = await languageCodes()
    const languages = Object.fromEntries(
      await Promise.all(codes.map(async (code) => [code, await readLanguage(code)] as const)),
    )

    return NextResponse.json({
      appRepositoryPath,
      languages: codes,
      keys: await catalogKeys(),
      wording: languages,
      vocabulary: await readVocabulary(),
    })
  } catch (error) {
    return failure(error)
  }
}

type Edit =
  | { kind: "string"; language: string; key: string; value: string }
  | { kind: "plural"; language: string; key: string; category: string; value: string }
  | { kind: "vocabulary"; vocabulary: Vocabulary }

export async function PATCH(request: Request) {
  const refusal = await refuseUnlessAdmin()
  if (refusal) return refusal

  try {
    await assertEditable()
    const edit = (await request.json()) as Edit

    if (edit.kind === "vocabulary") {
      await writeVocabulary(edit.vocabulary)
      return NextResponse.json({ ok: true, wrote: "VOCABULARY.md, vocabulary.json" })
    }

    const file = await readLanguage(edit.language)

    if (edit.kind === "string") {
      // An emptied field removes the key rather than storing "", so the string shows up as
      // untranslated in apply-translations.py instead of silently rendering as blank in the app.
      if (edit.value.trim() === "") {
        delete file.translations[edit.key]
      } else {
        file.translations[edit.key] = edit.value
      }
    } else {
      const categories = file.plurals[edit.key]?.[edit.language]
      if (!categories) {
        throw new TranslationStoreError(
          `"${edit.key}" is not a plural in ${edit.language}. Plural categories are added by editing the language file directly.`,
        )
      }
      categories[edit.category] = edit.value
    }

    await writeLanguage(edit.language, file)
    return NextResponse.json({
      ok: true,
      wrote: `scripts/translations/${edit.language}.json, and the String Catalogs`,
    })
  } catch (error) {
    return failure(error)
  }
}
