/**
 * Which parts of this site are internal tools rather than the marketing site.
 *
 * One list, used by both `proxy.ts` and `requireAdmin()`. It is deliberately a prefix list rather
 * than a check written into each page: a new tool added under one of these paths is protected the
 * moment it exists, and forgetting to add the guard is the failure mode that matters here.
 *
 * None of these are linked from the public site — the `/social/posts` link in
 * `components/site-footer.tsx` is commented out — so protecting them removes nothing a visitor
 * can reach today. `/screens` is deliberately absent: `/press` sends journalists there for the
 * App Store sets, so it is part of the public site and a login in front of it is a dead link.
 */
export const adminRoutePrefixes = [
  "/admin",
  "/api/editorial",
  "/api/translations",
  "/copy",
  "/editorial",
  "/emails",
  "/gallery",
  "/login",
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
 * because browsers read them as protocol-relative URLs. Without one, the dashboard at `/admin` is
 * where every tool is a click away.
 */
export function safeRedirectPath(value: string | null | undefined, fallback = "/admin"): string {
  if (typeof value !== "string" || value.length === 0) return fallback
  if (!value.startsWith("/")) return fallback
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback
  return value
}

/**
 * Whether the internal tools skip the login for this request.
 *
 * Only on `pnpm dev`, only off Vercel, and only for a request addressed to this machine. None of the
 * tools need the backend for anything but the login itself — they read and write files in the
 * checkout — so signing in to your own laptop is friction without protection.
 *
 * Each condition fails closed. A production build (`pnpm build && pnpm start`) still asks, so it
 * stays an honest rehearsal of the deployed site. `VERCEL` is set on every Vercel build and function,
 * so no deployment can opt out by running in development mode. And `next dev` listens on the
 * network: the host check keeps a phone on the same Wi-Fi, which reaches the server by its LAN
 * address, behind the login. It is a convenience boundary, not a security one — a Host header can be
 * forged by anyone who can reach the port — which is why the first two conditions carry the weight.
 */
export function skipsLoginLocally(environment: {
  nodeEnv: string | undefined
  vercel: string | undefined
  host: string | null | undefined
}): boolean {
  if (environment.nodeEnv !== "development") return false
  if (environment.vercel !== undefined && environment.vercel !== "") return false
  return isLoopbackHost(environment.host)
}

export function isLoopbackHost(host: string | null | undefined): boolean {
  if (!host) return false
  const hostname = host.trim().toLowerCase().replace(/:\d+$/, "")
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  )
}
