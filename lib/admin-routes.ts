/**
 * Which parts of this site are internal tools rather than the marketing site.
 *
 * One list, used by both `proxy.ts` and `requireAdmin()`. It is deliberately a prefix list rather
 * than a check written into each page: a new tool added under one of these paths is protected the
 * moment it exists, and forgetting to add the guard is the failure mode that matters here.
 *
 * None of these are linked from the public site — the `/screens` and `/social/posts` links in
 * `components/site-footer.tsx` are commented out — so protecting them removes nothing a visitor
 * can reach today.
 */
export const adminRoutePrefixes = [
  "/api/translations",
  "/copy",
  "/emails",
  "/gallery",
  "/login",
  "/screens",
  "/social-editor",
  "/social/editor",
  "/social/posts",
  "/translations",
] as const

/** `/login` is in the list above so the proxy refreshes the session there too, but it is public. */
export const publicAdminRoutes = ["/login"] as const

export function isAdminRoute(pathname: string): boolean {
  return adminRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export function isPublicAdminRoute(pathname: string): boolean {
  return publicAdminRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

/** A route that exists behind the login, as opposed to the login itself. */
export function isProtectedRoute(pathname: string): boolean {
  return isAdminRoute(pathname) && !isPublicAdminRoute(pathname)
}

/**
 * Who is allowed in, read from ADMIN_EMAILS as a comma-separated list.
 *
 * This is the check that actually matters, and it is separate from "is signed in" on purpose: a
 * Supabase project accepts new sign-ups by default, so authenticating proves only that somebody
 * created an account — not that it is yours. Without the allowlist, anyone who can reach the login
 * page could sign themselves up and walk into the translation editor.
 *
 * Unset means nobody, never everybody. An admin area that opens up when its configuration is
 * missing is the one failure mode worth ruling out by construction.
 */
export function adminEmails(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0)
}

export function isAdminEmail(email: string | null | undefined, allowlist: string[]): boolean {
  if (!email || allowlist.length === 0) return false
  return allowlist.includes(email.trim().toLowerCase())
}

/**
 * Where to send someone after they sign in.
 *
 * Only same-site absolute paths survive: a `next` parameter is attacker-controlled, and echoing
 * one back into a redirect is how a login page becomes an open redirect that lends the site's
 * name to somebody else's phishing page. `//evil.example` and `/\evil.example` are both rejected
 * because browsers read them as protocol-relative URLs.
 */
export function safeRedirectPath(value: string | null | undefined, fallback = "/emails"): string {
  if (typeof value !== "string" || value.length === 0) return fallback
  if (!value.startsWith("/")) return fallback
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback
  return value
}
