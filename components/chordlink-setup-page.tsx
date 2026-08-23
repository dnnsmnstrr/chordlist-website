import type { Route } from "next"
import { Download, Library, Music2, Nfc, Shuffle } from "lucide-react"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { buttonVariants } from "@/components/ui/button"
import { primaryAppLink } from "@/lib/site-config"
import { cn } from "@/lib/utils"
import type { Language } from "@/locales"

const copy = {
  en: {
    eyebrow: "Set up chordlink",
    title: "Open the link on your iPhone",
    intro: "If chordlist is installed, scanning your chordlink opens the app and asks what this tag should do. Your choice stays on your device and can be changed in Settings.",
    app: "Get chordlist",
    scan: "Then scan your chordlink again",
    options: ["Open the library", "Shuffle your songs", "Add a song"],
    note: "The printed number identifies the physical chordlink. It is not a password and does not unlock chordlist by itself.",
  },
  de: {
    eyebrow: "chordlink einrichten",
    title: "Öffne den Link auf deinem iPhone",
    intro: "Wenn chordlist installiert ist, öffnet der Scan die App und fragt, was dieser Tag tun soll. Deine Auswahl bleibt auf deinem Gerät und lässt sich in den Einstellungen ändern.",
    app: "chordlist laden",
    scan: "Scanne deinen chordlink danach erneut",
    options: ["Bibliothek öffnen", "Songs zufällig öffnen", "Song hinzufügen"],
    note: "Die aufgedruckte Nummer identifiziert den physischen chordlink. Sie ist kein Passwort und schaltet chordlist nicht selbst frei.",
  },
} as const

export function ChordlinkSetupPage({ language }: { language: Language }) {
  const text = copy[language]
  const paths = { en: "/chordlink/setup" as Route, de: "/de/chordlink/setup" as Route }
  const icons = [Library, Shuffle, Music2]

  return (
    <main className="min-h-screen text-foreground">
      <SiteHeader language={language} alternates={paths} />
      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl px-6 py-16">
        <Nfc className="size-9" />
        <p className="mt-6 font-mono text-sm text-muted-foreground">{text.eyebrow}</p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{text.title}</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">{text.intro}</p>

        <div className="mt-10 grid gap-3">
          {text.options.map((option, index) => {
            const Icon = icons[index] ?? Library
            return <div key={option} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"><Icon className="size-5" /><span>{option}</span></div>
          })}
        </div>

        {primaryAppLink ? <a href={primaryAppLink} className={cn(buttonVariants({ size: "lg" }), "mt-10 h-11 px-5")}><Download />{text.app}</a> : null}
        <p className="mt-5 font-medium">{text.scan}</p>
        <p className="mt-8 rounded-2xl bg-muted p-5 text-sm leading-6 text-muted-foreground">{text.note}</p>
      </article>
      <SiteFooter compact language={language} alternates={paths} />
    </main>
  )
}
