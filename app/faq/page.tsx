import type { Metadata } from "next"

import { CollapsibleSection } from "@/components/collapsible-section"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { siteConfig } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: `Answers about files, privacy, pricing, compatibility, and availability for ${siteConfig.name}.`,
  alternates: { canonical: "/faq" },
}

const questions = [
  {
    question: "Where are my songs stored?",
    answer: (
      <p>
        In a folder you choose through the Files picker. {siteConfig.name} reads and writes the Markdown files in that
        folder and does not upload or sync your library. If you select a folder managed by iCloud Drive or another file
        provider, that provider may sync it according to your settings.
      </p>
    ),
  },
  {
    question: "Can I open my songs without chordlist?",
    answer: (
      <p>
        Yes. Each song is an ordinary Markdown file containing its title, artist, chord progression, tags, and lyrics.
        You can open, copy, move, back up, or edit those files with other compatible apps.
      </p>
    ),
  },
  {
    question: "Does it work offline?",
    answer: (
      <p>
        Yes. Browsing, editing, searching, transposing, and playing from your local library work offline. Importing a
        song from a website requires a connection to retrieve the page you requested.
      </p>
    ),
  },
  {
    question: "Does chordlist collect analytics?",
    answer: (
      <p>
        The app can send anonymous usage and device information through TelemetryDeck. You can disable this in Settings.
        Sharing song titles, artists, and chord progressions is a separate opt-in setting; lyrics and tags are never
        included.
      </p>
    ),
  },
  {
    question: "How much will it cost?",
    answer: (
      <p>
        The app is planned as a free download for libraries of up to {siteConfig.freeSongLimit} songs, with an optional
        one-time purchase for unlimited songs. Final pricing will be announced before launch.
      </p>
    ),
  },
  {
    question: "Which devices are supported?",
    answer: <p>{siteConfig.name} is built for iPhone and iPad and requires {siteConfig.minimumOS}.</p>,
  },
  {
    question: "Will there be an Android version?",
    answer: <p>An Android version is not currently planned.</p>,
  },
] as const

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <header className="border-b border-border pb-8">
          <p className="font-mono text-sm text-muted-foreground">{siteConfig.name}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">Frequently Asked Questions</h1>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            The practical details about your files, privacy, compatibility, and launch.
          </p>
        </header>

        <div className="mt-4 flex flex-col">
          {questions.map((item, index) => (
            <CollapsibleSection key={item.question} title={item.question} defaultOpen={index === 0}>
              <div className="text-sm leading-relaxed text-muted-foreground">{item.answer}</div>
            </CollapsibleSection>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          Still have a question? Email{" "}
          <a
            href={`mailto:${siteConfig.contact.support}`}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {siteConfig.contact.support}
          </a>
          .
        </p>
      </article>

      <SiteFooter compact />
    </main>
  )
}

