/**
 * What a Supabase password-recovery link left in the URL, and whether a new password is acceptable.
 *
 * Everything in here is pure and knows nothing about Supabase's client, which is what makes it
 * testable without a browser — and what keeps the one interesting decision (is this a recovery
 * link, an expired one, or an ordinary anchor?) somewhere it can be read.
 *
 * `classifyRecoveryFragment` deliberately returns a **verdict rather than the tokens it read**.
 * The `access_token` in that fragment is a bearer credential for the account, and the only thing
 * that should ever hold it is Supabase's own client, in the browser, for the seconds it takes to
 * set a new password. A function that returned it would invite a caller to log it, put it in
 * component state, or post it to a server action, and none of those should be possible to write by
 * accident.
 */

/**
 * The page written for this flow.
 *
 * It is not the only place the flow works: existing recovery emails point at `/`, and
 * `components/password-recovery-gate.tsx` picks the fragment up on whatever page it lands on. This
 * path exists so a link can be aimed somewhere honest, and so opening it without a fragment says
 * "that link has expired" instead of showing a marketing page that does nothing.
 */
export const passwordRecoveryPath = "/account/update-password"

export function isPasswordRecoveryRoute(pathname: string | null | undefined): boolean {
  return pathname === passwordRecoveryPath
}

/**
 * Shorter than this is refused before Supabase is asked.
 *
 * The project's own minimum is a server setting and may well be lower; this is the site being
 * stricter than the floor, not restating it. Ten characters for an account that opens the internal
 * tools is cheap, and the failure is caught in the browser where the message can be specific.
 */
export const minimumPasswordLength = 10

export type RecoveryFragment =
  | { kind: "none" }
  | { kind: "recovery" }
  | { kind: "error"; code: string | null }

/**
 * Read `window.location.hash` and say what kind of link this is.
 *
 * Three shapes matter:
 *
 *   - `#access_token=…&refresh_token=…&type=recovery` — an implicit-flow recovery link.
 *   - `#error=access_denied&error_code=otp_expired&…` — Supabase's own answer for a link that has
 *     expired or already been used. Worth telling apart from "nothing here", because it is the
 *     case where the reader needs to be told to ask for another email.
 *   - anything else, including an ordinary `#section-two` anchor.
 *
 * A `type=recovery` fragment missing either token is reported as an error rather than as nothing:
 * Supabase's client would refuse it too, and silently rendering the page underneath would leave
 * somebody staring at a link that appeared to do nothing at all.
 */
export function classifyRecoveryFragment(hash: string | null | undefined): RecoveryFragment {
  const fragment = (hash ?? "").replace(/^#/, "")
  if (fragment.length === 0) return { kind: "none" }

  const params = new URLSearchParams(fragment)

  if (params.has("error") || params.has("error_code") || params.has("error_description")) {
    return { kind: "error", code: params.get("error_code") ?? params.get("error") }
  }

  // A magic-link or OAuth fragment is somebody else's business — only recovery opens this form.
  if (params.get("type") !== "recovery") return { kind: "none" }

  const complete = Boolean(params.get("access_token")) && Boolean(params.get("refresh_token"))
  return complete ? { kind: "recovery" } : { kind: "error", code: null }
}

/** Whether this URL has anything for the recovery flow to do, of either kind. */
export function isRecoveryLink(hash: string | null | undefined): boolean {
  return classifyRecoveryFragment(hash).kind !== "none"
}

/**
 * The same address with the fragment removed, for `history.replaceState`.
 *
 * Supabase's client clears the hash itself once it has read the tokens, but only on the path where
 * it read them: an expired link, an unconfigured deployment, or a client that never gets created
 * would all leave the credentials sitting in the address bar, in the back button, and in whatever
 * the reader pastes next.
 */
export function urlWithoutFragment(href: string): string {
  const hashAt = href.indexOf("#")
  return hashAt === -1 ? href : href.slice(0, hashAt)
}

export type PasswordProblem = "tooShort" | "mismatch"

/** Length first, so "these do not match" is never the answer to a password that was doomed anyway. */
export function validateNewPassword(password: string, confirmation: string): PasswordProblem | null {
  if (password.length < minimumPasswordLength) return "tooShort"
  if (password !== confirmation) return "mismatch"
  return null
}
