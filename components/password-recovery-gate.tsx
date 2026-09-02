"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { useSyncExternalStore } from "react"

import { isPasswordRecoveryRoute, isRecoveryLink } from "@/lib/supabase/password-recovery"

/**
 * Loaded only once a recovery link has actually been seen.
 *
 * This gate is mounted from `components/root-shell.tsx`, which means it is on every page of the
 * site. The panel pulls in supabase-js, and nobody who came for the home page should pay for that,
 * so the import is deferred behind the fragment check below and behind `ssr: false` — there is
 * nothing to render on the server, since the fragment never reaches it.
 */
const PasswordRecoveryPanel = dynamic(
  () => import("@/components/password-recovery-panel").then((module) => module.PasswordRecoveryPanel),
  { ssr: false },
)

/**
 * Catches a Supabase password-recovery link wherever it lands.
 *
 * Recovery emails sent before `/account/update-password` existed point at the site root, and a
 * URL fragment never reaches the server — Next sees `/`, renders the home page, and the tokens sit
 * unread in the address bar. So the check has to happen in the browser, on any page, which is why
 * this rides along in the root shell rather than living on one route.
 *
 * It renders nothing at all unless the fragment is there, so every other page is unaffected.
 */
export function PasswordRecoveryGate() {
  const pathname = usePathname()

  // The dedicated page renders the panel itself, and two panels would race for a fragment whose
  // tokens can only be read once.
  if (isPasswordRecoveryRoute(pathname)) return null

  return <RecoveryOverlay />
}

/**
 * Latched, and read through `useSyncExternalStore` rather than an effect.
 *
 * The URL is external state that only exists in the browser, which is what that hook is for. The
 * latch is the important half: Supabase's client takes the tokens out of the address as it reads
 * them, so a snapshot of "is the fragment still there" would flip back to false a moment after the
 * panel opened and tear it off the screen mid-flow. What the gate actually needs to know is whether
 * a recovery link arrived, and that does not become untrue.
 */
let arrived = false

function readRecoveryLink(): boolean {
  if (!arrived && isRecoveryLink(window.location.hash)) arrived = true
  return arrived
}

function subscribeToHash(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange)
  return () => window.removeEventListener("hashchange", onChange)
}

/** The server never sees a fragment, so the first paint is always the page on its own. */
function noRecoveryLink(): boolean {
  return false
}

function RecoveryOverlay() {
  const present = useSyncExternalStore(subscribeToHash, readRecoveryLink, noRecoveryLink)

  if (!present) return null

  return (
    <div
      aria-label="Password reset"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/95 px-6 py-16 backdrop-blur-sm"
      role="dialog"
    >
      {/* A surface of its own: the page behind is blurred rather than gone, and a form asking for a
          password should not look like part of it. */}
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-lg">
        <PasswordRecoveryPanel />
      </div>
    </div>
  )
}
