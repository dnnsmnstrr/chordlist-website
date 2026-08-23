import type { Route } from "next"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import type { Language } from "@/locales"

const copy = {
  en: { eyebrow: "chordlink", title: "Thank you", body: "Your order is confirmed. You’ll receive shipping details and your personal chordlist unlimited redemption link by email." },
  de: { eyebrow: "chordlink", title: "Danke", body: "Deine Bestellung ist bestätigt. Du erhältst Versandinformationen und deinen persönlichen Einlöse-Link für chordlist unlimited per E-Mail." },
} as const

export function ChordlinkThanksPage({ language }: { language: Language }) {
  const text = copy[language]
  const paths = { en: "/chordlink/thanks" as Route, de: "/de/chordlink/thanks" as Route }
  return <main className="min-h-screen"><SiteHeader language={language} alternates={paths} /><article id="main-content" tabIndex={-1} className="mx-auto min-h-[55vh] w-full max-w-3xl px-6 py-20"><p className="font-mono text-sm text-muted-foreground">{text.eyebrow}</p><h1 className="mt-3 text-5xl font-semibold tracking-tight">{text.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{text.body}</p></article><SiteFooter compact language={language} alternates={paths} /></main>
}
