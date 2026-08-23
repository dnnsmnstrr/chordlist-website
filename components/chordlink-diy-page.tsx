import type { Route } from "next"
import Link from "next/link"
import { Box, ExternalLink, Nfc, Printer, ShieldCheck, Smartphone } from "lucide-react"

import { ChordlinkPersonalLink } from "@/components/chordlink-personal-link"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Language } from "@/locales"

const copy = {
  en: {
    eyebrow: "DIY chordlink",
    title: "Print and program your own.",
    intro: "The chordlink model and browser-based STL generator are free to use for a personal tag you make at home. The model stays on your device while you configure and export it.",
    openModel: "Generate model",
    includedTitle: "What you need",
    included: [
      "An FDM 3D printer and suitable filament (white and black recommended)",
      "A rewritable NFC tag whose diameter and thickness you know or can measure",
      "An NFC-writing app on your phone (try \"NFC Tools\")",
      "A non-metal mounting position, or an NFC tag designed to work on metal",
    ],
    stepsTitle: "From model to first scan",
    steps: [
      ["Configure", "Open the generator. Enter the measured tag diameter and thickness. For the simplest assembly, enable “open at bottom” so the NFC tag can be fitted after printing."],
      ["Print", "Export one STL or the aligned two-colour parts. A sealed pocket requires a correctly timed slicer pause and a tag rated for the temperatures involved; use the open recess unless you have tested that workflow."],
      ["Choose a link", "Generate a six-digit personal link below. Use a different link for each chordlink if you want different actions on the same device."],
      ["Program and test", "Write the complete HTTPS link to the NFC tag. Test it before locking the tag, covering the recess, or attaching chordlink to anything."],
      ["Set up chordlist", "Scan the finished tag on your iPhone. chordlist asks whether it should open the library, shuffle, or add a song; later scans repeat that choice immediately."],
    ],
    personalTitle: "Create a personal chordlink URL",
    generate: "Generate link",
    regenerate: "Generate another",
    copy: "Copy link",
    copied: "Copied",
    linkNote: "The six-digit ID is public and is not a password. It only distinguishes this tag from your other chordlinks on a device.",
    editionNote: "A self-printed chordlink is not part of the official first edition and does not include chordlist unlimited or fulfillment support. The app and linking behavior work the same way.",
    safetyTitle: "Before attaching it",
    safety: "Test NFC scanning in the exact mounting position first. Metal can block ordinary NFC tags, and adhesives can damage some instrument finishes. Prefer a case, a removable mounting method, or materials approved for your instrument.",
    back: "Back to chordlink",
  },
  de: {
    eyebrow: "DIY-chordlink",
    title: "Drucke und programmiere deinen eigenen chordlink.",
    intro: "Das chordlink-Modell und der STL-Generator im Browser sind für einen persönlichen Tag, den du zu Hause herstellst, kostenlos nutzbar.",
    openModel: "Modell generieren",
    includedTitle: "Was du brauchst",
    included: [
      "Einen FDM-3D-Drucker und geeignetes Filament (weiß und schwarz empfohlen)",
      "Einen wiederbeschreibbaren NFC-Tag, dessen Durchmesser und Dicke du kennst oder messen kannst",
      "Eine App zum Beschreiben von NFC-Tags auf deinem Smartphone (z. B. „NFC Tools“)",
      "Eine nichtmetallische Befestigungsstelle oder einen NFC-Tag, der für Metall geeignet ist",
    ],
    stepsTitle: "Vom Modell zum ersten Scan",
    steps: [
      ["Konfigurieren", "Öffne den Generator. Trage den gemessenen Durchmesser und die Dicke des Tags ein. Aktiviere für die einfachste Montage „open at bottom“, damit du den NFC-Tag nach dem Druck einsetzen kannst."],
      ["Drucken", "Exportiere eine STL-Datei oder die ausgerichteten Teile für den Zweifarbdruck. Ein eingeschlossenes Tag erfordert eine passend gesetzte Druckpause und einen Tag, der die Temperaturen verträgt."],
      ["Link auswählen", "Erzeuge unten einen persönlichen sechsstelligen Link. Verwende für jeden chordlink, der auf demselben Gerät eine andere Aktion ausführen soll, einen eigenen Link."],
      ["Programmieren und testen", "Schreibe den vollständigen HTTPS-Link auf den NFC-Tag. Teste ihn, bevor du den Tag sperrst, die Aussparung abdeckst oder den chordlink befestigst."],
      ["chordlist einrichten", "Scanne den fertigen Tag mit deinem iPhone. chordlist fragt, ob Bibliothek, Zufallswiedergabe oder Song hinzufügen geöffnet werden soll; weitere Scans wiederholen diese Auswahl sofort."],
    ],
    personalTitle: "Persönliche chordlink-URL erstellen",
    generate: "Link erzeugen",
    regenerate: "Anderen erzeugen",
    copy: "Link kopieren",
    copied: "Kopiert",
    linkNote: "Die sechsstellige ID ist öffentlich und kein geheimes Passwort. Sie unterscheidet diesen Tag auf einem Gerät lediglich von deinen anderen chordlinks.",
    editionNote: "Ein selbst gedruckter chordlink gehört nicht zur offiziellen ersten Edition und enthält weder chordlist unlimited noch eine Garantie. App und Verlinkung funktionieren auf dieselbe Weise.",
    safetyTitle: "Vor dem Befestigen",
    safety: "Teste den NFC-Scan zuerst an der exakten Befestigungsstelle. Metall kann gewöhnliche NFC-Tags blockieren und Klebstoffe können manche Instrumentenoberflächen beschädigen. Nutze bevorzugt einen Koffer, eine ablösbare Befestigung oder für dein Instrument freigegebene Materialien.",
    back: "Zurück zu chordlink",
  },
} as const

export function ChordlinkDiyPage({ language }: { language: Language }) {
  const text = copy[language]
  const paths = { en: "/chordlink/diy" as Route, de: "/de/chordlink/diy" as Route }
  const productPath = language === "de" ? "/de/chordlink" as Route : "/chordlink" as Route
  const icons = [Box, Printer, Nfc, ShieldCheck, Smartphone]

  return (
    <main className="min-h-screen text-foreground">
      <SiteHeader language={language} alternates={paths} />
      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-4xl px-6 py-16">
        <p className="font-mono text-sm text-muted-foreground">{text.eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">{text.title}</h1>
        <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground">{text.intro}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a className={buttonVariants({ size: "lg" })} href="/model.html?nfc=1" rel="noreferrer" target="_blank">
            {text.openModel}<ExternalLink />
          </a>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">{text.includedTitle}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {text.included.map((item) => <li key={item} className="rounded-2xl border border-border bg-card p-5 text-sm leading-6 text-muted-foreground">{item}</li>)}
          </ul>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">{text.stepsTitle}</h2>
          <ol className="mt-8 space-y-8">
            {text.steps.map(([title, body], index) => {
              const Icon = icons[index] ?? Box
              return <li key={title} className="grid gap-4 sm:grid-cols-[3rem_1fr]"><span className="flex size-12 items-center justify-center rounded-full border border-border bg-card"><Icon className="size-5" /></span><div><h3 className="font-semibold">{index + 1}. {title}</h3><p className="mt-2 leading-7 text-muted-foreground">{body}</p></div></li>
            })}
          </ol>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">{text.personalTitle}</h2>
          <div className="mt-6">
            <ChordlinkPersonalLink
              copiedLabel={text.copied}
              copyLabel={text.copy}
              generateLabel={text.generate}
              note={text.linkNote}
              regenerateLabel={text.regenerate}
            />
          </div>
        </section>

        <section className="mt-12">
          <div className="rounded-2xl bg-muted p-6"><h2 className="font-semibold">{text.safetyTitle}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{text.safety}</p></div>
        </section>

        <p className="mt-8 border-t border-border pt-6 text-xs leading-5 text-muted-foreground">{text.editionNote}</p>
        <Link className={cn(buttonVariants({ variant: "link" }), "mt-6 px-0")} href={productPath}>{text.back}</Link>
      </article>
      <SiteFooter compact language={language} alternates={paths} />
    </main>
  )
}
