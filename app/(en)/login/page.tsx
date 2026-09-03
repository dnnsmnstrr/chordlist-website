import type { Metadata } from "next"
import { redirect } from "next/navigation"
import type { Route } from "next"

import { AdminAuthShell } from "@/components/admin-auth-shell"
import { AdminLoginForm } from "@/components/admin-login-form"
import { safeRedirectPath } from "@/lib/admin-routes"
import { readAdminUser } from "@/lib/server/admin-auth"

/**
 * Inside the `(en)` group, which is invisible in the URL, so this is still `/login`.
 *
 * It has to be: a page outside both language groups belongs to neither root layout, and Next renders
 * it into a bare document — no stylesheet, no fonts, no `<html lang>`. That is why
 * `app/global-not-found.tsx` carries its own document, and it is what this page was doing before.
 */
export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
}

const copy = {
  eyebrow: "internal",
  title: "Sign in",
  body: "These pages are internal tools. Sign in with the administrator account for this project.",
} as const

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeRedirectPath((await searchParams).next)

  // Someone who is already signed in has no business being shown a login form.
  if (await readAdminUser()) redirect(next as Route)

  return (
    <AdminAuthShell body={copy.body} eyebrow={copy.eyebrow} title={copy.title}>
      <AdminLoginForm next={next} />
    </AdminAuthShell>
  )
}
