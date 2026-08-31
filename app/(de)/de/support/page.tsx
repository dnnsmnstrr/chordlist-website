import type { Metadata } from "next"

import { SupportPage } from "@/components/support-page"
import { pageMetadata } from "@/lib/page-metadata"
import { supportHref } from "@/lib/support-routes"
import { dictionary } from "@/locales"

const copy = dictionary("de").support

export const metadata: Metadata = pageMetadata({
  path: supportHref.de,
  title: copy.metadata.title,
  description: copy.metadata.description,
  image: "/og-de.png",
  language: "de",
})

export default function Page() {
  return <SupportPage language="de" />
}
