import type { Route } from "next"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import type { Language } from "@/locales"

const copy = {
  en: {
    eyebrow: "chordlink",
    title: "You are on the list",
    body: "Your email address is confirmed. We will write once chordlink is available — and about nothing else. Every message we send has an unsubscribe link.",
  },
  de: {
    eyebrow: "chordlink",
    title: "Du stehst auf der Liste",
    body: "Deine E-Mail-Adresse ist bestätigt. Wir melden uns, sobald chordlink verfügbar ist — und sonst zu nichts. Jede Nachricht enthält einen Abmeldelink.",
  },
} as const

/**
 * Where the link in the confirmation mail lands. It is the first moment the signup is real, so it
 * says so plainly rather than thanking somebody for something that had not happened yet.
 */
export function ChordlinkNotifiedPage({ language }: { language: Language }) {
  const text = copy[language]
  const paths = { en: "/chordlink/notified" as Route, de: "/de/chordlink/notified" as Route }
  return (
    <main className="min-h-screen">
      <SiteHeader language={language} alternates={paths} />
      <article id="main-content" tabIndex={-1} className="mx-auto min-h-[55vh] w-full max-w-3xl px-6 py-20">
        <p className="font-mono text-sm text-muted-foreground">{text.eyebrow}</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight">{text.title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{text.body}</p>
      </article>
      <SiteFooter compact language={language} alternates={paths} />
    </main>
  )
}
