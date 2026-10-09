import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { isProtectedRoute, safeRedirectPath, skipsLoginLocally } from "@/lib/admin-routes"

/**
 * Keeps the admin session fresh and turns an expired one into a login redirect.
 *
 * Two things this is deliberately **not**:
 *
 *   - It is not the authorization. Next's own documentation notes that Server Functions are POSTs
 *     to the route that defines them, so a matcher change or a refactor can silently move one out
 *     from under this file. `requireAdmin()` runs inside each protected route and is what actually
 *     decides access; this only saves a round trip and refreshes the token cookie.
 *   - It is not applied site-wide. The matcher lists the internal tools and nothing else, so every
 *     marketing page keeps rendering statically and never pays for a proxy hop.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  // `pnpm dev` on this machine: no login, so nothing to refresh or redirect. The guards in each
  // route make the same check and let the request through.
  if (
    skipsLoginLocally({
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      host: request.headers.get("host"),
    })
  ) {
    return response
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()

  // Unconfigured means no session to refresh. The route's own guard still refuses, so the tools
  // stay shut rather than opening up because an environment variable is missing.
  if (!url || !key) return response

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value)
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options)
      },
    },
  })

  // Revalidates the token with Supabase and writes the refreshed cookie onto `response`. Do not
  // move code between creating the client and this call: it is what triggers the refresh.
  const { data } = await supabase.auth.getUser()

  if (!data.user && isProtectedRoute(request.nextUrl.pathname)) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", safeRedirectPath(request.nextUrl.pathname))
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  // Must stay in step with `adminRoutePrefixes` in lib/admin-routes.ts. Matcher values have to be
  // static literals — Next analyses them at build time — so they cannot be imported from there,
  // and `tests/admin-routes.test.ts` checks the two lists against each other instead.
  // Each prefix is listed twice — bare and with `/:path*` — rather than relying on `*` matching
  // zero segments. The bare form is the one a person actually types.
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/editorial",
    "/api/editorial/:path*",
    "/api/translations",
    "/api/translations/:path*",
    "/copy",
    "/copy/:path*",
    "/editorial",
    "/editorial/:path*",
    "/emails",
    "/emails/:path*",
    "/gallery",
    "/gallery/:path*",
    "/login",
    "/login/:path*",
    "/marketing-copy",
    "/marketing-copy/:path*",
    "/social-editor",
    "/social-editor/:path*",
    "/social/editor",
    "/social/editor/:path*",
    "/social/posts",
    "/social/posts/:path*",
    "/translations",
    "/translations/:path*",
  ],
}
