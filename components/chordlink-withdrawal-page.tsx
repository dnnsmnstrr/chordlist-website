"use client"

import type { Route } from "next"
import Link from "next/link"
import { useActionState } from "react"

import { sendChordlinkWithdrawal } from "@/app/chordlink/withdrawal-actions"
import { buttonVariants } from "@/components/ui/button"
import { emptyChordlinkWithdrawalState } from "@/lib/chordlink-withdrawal"
import { cn } from "@/lib/utils"
import type { Language } from "@/locales"

const copy = {
  en: {
    eyebrow: "chordlink · withdrawal",
    title: "Withdraw from contract",
    intro: "Use this function to withdraw from your chordlink purchase. You may also send an unambiguous statement by email or post.",
    name: "Your full name",
    order: "Order number, order date, or order email address",
    email: "Email address for the immediate confirmation",
    confirm: "Widerruf bestätigen",
    sent: "Your withdrawal has been received. An immediate confirmation has been sent to the email address you entered.",
    invalid: "Please complete all fields with the details needed to identify your order.",
    unavailable: "The online function is temporarily unavailable. Please send your withdrawal to support@chordlist.app.",
    terms: "Withdrawal information and model form",
  },
  de: {
    eyebrow: "chordlink · Widerruf",
    title: "Vertrag widerrufen",
    intro: "Mit dieser Funktion kannst du deinen chordlink-Kauf widerrufen. Du kannst deinen Widerruf außerdem eindeutig per E-Mail oder Post erklären.",
    name: "Vor- und Nachname",
    order: "Bestellnummer, Bestelldatum oder Bestell-E-Mail-Adresse",
    email: "E-Mail-Adresse für die unverzügliche Eingangsbestätigung",
    confirm: "Widerruf bestätigen",
    sent: "Dein Widerruf ist eingegangen. Die Eingangsbestätigung wurde unverzüglich an die angegebene E-Mail-Adresse gesendet.",
    invalid: "Bitte fülle alle Felder mit den Angaben aus, die deine Bestellung identifizieren.",
    unavailable: "Die Online-Funktion ist vorübergehend nicht verfügbar. Sende deinen Widerruf bitte an support@chordlist.app.",
    terms: "Widerrufsbelehrung und Musterformular",
  },
} as const

export function ChordlinkWithdrawalPage({ language }: { language: Language }) {
  const [state, action, pending] = useActionState(sendChordlinkWithdrawal, emptyChordlinkWithdrawalState)
  const text = copy[language]
  const termsPath = language === "de" ? "/de/chordlink/terms" as Route : "/chordlink/terms" as Route

  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="mx-auto w-full max-w-2xl px-6 py-16">
        <p className="font-mono text-sm text-muted-foreground">{text.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{text.title}</h1>
        <p className="mt-5 leading-7 text-muted-foreground">{text.intro}</p>

        {state.outcome === "sent" ? (
          <p className="mt-10 rounded-2xl border border-border bg-muted p-5 leading-7" role="status">{text.sent}</p>
        ) : (
          <form action={action} className="mt-10 space-y-6">
            <input name="language" type="hidden" value={language} />
            <Field label={text.name} name="name" autoComplete="name" />
            <Field label={text.order} name="orderReference" />
            <Field label={text.email} name="email" autoComplete="email" type="email" />
            <button className={cn(buttonVariants({ size: "lg" }), "w-full")} disabled={pending} type="submit">
              {text.confirm}
            </button>
            {state.outcome === "invalid" ? <p className="text-sm text-destructive" role="alert">{text.invalid}</p> : null}
            {state.outcome === "unavailable" ? <p className="text-sm text-destructive" role="alert">{text.unavailable}</p> : null}
          </form>
        )}

        <Link className="mt-8 inline-block text-sm underline underline-offset-4" href={termsPath}>{text.terms}</Link>
      </article>
    </main>
  )
}

function Field({
  autoComplete,
  label,
  name,
  type = "text",
}: {
  autoComplete?: string
  label: string
  name: string
  type?: string
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        autoComplete={autoComplete}
        className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
        name={name}
        required
        type={type}
      />
    </label>
  )
}
