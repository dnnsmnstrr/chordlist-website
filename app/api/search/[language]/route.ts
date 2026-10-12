import { notFound } from "next/navigation"

import { siteSearchIndex } from "@/lib/site-search-index"
import { isLanguage, languages } from "@/locales"

/**
 * The site-wide search index for one language, as JSON.
 *
 * Fetched by the search fields the first time a reader focuses one, rather than shipped in every
 * page's bundle. Prerendered per language and revalidated with the blog, so a post that goes live
 * becomes searchable within the same hour it appears on /blog — keep this `revalidate` in step
 * with the other blog-aware routes.
 */
export const revalidate = 3600
export const dynamicParams = false

export function generateStaticParams() {
  return languages.map((language) => ({ language }))
}

export async function GET(_request: Request, context: { params: Promise<{ language: string }> }) {
  const { language } = await context.params
  if (!isLanguage(language)) notFound()

  return Response.json(await siteSearchIndex(language))
}
