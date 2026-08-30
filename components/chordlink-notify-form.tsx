"use client"

import { useActionState, useId } from "react"

import { submitChordlinkInterestForm } from "@/app/chordlink/notify/actions"
import { emptyChordlinkInterestFormState } from "@/lib/chordlink-interest"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Language } from "@/locales"

export type ChordlinkNotifyFormCopy = {
  label: string
  placeholder: string
  action: string
  pending: string
  consent: string
  sent: string
  invalidEmail: string
  unavailable: string
}

/**
 * The one thing this page can offer while there is nothing to buy.
 *
 * The address goes to Brevo's double opt-in: nobody is on the list until they click the link in the
 * confirmation mail, so a mistyped or someone else's address costs one unwanted message and then
 * expires by itself. That is also what makes the consent line below the field the real one — it is
 * the wording the confirmation click is recorded against.
 */
export function ChordlinkNotifyForm({
  copy,
  language,
}: {
  copy: ChordlinkNotifyFormCopy
  language: Language
}) {
  const [state, formAction, isPending] = useActionState(submitChordlinkInterestForm, emptyChordlinkInterestFormState)
  const fieldId = useId()
  const consentId = useId()

  if (state.outcome === "confirm-sent") {
    return (
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground" role="status">
        {copy.sent}
      </p>
    )
  }

  const error = state.outcome === "invalid-email" ? copy.invalidEmail : state.outcome === "unavailable" ? copy.unavailable : null

  return (
    <form action={formAction} className="mt-3 max-w-md">
      <input name="language" type="hidden" value={language} />
      {/* Hidden from sight and from assistive technology alike: anything that fills this in is not
          a person, and is answered with the same thank-you rather than a rejection to learn from. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor={`${fieldId}-website`}>Leave this field empty</label>
        <input autoComplete="off" id={`${fieldId}-website`} name="website" tabIndex={-1} type="text" />
      </div>

      <label className="block text-sm font-medium" htmlFor={fieldId}>
        {copy.label}
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          aria-describedby={consentId}
          aria-invalid={state.outcome === "invalid-email" || undefined}
          autoComplete="email"
          className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
          id={fieldId}
          name="email"
          placeholder={copy.placeholder}
          required
          type="email"
        />
        <button className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")} disabled={isPending} type="submit">
          {isPending ? copy.pending : copy.action}
        </button>
      </div>

      <p className="mt-2 text-xs leading-5 text-muted-foreground" id={consentId}>
        {copy.consent}
      </p>

      {error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
