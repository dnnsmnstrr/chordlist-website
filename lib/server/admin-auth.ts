import "server-only"

import type { Route } from "next"
import { redirect } from "next/navigation"

import { adminEmails, isAdminEmail, safeRedirectPath } from "@/lib/admin-routes"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type AdminUser = { id: string; email: string }

/**
 * Returns the signed-in administrator, or `null`.
 *
 * `getUser()` rather than `getSession()`: the session is read from a cookie the browser sent, so
 * trusting it is trusting the client. `getUser()` revalidates the token with Supabase, which is
 * what makes the answer here worth acting on.
 */
export async function readAdminUser(): Promise<AdminUser | null> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user?.email) return null

  return isAdminEmail(data.user.email, adminEmails(process.env.ADMIN_EMAILS))
    ? { id: data.user.id, email: data.user.email }
    : null
}

/**
 * The guard every internal tool calls before rendering anything.
 *
 * This is the authorization, not `proxy.ts`. Next's own documentation is explicit that a proxy
 * matcher does not reliably cover Server Functions — they are POSTs to the route that defines them,
 * so a refactor can move one out from under the matcher without anything failing loudly. The proxy
 * keeps the session fresh and makes the redirect quick; this decides who gets in.
 */
export async function requireAdmin(returnTo: string): Promise<AdminUser> {
  const user = await readAdminUser()
  if (user) return user

  const next = encodeURIComponent(safeRedirectPath(returnTo))
  redirect(`/login?next=${next}` as Route)
}

/**
 * The same check for a route handler, which cannot redirect a fetch usefully.
 *
 * Returns a 401 to refuse, or `null` to continue. Route handlers are the surface that matters most
 * here — the translation endpoints write files — and they are reached by `fetch`, so the proxy's
 * redirect would arrive as an opaque HTML body rather than an error the caller can act on.
 */
export async function refuseUnlessAdmin(): Promise<Response | null> {
  if (await readAdminUser()) return null
  return Response.json({ error: "Not authorized." }, { status: 401 })
}
