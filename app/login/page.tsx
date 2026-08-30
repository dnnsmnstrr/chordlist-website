import type { Metadata } from "next"
import { redirect } from "next/navigation"
import type { Route } from "next"

import { AdminLoginForm } from "@/components/admin-login-form"
import { safeRedirectPath } from "@/lib/admin-routes"
import { readAdminUser } from "@/lib/server/admin-auth"

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
}

const copy = {
  eyebrow: "chordlist",
  title: "Sign in",
  body: "These pages are internal tools. Sign in with the administrator account for this project.",
} as const

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeRedirectPath((await searchParams).next)

  // Someone who is already signed in has no business being shown a login form.
  if (await readAdminUser()) redirect(next as Route)

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div id="main-content" tabIndex={-1} className="w-full max-w-sm">
        <p className="font-mono text-sm text-muted-foreground">{copy.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{copy.title}</h1>
        <p className="mt-3 text-pretty text-sm leading-6 text-muted-foreground">{copy.body}</p>
        <AdminLoginForm next={next} />
      </div>
    </main>
  )
}
