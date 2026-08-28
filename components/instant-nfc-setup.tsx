import { Zap } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Language } from "@/locales"

const copy = {
  en: {
    optional: "Optional",
    title: "Open chordlist instantly",
    intro: "A direct NFC link works without Shortcuts. iOS shows a notification that you tap to open chordlist. To open it immediately when you scan, add a personal automation:",
    steps: [
      <>Create a new <strong>NFC</strong>-triggered automation in Shortcuts.</>,
      <>Scan the tag and select <strong>Run Immediately</strong>.</>,
      <>Add an <strong>Open URLs</strong> action and enter the chordlink URL, for example <code>https://chordlist.app/link/ID</code>.</>,
      <>Configure the tag in chordlist if you have not already.</>,
      <>Profit!</>,
    ],
  },
  de: {
    optional: "Optional",
    title: "chordlist sofort öffnen",
    intro: "Ein direkter NFC-Link funktioniert ohne Kurzbefehle. iOS zeigt eine Mitteilung, die du antippst, um chordlist zu öffnen. Damit die App direkt beim Scan geöffnet wird, erstelle eine persönliche Automation:",
    steps: [
      <>Erstelle in Kurzbefehle eine neue Automation mit dem Auslöser <strong>NFC</strong>.</>,
      <>Scanne den Tag und wähle <strong>Sofort ausführen</strong>.</>,
      <>Füge die Aktion <strong>URLs öffnen</strong> hinzu und trage die chordlink-URL ein, zum Beispiel <code>https://chordlist.app/link/ID</code>.</>,
      <>Richte den Tag in chordlist ein, falls du das noch nicht getan hast.</>,
      <>Profit!</>,
    ],
  },
} as const

export function InstantNfcSetup({ language, className = "" }: { language: Language; className?: string }) {
  const text = copy[language]

  return (
    <aside className={cn("rounded-2xl border border-border bg-muted/50 p-6", className)}>
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background">
          <Zap aria-hidden="true" className="size-4" />
        </span>
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{text.optional}</p>
          <h2 className="mt-1 font-semibold">{text.title}</h2>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">{text.intro}</p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground marker:font-medium marker:text-foreground">
        {text.steps.map((step, index) => (
          <li key={index} className="pl-1 [&_code]:break-all [&_code]:font-mono [&_code]:text-xs [&_code]:text-foreground [&_strong]:font-medium [&_strong]:text-foreground">
            {step}
          </li>
        ))}
      </ol>
    </aside>
  )
}
