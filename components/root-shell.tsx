import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

import { AmbientBackground } from "@/components/ambient-background"
import { PasswordRecoveryGate } from "@/components/password-recovery-gate"
import { dictionary, type Language } from "@/locales"

import "@/app/globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

/**
 * The document every page is rendered into, in one language.
 *
 * There is one root layout per language — `app/(en)` and `app/(de)` — because `<html lang>` and the
 * skip link are the two things outside any page that have to be translated, and a root layout
 * cannot read the route it is wrapping without `headers()`, which would opt the whole static site
 * into dynamic rendering. Route groups cost nothing at the URL level and each layout is three
 * lines, so the document itself lives here once and both call it.
 *
 * The fonts are instantiated in this module rather than in the layouts so both languages share one
 * pair of `next/font` instances and one preload.
 */
export function RootShell({ language, children }: { language: Language; children: React.ReactNode }) {
  const { locale, common } = dictionary(language)

  return (
    <html lang={locale.htmlLang} className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        {/* First thing in the tab order on every page: one Tab, one Enter, past the
            header nav and into the content. Invisible until it takes focus. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {common.skipToContent}
        </a>
        <AmbientBackground />
        <div className="site-content">{children}</div>
        {/* Renders nothing unless the URL carries a password-recovery fragment. It has to sit here
            rather than on one route because a fragment never reaches the server, and the recovery
            emails already in people's inboxes point at the site root. */}
        <PasswordRecoveryGate />
        {process.env.NODE_ENV === "production" ? <Analytics /> : null}
      </body>
    </html>
  )
}
