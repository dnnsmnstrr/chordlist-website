import type { Metadata } from "next"

import { imprintHref } from "@/lib/legal-routes"
import { siteConfig } from "@/lib/site-config"
import { defaultLanguage, dictionary, homeHref, languages, type Language } from "@/locales"

/** Route sets whose entries are translations of the same page. */
const translatedRoutes: ReadonlyArray<Record<Language, string>> = [homeHref, imprintHref]

/**
 * The `hreflang` set for one route.
 *
 * A route that exists in more than one language lists every one of them, so a
 * crawler serves a German reader `/de` instead of guessing. Everything else is a
 * self-reference plus `x-default` — still worth emitting, because it says this URL is the version
 * for every locale rather than leaving a translation to be inferred.
 */
export function siteAlternateLanguages(path: string) {
  const translatedRoute = translatedRoutes.find((routes) => Object.values(routes).includes(path))
  if (!translatedRoute) {
    return { [dictionary(defaultLanguage).locale.htmlLang]: path, "x-default": path }
  }

  const translations = Object.fromEntries(
    languages.map((language) => [dictionary(language).locale.htmlLang, translatedRoute[language]]),
  )
  return { ...translations, "x-default": translatedRoute[defaultLanguage] }
}

/** The blog feed, advertised site-wide so a reader finds it from any page. */
export const siteAlternateTypes = { "application/rss+xml": "/blog/rss.xml" }

type PageMetadataOptions = {
  /** Route path, leading slash and no trailing slash: "/docs". */
  path: string
  title: string
  description: string
  /** Overrides the generated card. Site-relative, like "/og.png". */
  image?: string
  imageAlt?: string
  /** The language the page renders in. */
  language?: Language
  /**
   * Fields merged on top — `robots`, an RSS `alternates.types`, and so on. The
   * social blocks are excluded on purpose: they are this helper's whole job.
   */
  extra?: Omit<Metadata, "openGraph" | "twitter">
}

/**
 * Metadata for a static page, with its own canonical URL, social card, and title.
 *
 * Next merges metadata shallowly, so a page that declares nothing inherits the
 * root layout's whole `openGraph` block — including `url`, which pointed every
 * internal page's share preview back at the home page. Going through here means a
 * page cannot forget one of the fields that has to be repeated.
 *
 * The card defaults to the one scripts/build-page-og.mjs writes for this route.
 */
export function pageMetadata({
  path,
  title,
  description,
  image,
  imageAlt,
  language = defaultLanguage,
  extra,
}: PageMetadataOptions): Metadata {
  const { locale, metadata: metadataCopy } = dictionary(language)
  const url = `${siteConfig.url}${path}`
  const card = image ?? `/og${path}.png`
  const alt = imageAlt ?? metadataCopy.socialImageAlt

  return {
    title,
    description,
    ...extra,
    alternates: {
      canonical: path,
      languages: siteAlternateLanguages(path),
      types: siteAlternateTypes,
      ...extra?.alternates,
    },
    openGraph: {
      type: "website",
      url,
      siteName: siteConfig.name,
      locale: locale.openGraph,
      title,
      description,
      images: [{ url: card, width: 1200, height: 630, alt }],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.social.x.handle,
      creator: siteConfig.social.x.handle,
      title,
      description,
      images: [{ url: card, alt }],
    },
  }
}

/**
 * The metadata every page inherits, in one language.
 *
 * This used to live in the single root layout. There are now one root layout per
 * language — the only way to give `<html lang>` the right value without making
 * every page dynamic — so it lives here instead, and the two layouts differ by
 * the argument rather than by a copied block that can drift.
 *
 * `path` is the home page in this language, because that is the route the root
 * layout itself renders; nested pages replace `alternates` and the social blocks
 * through `pageMetadata`.
 */
export function rootMetadata(language: Language): Metadata {
  const { locale, metadata: metadataCopy } = dictionary(language)
  const path = homeHref[language]
  // scripts/build-og-image.mjs writes one card per language: og.png for the default, og-<code>.png
  // beside it for the rest. The default keeps the unsuffixed name because every untranslated page
  // still falls back to it.
  const card = language === defaultLanguage ? "/og.png" : `/og-${language}.png`

  return {
    metadataBase: new URL(siteConfig.url),
    applicationName: siteConfig.name,
    title: {
      default: metadataCopy.defaultTitle,
      template: metadataCopy.titleTemplate,
    },
    description: metadataCopy.defaultDescription,
    keywords: [...metadataCopy.keywords],
    category: metadataCopy.category,
    authors: [{ name: siteConfig.operator, url: siteConfig.url }],
    creator: siteConfig.operator,
    publisher: siteConfig.operator,
    // Explicit rather than implied: crawlers default to indexing, but the "large"
    // image preview and the uncapped snippet are what let a result carry the OG
    // card and a full sentence instead of a two-line stub.
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    // No phone numbers on this site, so Safari's auto-linking only mangles things
    // like chord positions and version numbers.
    formatDetection: { telephone: false, address: false, email: false },
    alternates: { canonical: path, languages: siteAlternateLanguages(path), types: siteAlternateTypes },
    openGraph: {
      type: "website",
      locale: locale.openGraph,
      url: `${siteConfig.url}${path === "/" ? "" : path}`,
      siteName: siteConfig.name,
      title: metadataCopy.socialTitle,
      description: metadataCopy.socialDescription,
      images: [{ url: card, width: 1200, height: 630, alt: metadataCopy.socialImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.social.x.handle,
      creator: siteConfig.social.x.handle,
      title: metadataCopy.socialTitle,
      description: metadataCopy.twitterDescription,
      images: [{ url: card, alt: metadataCopy.socialImageAlt }],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", type: "image/x-icon", sizes: "16x16 32x32 48x48" },
        { url: "/icon-light-32x32.png", type: "image/png", sizes: "32x32", media: "(prefers-color-scheme: light)" },
        { url: "/icon-dark-32x32.png", type: "image/png", sizes: "32x32", media: "(prefers-color-scheme: dark)" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: "/apple-icon.png",
    },
  }
}
