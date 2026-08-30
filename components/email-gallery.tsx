import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export type EmailManifestEntry = {
  slug: string
  language: string
  kind: string
  subject: string
  preheader: string
  heading: string
  cta: { label: string; url: string } | null
  html: string
  text: string
  bytes: number
}

const copy = {
  title: "Email templates",
  intro:
    "Built from content/emails by pnpm build:emails. Each one is previewed in an iframe at the width a client renders it, so what is below is the message itself rather than a picture of it. Paste the HTML into Brevo and keep the text alternative beside it.",
  subject: "Subject",
  preheader: "Preheader",
  cta: "Button",
  openHtml: "Open HTML",
  openText: "Plain text",
  clipWarning: "Over Gmail's ~102KB clipping threshold",
} as const

// Gmail stops rendering a message past roughly this size and hides the rest — including the
// unsubscribe link — behind a "View entire message" link.
const gmailClipBytes = 102_000

export function EmailGallery({ emails }: { emails: EmailManifestEntry[] }) {
  const slugs = [...new Set(emails.map((email) => email.slug))]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">{copy.intro}</p>

        <div className="mt-12 flex flex-col gap-14">
          {slugs.map((slug) => (
            <section key={slug}>
              <h2 className="font-mono text-sm text-muted-foreground">{slug}</h2>
              <div className="mt-4 grid gap-6 lg:grid-cols-2">
                {emails
                  .filter((email) => email.slug === slug)
                  .map((email) => (
                    <article key={`${email.slug}-${email.language}`} className="rounded-2xl border border-border bg-card/60 p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md border border-border px-2 py-0.5 font-mono text-xs uppercase">{email.language}</span>
                        <span className="rounded-md border border-border px-2 py-0.5 font-mono text-xs">{email.kind}</span>
                        {email.bytes > gmailClipBytes ? (
                          <span className="rounded-md border border-destructive px-2 py-0.5 font-mono text-xs text-destructive">
                            {copy.clipWarning}
                          </span>
                        ) : null}
                      </div>

                      <dl className="mt-4 grid gap-2 text-sm">
                        <div>
                          <dt className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{copy.subject}</dt>
                          <dd className="mt-0.5 font-medium">{email.subject}</dd>
                        </div>
                        <div>
                          <dt className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{copy.preheader}</dt>
                          <dd className="mt-0.5 text-muted-foreground">{email.preheader}</dd>
                        </div>
                        {email.cta ? (
                          <div>
                            <dt className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{copy.cta}</dt>
                            <dd className="mt-0.5 text-muted-foreground">
                              {email.cta.label} → <code className="font-mono text-xs">{email.cta.url}</code>
                            </dd>
                          </div>
                        ) : null}
                      </dl>

                      <iframe
                        className="mt-4 h-[520px] w-full rounded-xl border border-border bg-white"
                        loading="lazy"
                        sandbox=""
                        src={email.html}
                        title={`${email.slug} (${email.language})`}
                      />

                      <p className="mt-3 flex flex-wrap gap-4 text-sm">
                        <a className="underline underline-offset-4" href={email.html} rel="noreferrer" target="_blank">
                          {copy.openHtml}
                        </a>
                        <a className="underline underline-offset-4" href={email.text} rel="noreferrer" target="_blank">
                          {copy.openText}
                        </a>
                      </p>
                    </article>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <SiteFooter compact />
    </main>
  )
}
