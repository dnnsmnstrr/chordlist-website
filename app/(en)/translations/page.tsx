import { notFound } from "next/navigation"

import { TranslationEditor } from "@/components/translation-editor"
import {
  appRepositoryPath,
  catalogKeys,
  editorAvailability,
  languageCodes,
  readLanguage,
  readVocabulary,
} from "@/lib/translations/store"
import { requireAdmin } from "@/lib/server/admin-auth"

/// The translation editor.
///
/// A local authoring tool rather than part of the site: it edits files in the chordlist-app
/// checkout beside this one. `notFound()` in production keeps it off the deployed site entirely —
/// the route 404s rather than rendering a table it could never save.
///
/// The data is read here on the server rather than fetched from the client, so the table arrives
/// populated and the client component owns nothing but edits. Writes call `router.refresh()`,
/// which re-runs this and pushes the new values down.
export const dynamic = "force-dynamic"

export const metadata = {
  title: "Translations",
  robots: { index: false, follow: false },
}

export default async function TranslationsPage() {
  await requireAdmin("/translations")
  if (process.env.NODE_ENV === "production") {
    notFound()
  }

  const availability = await editorAvailability()

  if (!availability.available) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Translations</h1>
        <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          {availability.reason}
        </p>
      </main>
    )
  }

  const codes = await languageCodes()
  const wording = Object.fromEntries(
    await Promise.all(codes.map(async (code) => [code, await readLanguage(code)] as const)),
  )

  return (
    <TranslationEditor
      data={{
        appRepositoryPath,
        languages: codes,
        keys: await catalogKeys(),
        wording,
        vocabulary: await readVocabulary(),
      }}
    />
  )
}
