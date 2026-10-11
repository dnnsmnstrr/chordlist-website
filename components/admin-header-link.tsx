"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type AdminHeaderLinkProps = {
  label: string
}

/** A Supabase session cookie, possibly split into `.0`, `.1` chunks. */
const sessionCookie = /(?:^|;\s*)sb-[^=]+-auth-token(?:\.\d+)?=/

/** `pnpm dev` on this machine skips the login, so there is no cookie to look for. */
function isLocalDevelopment(): boolean {
  if (process.env.NODE_ENV !== "development") return false
  const { hostname } = window.location
  return hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1" || hostname === "[::1]"
}

/**
 * A link to `/admin` beside the logo, shown only to a signed-in administrator.
 *
 * The header renders into static pages, so the check happens in the browser after load. A visitor
 * without a session cookie never makes the request at all; one with a cookie asks `/api/session`,
 * which applies the same allowlist as the tools. It is a convenience, not a guard — `/admin` still
 * checks for itself.
 */
export function AdminHeaderLink({ label }: AdminHeaderLinkProps) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!sessionCookie.test(document.cookie) && !isLocalDevelopment()) return

    const controller = new AbortController()
    fetch("/api/session", { signal: controller.signal, cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { admin?: unknown } | null) => setIsAdmin(body?.admin === true))
      .catch(() => {})
    return () => controller.abort()
  }, [])

  if (!isAdmin) return null

  return (
    <Link
      href="/admin"
      className="rounded-full border border-border px-2.5 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {label}
    </Link>
  )
}
