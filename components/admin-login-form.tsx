"use client"

import { useActionState, useId } from "react"

import { signIn } from "@/app/login/actions"
import { buttonVariants } from "@/components/ui/button"
import { emptyAdminLoginState } from "@/lib/admin-login-state"
import { cn } from "@/lib/utils"

const copy = {
  email: "Email address",
  password: "Password",
  action: "Sign in",
  pending: "Signing in…",
  // One message for a wrong password, an unknown account, and an address that is not an
  // administrator. Telling them apart would let anyone standing at this form work out which
  // addresses have accounts.
  denied: "Those details were not accepted.",
  missing: "Enter both an email address and a password.",
  unconfigured: "Sign-in is not configured on this deployment.",
} as const

// The admin console's controls: an 8px radius over the page background, with the label above it in
// the same uppercase monospace it uses for its toolbar labels.
const fieldClass =
  "mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const labelClass = "block font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground"

export function AdminLoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(signIn, emptyAdminLoginState)
  const emailId = useId()
  const passwordId = useId()

  const message = state.error ? copy[state.error] : null

  return (
    <form action={formAction} className="mt-6">
      <input name="next" type="hidden" value={next} />

      <label className={labelClass} htmlFor={emailId}>
        {copy.email}
      </label>
      <input autoComplete="username" className={fieldClass} id={emailId} name="email" required type="email" />

      <label className={cn(labelClass, "mt-5")} htmlFor={passwordId}>
        {copy.password}
      </label>
      <input
        autoComplete="current-password"
        className={fieldClass}
        id={passwordId}
        name="password"
        required
        type="password"
      />

      <button className={cn(buttonVariants({ size: "lg" }), "mt-6 h-11 w-full px-5")} disabled={isPending} type="submit">
        {isPending ? copy.pending : copy.action}
      </button>

      {message ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  )
}
