import "server-only"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { supabaseBrowserConfig } from "@/lib/supabase/config"

/**
 * A Supabase client bound to the request's cookies, for use in server components and actions.
 *
 * Returns `null` when the project is not configured, so every caller has to decide what an
 * unconfigured site means rather than getting a client that fails later at a less obvious place.
 */
export async function createSupabaseServerClient() {
  // Cookies are read first, before the configuration check, and deliberately so. Besides being
  // needed below, `cookies()` is what marks a route that calls this as dynamic. Checking the
  // configuration first would let an unconfigured build prerender an admin page as static content,
  // which makes "is this page behind the login" depend on whether an environment variable happened
  // to be set when the build ran. A security boundary must not be decided that way.
  const cookieStore = await cookies()

  const config = supabaseBrowserConfig()
  if (!config) return null

  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Server components cannot set cookies. The proxy refreshes the session on every admin
          // request, so a read-only render here is expected rather than an error worth surfacing.
        }
      },
    },
  })
}
