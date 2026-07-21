import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Privacy Policy — chordlist",
  description:
    "How chordlist handles your data. Local-first, no lock-in, and never shared unless you choose to share it.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <header className="border-b border-border pb-8">
          <p className="font-mono text-sm text-muted-foreground">chordlist</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">Privacy Policy</h1>
        </header>

        <div className="mt-10 flex flex-col gap-10">
          <Section title="Who We Are">
            <p>
              This privacy policy covers chordlist, which is operated by makerer studio, together with the related
              website or services described here. It covers the app on iOS and iPadOS.
            </p>
          </Section>

          <Section title="What Data We Collect">
            <p>Information collected automatically through the app or related services may include:</p>
            <ul>
              <li>Usage and interaction data about how the app or related services are used</li>
            </ul>
            <p>
              Some data leaves the device to support app functionality such as accounts, syncing, purchases, support, or
              other online features.
            </p>
          </Section>

          <Section title="How We Use Data">
            <p>We use your data in a variety of ways, including:</p>
            <ul>
              <li>To understand product usage and improve the app.</li>
              <li>To manage billing-related access and entitlements.</li>
            </ul>
            <p>The following providers are used:</p>
            <ul>
              <li>Analytics: TelemetryDeck. Used for product analytics and feature usage.</li>
              <li>Payments: StoreKit. Used for full version unlock.</li>
              <li>Website Hosting: Vercel. Used for hosting the marketing site.</li>
            </ul>
            <p>Additional feature details:</p>
            <ul>
              <li>StoreKit: Unlimited songs unlock.</li>
            </ul>
          </Section>

          <Section title="When Data is Shared">
            <p>
              When an app feature needs online processing, syncing, account handling, or support, relevant data may be
              sent off the device to operate that feature.
            </p>
            <p>Some data is shared with outside service providers that help operate the app or related services.</p>
            <p>The following providers are used:</p>
            <ul>
              <li>
                Analytics: TelemetryDeck. Used for product analytics and feature usage. Optional for users. Privacy
                policy:{" "}
                <a
                  href="https://telemetrydeck.com/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  https://telemetrydeck.com/privacy/
                </a>
                .
              </li>
              <li>Payments: StoreKit. Used for full version unlock. Optional for users.</li>
              <li>
                Website Hosting: Vercel. Used for hosting the marketing site. Optional for users. Privacy policy:{" "}
                <a
                  href="https://chordlist.app/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  https://chordlist.app/privacy
                </a>
                .
              </li>
            </ul>
          </Section>

          <Section title="Payments and Subscriptions">
            <p>The app offers in-app purchases or subscriptions through StoreKit.</p>
            <p>Payment-related providers include StoreKit. They are used for full version unlock.</p>
          </Section>

          <Section title="Data Retention">
            <p>Relevant data stays on the user&apos;s device rather than being retained by the developer.</p>
          </Section>

          <Section title="Security">
            <p>
              We use reasonable technical and organizational measures to protect data, but no method of storage or
              transmission can be guaranteed to be completely secure.
            </p>
          </Section>

          <Section title="Your Choices and Rights">
            <p>
              Privacy requests can be sent through{" "}
              <a
                href="mailto:support@chordlist.app"
                className="font-medium text-foreground underline underline-offset-4"
              >
                support@chordlist.app
              </a>
              .
            </p>
            <p>Requests can be handled through Contact email and Manual support handling.</p>
          </Section>

          <Section title="Third-Party Websites and Services">
            <p>The following providers are used:</p>
            <ul>
              <li>
                Website Hosting: Vercel. Used for hosting the marketing site. Optional for users. Privacy policy:{" "}
                <a
                  href="https://chordlist.app/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  https://chordlist.app/privacy
                </a>
                .
              </li>
            </ul>
          </Section>

          <Section title="Contact Us">
            <ul>
              <li>
                Email:{" "}
                <a
                  href="mailto:support@chordlist.app"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  support@chordlist.app
                </a>
              </li>
              <li>
                Support:{" "}
                <a
                  href="https://chordlist.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  https://chordlist.app
                </a>
              </li>
              <li>
                Website:{" "}
                <a
                  href="https://chordlist.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  https://chordlist.app
                </a>
              </li>
              <li>
                Marketing:{" "}
                <a
                  href="mailto:marketing@chordlist.app"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  marketing@chordlist.app
                </a>
              </li>
              <li>
                Phone:{" "}
                <a href="tel:+4917643792573" className="font-medium text-foreground underline underline-offset-4">
                  +4917643792573
                </a>
              </li>
            </ul>
          </Section>
        </div>
      </article>

      <footer className="mx-auto flex w-full max-w-3xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row">
        <a href="/" className="font-mono transition-colors hover:text-foreground">
          chordlist
        </a>
        <span>Local-first. No lock-in. Your data, always.</span>
      </footer>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-col gap-3 leading-relaxed text-muted-foreground [&_a]:break-words [&_li]:relative [&_li]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-foreground [&_li]:before:content-['—']">
        {children}
      </div>
    </section>
  )
}
