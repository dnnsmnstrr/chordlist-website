import type { Metadata } from "next"

import { FaqPage } from "@/components/faq-page"
import { faqHref } from "@/lib/faq-routes"
import { pageMetadata } from "@/lib/page-metadata"
import { dictionary } from "@/locales"

const copy = dictionary("de").faq

export const metadata: Metadata = pageMetadata({
  path: faqHref.de,
  title: copy.metadata.title,
  description: copy.metadata.description,
  image: "/og-de.png",
  language: "de",
})

export default function Page() {
  return <FaqPage language="de" />
}
