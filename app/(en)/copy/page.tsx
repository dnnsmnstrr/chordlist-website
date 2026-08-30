import type { Metadata } from "next"

import {
  CopyVariantReview,
  type CopyVariantLanguage,
  type CopyVariantRow,
} from "@/components/copy-variant-review"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { pageMetadata } from "@/lib/page-metadata"
import {
  activeCopyVariant,
  copyVariants,
  defaultCopyVariant,
  dictionary,
  languageNames,
  languages,
  type Dictionary,
} from "@/locales"
import { copyReviewCopy } from "@/locales/en"
import { requireAdmin } from "@/lib/server/admin-auth"

export const metadata: Metadata = pageMetadata({
  path: "/copy",
  title: copyReviewCopy.metadata.title,
  description: copyReviewCopy.metadata.description,
  // Unlisted, so it gets no generated card of its own.
  image: "/og.png",
  extra: { robots: { index: false, follow: false } },
})

/** Every string a variant is allowed to change, flattened in the order it appears on the page. */
function fieldsOf(home: Dictionary["home"]): readonly { label: string; text: string }[] {
  const { fields } = copyReviewCopy

  return [
    { label: fields.heroEyebrow, text: home.hero.eyebrow },
    { label: fields.heroSubheadline, text: home.hero.subheadline },
    { label: fields.heroDescription, text: home.hero.description },
    { label: fields.showcaseEyebrow, text: home.showcase.eyebrow },
    { label: fields.showcaseTitle, text: home.showcase.title },
    { label: fields.showcaseDescription, text: home.showcase.description },
    { label: fields.featuresTitle, text: home.features.title },
    ...home.features.items.flatMap((item, index) => [
      { label: fields.featureTitle(index + 1), text: item.title },
      { label: fields.featureBody(index + 1), text: item.body },
    ]),
    { label: fields.closingCtaTitle, text: home.closingCta.title },
    { label: fields.closingCtaDescription, text: home.closingCta.description },
  ]
}

const comparisons: readonly CopyVariantLanguage[] = languages.map((language) => {
  const byVariant = copyVariants.map((variant) => ({ variant, fields: fieldsOf(dictionary(language, variant).home) }))
  const shipping = fieldsOf(dictionary(language, defaultCopyVariant).home)

  const rows: CopyVariantRow[] = shipping.map((field, index) => ({
    label: field.label,
    cells: byVariant.map(({ variant, fields }) => {
      const text = fields[index]?.text ?? field.text
      // The shipping variant is the thing the others are compared against, so it is never marked as
      // repeating itself.
      return { variant, text, changed: variant === defaultCopyVariant || text !== field.text }
    }),
  }))

  return { code: language, name: languageNames[language], rows }
})

const columns = copyVariants.map((variant) => ({
  id: variant,
  ...copyReviewCopy.variants[variant],
  active: variant === activeCopyVariant,
}))

export default async function Page() {
  await requireAdmin("/copy")
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl px-6 py-20">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{copyReviewCopy.eyebrow}</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{copyReviewCopy.title}</h1>
        <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          {copyReviewCopy.introduction}
        </p>

        <div className="mt-8 max-w-2xl rounded-xl border border-border bg-muted/40 p-5">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {copyReviewCopy.switchTitle}
          </h2>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{copyReviewCopy.switchBody}</p>
        </div>

        <CopyVariantReview languages={comparisons} variants={columns} />
      </article>

      <SiteFooter />
    </main>
  )
}
