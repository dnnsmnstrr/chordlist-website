"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"

type LanguageFile = {
  language: string
  translations: Record<string, string>
  plurals: Record<string, Record<string, Record<string, string>>>
}

type VocabularyTerm = {
  term: string
  translations: Record<string, string>
  match: "strict" | "loose"
  notes: string
}

type VocabularyPhrase = { name: string; translations: Record<string, string> }

type Vocabulary = {
  sourceLanguage: string
  languages: string[]
  terms: VocabularyTerm[]
  phrases: VocabularyPhrase[]
}

type EditorData = {
  appRepositoryPath: string
  languages: string[]
  keys: { key: string; catalogs: string[]; debugOnly: boolean }[]
  wording: Record<string, LanguageFile>
  vocabulary: Vocabulary
}

type SaveState = "idle" | "saving" | "saved" | "failed"

/// The translation editor.
///
/// Every edit writes straight through to the file it came from — there is no separate save step,
/// because a staged buffer that can disagree with disk is exactly the drift this whole mechanism
/// exists to prevent. The row shows what happened to each write.
export function TranslationEditor({ data }: { data: EditorData }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [tab, setTab] = useState<"strings" | "vocabulary">("strings")

  // A write changes files the page read on the server, so the page is what has to re-read them.
  const load = () => startTransition(() => router.refresh())

  return (
    <main className="mx-auto max-w-[110rem] px-6 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Translations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Editing files in <code className="text-xs">{data.appRepositoryPath}</code>. Changes are
          written as you leave a field; commit them in that repository.
          {pending && <span className="ml-2 text-xs">Reloading…</span>}
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Button variant={tab === "strings" ? "default" : "outline"} onClick={() => setTab("strings")}>
          App strings
        </Button>
        <Button
          variant={tab === "vocabulary" ? "default" : "outline"}
          onClick={() => setTab("vocabulary")}
        >
          Shared vocabulary
        </Button>
        <div className="ml-auto">
          <AddLanguage onAdded={load} existing={data.languages} />
        </div>
      </div>

      {tab === "strings" ? (
        <StringsTable data={data} onChanged={load} />
      ) : (
        <VocabularyTable data={data} onChanged={load} />
      )}
    </main>
  )
}

// MARK: - App strings

function StringsTable({ data, onChanged }: { data: EditorData; onChanged: () => void }) {
  const [query, setQuery] = useState("")
  const [untranslatedOnly, setUntranslatedOnly] = useState(false)
  // Debug wording is only ever read by whoever is holding the debugger, so it is noise while
  // translating the app. Hidden by default, and counted separately below so it is not simply
  // forgotten.
  const [showDebug, setShowDebug] = useState(false)

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return data.keys.filter(({ key, debugOnly }) => {
      if (debugOnly && !showDebug) return false
      if (untranslatedOnly) {
        const missing = data.languages.some(
          (language) =>
            !data.wording[language]?.translations[key] && !data.wording[language]?.plurals[key],
        )
        if (!missing) return false
      }
      if (!needle) return true
      if (key.toLowerCase().includes(needle)) return true
      return data.languages.some((language) =>
        (data.wording[language]?.translations[key] ?? "").toLowerCase().includes(needle),
      )
    })
  }, [data, query, untranslatedOnly, showDebug])

  const debugCount = useMemo(() => data.keys.filter((row) => row.debugOnly).length, [data])

  const untranslatedCount = useMemo(
    () =>
      data.keys.filter(({ key }) =>
        data.languages.some(
          (language) =>
            !data.wording[language]?.translations[key] && !data.wording[language]?.plurals[key],
        ),
      ).length,
    [data],
  )

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by English or translation…"
          className="h-9 w-80 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={untranslatedOnly}
            onChange={(event) => setUntranslatedOnly(event.target.checked)}
          />
          Untranslated only
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showDebug}
            onChange={(event) => setShowDebug(event.target.checked)}
          />
          Show debug strings ({debugCount})
        </label>
        <p className="ml-auto text-sm text-muted-foreground">
          {rows.length} of {data.keys.length} strings
          {untranslatedCount > 0 ? ` · ${untranslatedCount} untranslated` : " · all translated"}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-[38%] px-3 py-2 text-left font-medium">English (the key)</th>
              {data.languages.map((language) => (
                <th key={language} className="px-3 py-2 text-left font-medium uppercase">
                  {language}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ key, catalogs, debugOnly }) => (
              <tr key={key} className="border-t border-border align-top">
                <td className="px-3 py-2">
                  <span className="whitespace-pre-wrap break-words">{key}</span>
                  {catalogs
                    .filter((catalog) => catalog !== "app")
                    .map((catalog) => (
                      <span
                        key={catalog}
                        className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {catalog}
                      </span>
                    ))}
                  {debugOnly && (
                    <span
                      className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 text-xs text-amber-600 dark:text-amber-400"
                      title="Only compiled into debug builds — nobody using the app will read this."
                    >
                      debug
                    </span>
                  )}
                </td>
                {data.languages.map((language) => (
                  <td key={language} className="px-3 py-2">
                    <TranslationCell
                      language={language}
                      translationKey={key}
                      file={data.wording[language]}
                      onSaved={onChanged}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

/// One editable cell. Plurals render a field per category, because a plural key has no single
/// value to show — collapsing them to one box would quietly lose "one".
function TranslationCell({
  language,
  translationKey,
  file,
  onSaved,
}: {
  language: string
  translationKey: string
  file: LanguageFile | undefined
  onSaved: () => void
}) {
  const plural = file?.plurals[translationKey]?.[language]

  if (plural) {
    return (
      <div className="space-y-1">
        {Object.entries(plural).map(([category, value]) => (
          <div key={category} className="flex items-center gap-2">
            <span className="w-10 shrink-0 text-xs text-muted-foreground">{category}</span>
            <SavingField
              value={value}
              onSave={(next) =>
                save({ kind: "plural", language, key: translationKey, category, value: next })
              }
              onSaved={onSaved}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <SavingField
      value={file?.translations[translationKey] ?? ""}
      onSave={(next) => save({ kind: "string", language, key: translationKey, value: next })}
      onSaved={onSaved}
    />
  )
}

async function save(edit: unknown) {
  const response = await fetch("/api/translations", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(edit),
  })
  if (!response.ok) {
    const payload = await response.json()
    throw new Error(payload.error ?? "Could not write the change.")
  }
}

/// A field that writes on blur and says whether it worked.
function SavingField({
  value,
  onSave,
  onSaved,
}: {
  value: string
  onSave: (next: string) => Promise<void>
  onSaved: () => void
}) {
  const [draft, setDraft] = useState(value)
  const [state, setState] = useState<SaveState>("idle")
  const [message, setMessage] = useState<string | null>(null)

  // Re-seed the field when the file underneath changes — after a reload, or after another cell's
  // write. Adjusted during render rather than in an effect, so the new value is shown in the same
  // pass instead of rendering the stale one first.
  const [lastValue, setLastValue] = useState(value)
  if (value !== lastValue) {
    setLastValue(value)
    setDraft(value)
  }

  const commit = async () => {
    if (draft === value) return
    setState("saving")
    try {
      await onSave(draft)
      setState("saved")
      setMessage(null)
      onSaved()
    } catch (error) {
      setState("failed")
      setMessage(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <div>
      <textarea
        rows={Math.min(4, Math.max(1, Math.ceil(draft.length / 48)))}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        className={`w-full resize-y rounded-md border bg-background px-2 py-1 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
          state === "failed"
            ? "border-destructive"
            : draft.trim() === ""
              ? "border-amber-500/60"
              : "border-border"
        }`}
      />
      {state === "saving" && <p className="mt-0.5 text-xs text-muted-foreground">Saving…</p>}
      {state === "saved" && <p className="mt-0.5 text-xs text-muted-foreground">Saved</p>}
      {state === "failed" && message && (
        <p className="mt-0.5 text-xs text-destructive">{message}</p>
      )}
    </div>
  )
}

// MARK: - Vocabulary

function VocabularyTable({ data, onChanged }: { data: EditorData; onChanged: () => void }) {
  const { vocabulary } = data
  const translated = vocabulary.languages.filter((l) => l !== vocabulary.sourceLanguage)
  const [message, setMessage] = useState<string | null>(null)

  const write = async (next: Vocabulary) => {
    const response = await fetch("/api/translations", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "vocabulary", vocabulary: next }),
    })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error ?? "Could not write VOCABULARY.md.")
    setMessage("Wrote VOCABULARY.md — run scripts/build-vocabulary.py to regenerate the JSON.")
    onChanged()
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        Wording shared with the app, the App Store listing and the press kit. A change here is
        enforced by <code className="text-xs">VocabularyTests</code>, so the app build fails until
        its strings agree.
      </p>
      {message && (
        <p className="mb-4 rounded-lg border border-border bg-muted/40 p-3 text-sm">{message}</p>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Term</th>
              {translated.map((language) => (
                <th key={language} className="px-3 py-2 text-left font-medium uppercase">
                  {language}
                </th>
              ))}
              <th className="px-3 py-2 text-left font-medium">Match</th>
              <th className="px-3 py-2 text-left font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {vocabulary.terms.map((term, index) => (
              <tr key={term.term} className="border-t border-border align-top">
                <td className="px-3 py-2 font-medium">{term.term}</td>
                {translated.map((language) => (
                  <td key={language} className="px-3 py-2">
                    <SavingField
                      value={term.translations[language] ?? ""}
                      onSave={async (next) => {
                        const copy = structuredClone(vocabulary)
                        const row = copy.terms[index]
                        if (!row) return
                        row.translations[language] = next
                        await write(copy)
                      }}
                      onSaved={() => {}}
                    />
                  </td>
                ))}
                <td className="px-3 py-2 text-xs text-muted-foreground">{term.match}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{term.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 mb-3 text-lg font-semibold">Phrases</h2>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Phrase</th>
              {vocabulary.languages.map((language) => (
                <th key={language} className="px-3 py-2 text-left font-medium uppercase">
                  {language}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vocabulary.phrases.map((phrase, index) => (
              <tr key={phrase.name} className="border-t border-border align-top">
                <td className="px-3 py-2 font-medium">{phrase.name}</td>
                {vocabulary.languages.map((language) => (
                  <td key={language} className="px-3 py-2">
                    <SavingField
                      value={phrase.translations[language] ?? ""}
                      onSave={async (next) => {
                        const copy = structuredClone(vocabulary)
                        const row = copy.phrases[index]
                        if (!row) return
                        row.translations[language] = next
                        await write(copy)
                      }}
                      onSaved={() => {}}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// MARK: - Provisioning

function AddLanguage({ existing, onAdded }: { existing: string[]; onAdded: () => void }) {
  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ manualSteps: string[]; wrote: string[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const add = async () => {
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const response = await fetch("/api/translations/languages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? "Could not add the language.")
      setResult(payload)
      setCode("")
      onAdded()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="text-right">
      <div className="flex items-center gap-2">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="fr"
          className="h-9 w-20 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button onClick={add} disabled={busy || code.trim() === "" || existing.includes(code.trim())}>
          {busy ? "Adding…" : "Add language"}
        </Button>
      </div>
      {error && <p className="mt-2 max-w-md text-xs text-destructive">{error}</p>}
      {result && (
        <div className="mt-3 max-w-lg rounded-lg border border-border bg-muted/40 p-3 text-left text-xs">
          <p className="font-medium">Wrote {result.wrote.join(", ")}.</p>
          <p className="mt-2 font-medium">Still to do by hand:</p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-muted-foreground">
            {result.manualSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
