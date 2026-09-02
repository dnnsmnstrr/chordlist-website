"use client"

import Link from "next/link"
import { useEffect, useId, useRef, useState } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"

import { buttonVariants } from "@/components/ui/button"
import { supabaseBrowserConfig } from "@/lib/supabase/config"
import {
  classifyRecoveryFragment,
  minimumPasswordLength,
  urlWithoutFragment,
  validateNewPassword,
} from "@/lib/supabase/password-recovery"
import { cn } from "@/lib/utils"

/**
 * Copy lives here rather than in `locales/en.ts` for the same reason `app/login/page.tsx` keeps its
 * own: this is the sign-in machinery, not the marketing site. It is reached only from a link in an
 * email to the one administrator account, and it is English on the German pages too — which is
 * honest, because the login it hands back to is English as well.
 */
const copy = {
  title: "Choose a new password",
  verifying: "Checking the link…",
  verifyingBody: "One moment while the reset link is confirmed.",
  ready: `Pick something at least ${minimumPasswordLength} characters long. You will be signed out afterwards and can sign in with the new password.`,
  password: "New password",
  confirmation: "Repeat the new password",
  hint: `At least ${minimumPasswordLength} characters.`,
  action: "Set the new password",
  submitting: "Saving…",
  tooShort: `That password is shorter than ${minimumPasswordLength} characters.`,
  mismatch: "The two passwords are not the same.",
  failed: "The password could not be changed. Ask for a new reset email and try again.",
  successTitle: "Password changed",
  successBody: "The temporary reset session has been signed out. Sign in with the new password.",
  invalidTitle: "That link is no longer valid",
  // Says where a replacement actually comes from. There is no self-service reset on this site —
  // the one administrator account is made by hand in the Supabase dashboard — so sending somebody
  // to the sign-in page to "ask for another one" would be sending them to a form that cannot.
  invalidBody:
    "Password reset links can only be used once and expire after a short while. There is no self-service reset here: send yourself a new link from the Supabase dashboard, under Authentication → Users.",
  unconfiguredTitle: "Sign-in is not configured on this deployment",
  unconfiguredBody: "This build has no Supabase project set, so a password cannot be changed here.",
  signIn: "Go to sign in",
} as const

const fieldClass =
  "mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const headingClass = "text-2xl font-semibold tracking-tight"
const bodyClass = "mt-3 text-pretty text-sm leading-6 text-muted-foreground"

type RecoveryStatus =
  | "verifying"
  | "ready"
  | "submitting"
  | "success"
  | "invalid"
  | "unconfigured"
  /** No recovery link in this URL at all — the panel has nothing to do. */
  | "idle"

/** Where the recovery attempt got to, and the client that will be asked to set the password. */
type Resolution = { status: RecoveryStatus; client: SupabaseClient | null }

/**
 * Run at most once per page load, and memoised at module scope rather than in a ref.
 *
 * The tokens in the fragment are single-use and Supabase's client removes them from the URL as it
 * reads them, so a second attempt — React's development double-effect, or a remount — would find
 * an empty hash and report a perfectly good link as expired.
 */
let resolution: Promise<Resolution> | null = null

function resolveRecovery(): Promise<Resolution> {
  resolution ??= (async () => {
    const fragment = classifyRecoveryFragment(window.location.hash)
    if (fragment.kind === "none") return { status: "idle" as const, client: null }

    // Everything past this line has credentials or an error in the address, so all of it sits
    // inside one block whose `finally` cleans the address — including the steps that can throw
    // rather than return. A chunk that will not load, or a malformed NEXT_PUBLIC_SUPABASE_URL that
    // makes `createClient` raise, must not be the path where the tokens are left in the address bar
    // and the panel spins forever.
    try {
      if (fragment.kind === "error") return { status: "invalid" as const, client: null }

      const config = supabaseBrowserConfig()
      if (!config) return { status: "unconfigured" as const, client: null }

      // Loaded on demand. This module is mounted on every page of the site through
      // `components/root-shell.tsx`, and supabase-js is far too large to ship to a reader who came
      // for the home page. Nothing is fetched until a recovery fragment is actually present.
      const { createClient } = await import("@supabase/supabase-js")

      const client = createClient(config.url, config.key, {
        auth: {
          // The link in the email is an implicit-flow one: the tokens arrive in the fragment rather
          // than as a PKCE code. This is why `createBrowserClient` from @supabase/ssr cannot be
          // used here — it pins `flowType: "pkce"` and rejects the link outright.
          flowType: "implicit",
          // Reads the fragment, validates the access token, builds the session, clears the hash.
          detectSessionInUrl: true,
          // The recovery session only has to live long enough to set one password. Not persisting
          // it keeps a bearer token for the account out of local storage, and makes closing the tab
          // enough to end it; there is nothing to refresh in that window either.
          persistSession: false,
          autoRefreshToken: false,
        },
      })

      // `getSession()` waits for the client's own initialisation, which is what reads the fragment.
      const { data } = await client.auth.getSession()
      return data.session ? { status: "ready" as const, client } : { status: "invalid" as const, client: null }
    } catch {
      // Whatever went wrong, there is no client to reach the account with, so as far as the reader
      // is concerned this link does not work.
      return { status: "invalid" as const, client: null }
    } finally {
      // Supabase clears the hash once it has read the tokens, but not on the paths where it refused
      // them, and it leaves a bare `#` behind when it does.
      scrubFragment()
    }
  })()

  return resolution
}

/** Take the tokens out of the address bar, the back button, and anything the reader pastes next. */
function scrubFragment(): void {
  const clean = urlWithoutFragment(window.location.href)
  if (clean !== window.location.href) window.history.replaceState(window.history.state, "", clean)
}

/**
 * The password reset form and every state it can be in.
 *
 * Two callers: `components/password-recovery-gate.tsx`, which floats it over whatever page the
 * emailed link happened to land on, and `app/account/update-password/page.tsx`, which renders it
 * as the page. The difference is what "no link here" means — nothing at all for the gate, and an
 * expired-link message for the page that exists for this and nothing else — so that is the prop.
 */
export function PasswordRecoveryPanel({ standalone = false }: { standalone?: boolean }) {
  const [status, setStatus] = useState<RecoveryStatus>("verifying")
  const [message, setMessage] = useState<string | null>(null)
  const clientRef = useRef<SupabaseClient | null>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const titleId = useId()
  const passwordId = useId()
  const confirmationId = useId()
  const hintId = useId()

  useEffect(() => {
    let cancelled = false

    resolveRecovery().then(
      (resolved) => {
        if (cancelled) return
        clientRef.current = resolved.client
        setStatus(resolved.status)
      },
      // `resolveRecovery` is written not to reject, so this is the backstop rather than the plan —
      // but a panel with no rejection path spins on "Checking the link…" forever if it ever does.
      () => {
        if (!cancelled) setStatus("invalid")
      },
    )

    return () => {
      cancelled = true
    }
  }, [])

  // The panel usually appears without anybody navigating to it, so it takes the caret rather than
  // leaving focus wherever the emailed link dropped it.
  useEffect(() => {
    if (status === "ready") passwordRef.current?.focus()
  }, [status])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const client = clientRef.current
    if (!client || status !== "ready") return

    const data = new FormData(event.currentTarget)
    const password = String(data.get("password") ?? "")
    const problem = validateNewPassword(password, String(data.get("confirmation") ?? ""))
    if (problem) {
      setMessage(copy[problem])
      return
    }

    setStatus("submitting")
    setMessage(null)

    const { error } = await client.auth.updateUser({ password })
    if (error) {
      // Supabase's own wording here is about this account's own password — "should be different
      // from the old password" and the like — so it is more use than a generic refusal would be.
      setMessage(error.message || copy.failed)
      setStatus("ready")
      return
    }

    // The recovery session was only ever a means to this call. `scope: "local"` discards it here
    // without reaching into sessions on the reader's other devices, which changing a password is
    // not on its own a reason to end.
    await client.auth.signOut({ scope: "local" })
    setStatus("success")
  }

  if (status === "idle" && !standalone) return null

  // The gate floats this inside a dialog that has no other heading; the standalone page has none of
  // its own. Either way this is the first heading anybody reads.
  const Heading = standalone ? "h1" : "h2"

  if (status === "idle" || status === "invalid" || status === "unconfigured") {
    const unconfigured = status === "unconfigured"
    return (
      <>
        <Heading className={headingClass} id={titleId}>
          {unconfigured ? copy.unconfiguredTitle : copy.invalidTitle}
        </Heading>
        <p className={bodyClass} role="alert">
          {unconfigured ? copy.unconfiguredBody : copy.invalidBody}
        </p>
        <SignInLink />
      </>
    )
  }

  if (status === "success") {
    return (
      <>
        <Heading className={headingClass} id={titleId}>
          {copy.successTitle}
        </Heading>
        <p className={bodyClass} role="status">
          {copy.successBody}
        </p>
        <SignInLink />
      </>
    )
  }

  if (status === "verifying") {
    return (
      <>
        <Heading className={headingClass} id={titleId}>
          {copy.verifying}
        </Heading>
        <p className={bodyClass} role="status">
          {copy.verifyingBody}
        </p>
      </>
    )
  }

  const isSubmitting = status === "submitting"

  return (
    <>
      <Heading className={headingClass} id={titleId}>
        {copy.title}
      </Heading>
      <p className={bodyClass}>{copy.ready}</p>

      <form aria-busy={isSubmitting} className="mt-8" onSubmit={onSubmit}>
        <label className="block text-sm font-medium" htmlFor={passwordId}>
          {copy.password}
        </label>
        <input
          aria-describedby={hintId}
          autoComplete="new-password"
          className={fieldClass}
          disabled={isSubmitting}
          id={passwordId}
          minLength={minimumPasswordLength}
          name="password"
          onInput={() => setMessage(null)}
          ref={passwordRef}
          required
          type="password"
        />
        <p className="mt-2 text-xs text-muted-foreground" id={hintId}>
          {copy.hint}
        </p>

        <label className="mt-5 block text-sm font-medium" htmlFor={confirmationId}>
          {copy.confirmation}
        </label>
        <input
          autoComplete="new-password"
          className={fieldClass}
          disabled={isSubmitting}
          id={confirmationId}
          minLength={minimumPasswordLength}
          name="confirmation"
          onInput={() => setMessage(null)}
          required
          type="password"
        />

        <button
          className={cn(buttonVariants({ size: "lg" }), "mt-6 h-11 w-full px-5")}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? copy.submitting : copy.action}
        </button>

        {message ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {message}
          </p>
        ) : null}
      </form>
    </>
  )
}

function SignInLink() {
  return (
    <Link className={cn(buttonVariants({ size: "lg", variant: "outline" }), "mt-6 h-11 w-full px-5")} href="/login">
      {copy.signIn}
    </Link>
  )
}
