import { ChordlistIcon } from "@/components/chordlist-icon"
import { siteConfig } from "@/lib/site-config"

/**
 * The frame around signing in and signing out.
 *
 * It is the admin console's own chrome rather than the marketing site's — the brand lockup, the
 * monospace chip, and the bordered 16px panel from `src/admin/admin-shell.ts` in chordlist-backend
 * — so that admin.chordlist.app and the door into these tools read as one surface. There is no
 * `<SiteHeader />` for the same reason: nothing here is part of the public site, and a nav offering
 * Docs and Blog would say otherwise.
 *
 * Both pages render through it so the pair cannot drift; each still owns its own words.
 */
export function AdminAuthShell({
  body,
  children,
  eyebrow,
  title,
}: {
  body: string
  children?: React.ReactNode
  eyebrow: string
  title: string
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <div id="main-content" tabIndex={-1} className="w-full max-w-sm">
        <div className="flex items-center gap-3">
          {/* The tile is the app icon rather than themed chrome, so it stays light in both themes
              — the same `logo-tile`/`logo-glyph` pair the site header uses. */}
          <span className="flex size-8 items-center justify-center overflow-hidden rounded-md bg-logo-tile text-logo-glyph shadow-logo">
            <ChordlistIcon className="h-full w-full" />
          </span>
          <span className="font-mono text-base font-semibold tracking-tight">
            {siteConfig.name} <span className="font-normal text-muted-foreground">{adminWord}</span>
          </span>
        </div>

        <section className="mt-5 rounded-2xl border border-border bg-card p-6">
          <p className="inline-flex rounded-sm bg-muted px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-pretty text-sm leading-6 text-muted-foreground">{body}</p>
          {children}
        </section>
      </div>
    </main>
  )
}

/** The muted half of the wordmark, as the console writes it: `chordlist admin`. */
const adminWord = "admin"
