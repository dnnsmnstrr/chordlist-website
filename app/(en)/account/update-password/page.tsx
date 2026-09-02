import type { Metadata } from "next"

import { PasswordRecoveryPanel } from "@/components/password-recovery-panel"

/**
 * Where a password reset link should point.
 *
 * Nothing on the site links here, and it is useless without the fragment a recovery email puts on
 * the end of it — hence `noindex`, and hence the panel's expired-link state, which is what somebody
 * arriving with a used or stale link sees instead of a page that appears to do nothing.
 *
 * Older emails point at `/` instead. Those still work: `components/password-recovery-gate.tsx`
 * picks the fragment up wherever it lands, and this page is deliberately not the only way in.
 *
 * It lives inside the `(en)` group rather than beside `app/login` so it gets a root layout, and
 * with it `<html lang>`, the fonts, and the stylesheet. The gate in that layout stands down on this
 * route: two panels would race for a fragment whose tokens can only be read once.
 */
export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
}

const copy = {
  eyebrow: "chordlist",
} as const

export default function UpdatePasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-sm" id="main-content" tabIndex={-1}>
        <p className="mb-3 font-mono text-sm text-muted-foreground">{copy.eyebrow}</p>
        <PasswordRecoveryPanel standalone />
      </div>
    </main>
  )
}
