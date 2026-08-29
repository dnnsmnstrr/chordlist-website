import type { Metadata } from "next"

import { ImprintPage } from "@/components/imprint-page"
import { imprintHref } from "@/lib/legal-routes"
import { pageMetadata } from "@/lib/page-metadata"
import { dictionary } from "@/locales"

const copy = dictionary("de").imprint

export const metadata: Metadata = pageMetadata({
  path: imprintHref.de,
  title: copy.metadata.title,
  description: copy.metadata.description,
  image: "/og-de.png",
  language: "de",
  extra: { alternates: { languages: { en: imprintHref.en, de: imprintHref.de, "x-default": imprintHref.en } } },
})

export default function Page() {
  return <ImprintPage language="de" />
}
