import type { Metadata } from "next"

import { signOut } from "@/app/login/actions"
import { AdminAuthShell } from "@/components/admin-auth-shell"
import { buttonVariants } from "@/components/ui/button"
import { readAdminUser } from "@/lib/server/admin-auth"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Sign out",
  robots: { index: false, follow: false },
}

const copy = {
  eyebrow: "internal",
  signedIn: "Signed in as",
  signedOut: "You are not signed in.",
  action: "Sign out",
  title: "Sign out",
} as const

/**
 * Deliberately its own page rather than a bar on every tool: the internal pages do not share a
 * layout, so a sign-out control would otherwise have to be pasted into each of them and kept in
 * step by hand.
 */
export default async function LogoutPage() {
  const user = await readAdminUser()

  return (
    <AdminAuthShell
      body={user ? `${copy.signedIn} ${user.email}.` : copy.signedOut}
      eyebrow={copy.eyebrow}
      title={copy.title}
    >
      {user ? (
        <form action={signOut}>
          <button className={cn(buttonVariants({ size: "lg" }), "mt-6 h-11 w-full px-5")} type="submit">
            {copy.action}
          </button>
        </form>
      ) : null}
    </AdminAuthShell>
  )
}
