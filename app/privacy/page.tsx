import type { Metadata } from "next"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { siteConfig } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} handles song files, optional analytics, imports, purchases, and website visits.`,
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <header className="border-b border-border pb-8">
          <p className="font-mono text-sm text-muted-foreground">{siteConfig.name}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: 1 August 2026</p>
        </header>

        <div className="mt-10 flex flex-col gap-10">
          <PolicySection title="The short version">
            <p>
              Your song library is made of files in a folder you choose. {siteConfig.name} does not upload that library
              to a developer-operated account, server, or sync service. Optional analytics, explicit website imports,
              App Store purchases, support emails, and visits to this website are handled as described below.
            </p>
          </PolicySection>

          <PolicySection title="Who operates chordlist">
            <p>
              {siteConfig.name} is operated by {siteConfig.operator}. Privacy questions can be sent to{" "}
              <PolicyLink href={`mailto:${siteConfig.contact.support}`}>{siteConfig.contact.support}</PolicyLink>.
            </p>
          </PolicySection>

          <PolicySection title="Your song files">
            <p>
              The app reads and writes Markdown files in a folder you select through Apple&apos;s Files interface. Those
              files can contain titles, artists, chord progressions, tags, lyrics, and play information.
            </p>
            <p>
              {siteConfig.name} does not automatically upload or sync these files. If you choose a folder managed by
              iCloud Drive or another file provider, that provider may store or sync the files under its own terms and
              your device settings.
            </p>
            <p>
              Files are retained until you edit or delete them, remove them using another file-management app, or
              change the selected folder. Deleting the app does not necessarily delete files stored outside its app
              container.
            </p>
          </PolicySection>

          <PolicySection title="Anonymous app analytics">
            <p>
              Anonymous analytics are enabled by default and can be disabled at any time in the app&apos;s Settings. When
              enabled, {siteConfig.name} uses TelemetryDeck to send app interaction events such as viewing the song
              list, shuffling, transposing, creating, or editing a song.
            </p>
            <p>
              TelemetryDeck may process an anonymized installation identifier, the event, an hour-level timestamp, and
              device or app metadata such as device type, operating-system version, app version, and build information.
              TelemetryDeck states that it does not store IP addresses or personally identifiable information for app
              analytics.
            </p>
            <p>
              Learn more in the{" "}
              <PolicyLink href="https://telemetrydeck.com/docs/guides/privacy-faq/">
                TelemetryDeck privacy FAQ
              </PolicyLink>
              .
            </p>
          </PolicySection>

          <PolicySection title="Optional chord-data contribution">
            <p>
              A separate setting lets you choose to contribute chord data. It is off by default and works only while
              anonymous analytics are also enabled.
            </p>
            <p>
              When you add or change chords with this option enabled, the song title, artist, chord progression,
              normalized chord progression, and whether the progression was added or updated may be sent to
              TelemetryDeck. Lyrics and tags are never included. Turning off anonymous analytics also turns off chord
              data contribution.
            </p>
          </PolicySection>

          <PolicySection title="Importing from a website">
            <p>
              If you ask the app to import a song from a URL, your device requests that page from the selected website
              and processes the returned content to create a song. The website may receive standard request information
              such as your IP address and device user-agent under its own privacy policy. The import is initiated only
              when you provide a URL; {siteConfig.operator} does not receive the fetched page through a separate import
              server.
            </p>
          </PolicySection>

          <PolicySection title="Purchases">
            <p>
              The optional unlimited-song unlock is processed by Apple through StoreKit. Apple handles the App Store
              account and payment method. The app receives product and transaction information needed to determine
              whether the unlock is available; {siteConfig.operator} does not receive your payment-card or bank-account
              details.
            </p>
            <p>
              Apple&apos;s handling of App Store data is covered by the{" "}
              <PolicyLink href="https://www.apple.com/legal/privacy/data/en/app-store/">
                App Store privacy information
              </PolicyLink>
              .
            </p>
          </PolicySection>

          <PolicySection title="Support and feedback">
            <p>
              Choosing “Send Feedback” opens an email draft. If you send it, the message can include the content you
              write plus app-version and iOS details included in the draft. Your email provider and ours process that
              message. Support correspondence is retained only as long as reasonably needed to respond, keep support
              records, or meet legal obligations.
            </p>
          </PolicySection>

          <PolicySection title="This website">
            <p>
              This website is hosted by Vercel. Like other hosting providers, Vercel may process request and technical
              information needed to deliver and secure the site.
            </p>
            <p>
              The production website also uses Vercel Web Analytics for aggregate traffic statistics. Vercel states
              that Web Analytics does not use third-party cookies, does not associate page views with personal
              identifiers, and uses a daily-changing hash rather than a persistent cross-site identifier. Data points
              can include the page visited, referrer, filtered query parameters, approximate location, device type,
              operating system, browser, and timestamp.
            </p>
            <p>
              See Vercel&apos;s{" "}
              <PolicyLink href="https://vercel.com/docs/analytics/privacy-policy">
                Web Analytics privacy and compliance information
              </PolicyLink>
              .
            </p>
          </PolicySection>

          <PolicySection title="Sharing and sale of data">
            <p>
              {siteConfig.operator} does not sell your song library or personal information. Data is shared only when
              you initiate an action, enable an optional feature described above, or when a service provider needs it
              to operate the app, website, purchase, or support channel. Information may also be disclosed when required
              by law or necessary to protect rights, safety, and service integrity.
            </p>
          </PolicySection>

          <PolicySection title="Your choices and rights">
            <ul>
              <li>Disable anonymous analytics in the app&apos;s Settings.</li>
              <li>Leave optional chord-data contribution disabled or turn it off at any time.</li>
              <li>Choose, move, edit, export, or delete your song files using compatible file-management tools.</li>
              <li>Contact us to ask about support correspondence or other information you provided directly.</li>
            </ul>
            <p>
              Depending on where you live, privacy law may give you additional access, correction, deletion,
              restriction, objection, or complaint rights. Send requests to{" "}
              <PolicyLink href={`mailto:${siteConfig.contact.support}`}>{siteConfig.contact.support}</PolicyLink>.
            </p>
          </PolicySection>

          <PolicySection title="Changes to this policy">
            <p>
              This policy may be updated when the app, website, or service providers change. Material changes will be
              reflected here with a new “Last updated” date.
            </p>
          </PolicySection>
        </div>
      </article>

      <SiteFooter compact />
    </main>
  )
}
function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-col gap-3 leading-relaxed text-muted-foreground [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-foreground [&_li]:before:content-['—'] [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2">
        {children}
      </div>
    </section>
  )
}

function PolicyLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith("http")

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="font-medium text-foreground underline underline-offset-4"
    >
      {children}
    </a>
  )
}
