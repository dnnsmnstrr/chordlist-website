import type { Metadata } from "next"

import { siteConfig } from "@/lib/site-config"
import { locale, metadataCopy } from "@/locales/en"

type PageMetadataOptions = {
  /** Route path, leading slash and no trailing slash: "/docs". */
  path: string
  title: string
  description: string
  /** Overrides the generated card. Site-relative, like "/og.png". */
  image?: string
  imageAlt?: string
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
export function pageMetadata({ path, title, description, image, imageAlt, extra }: PageMetadataOptions): Metadata {
  const url = `${siteConfig.url}${path}`
  const card = image ?? `/og${path}.png`
  const alt = imageAlt ?? metadataCopy.socialImageAlt

  return {
    title,
    description,
    ...extra,
    alternates: { canonical: path, ...extra?.alternates },
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
      images: [card],
    },
  }
}
