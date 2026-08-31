import type { Metadata } from "next"

import { SupportPage } from "@/components/support-page"
import { pageMetadata } from "@/lib/page-metadata"
import { supportHref } from "@/lib/support-routes"
import { dictionary } from "@/locales"

const copy = dictionary("en").support

export const metadata: Metadata = pageMetadata({
  path: supportHref.en,
  title: copy.metadata.title,
  description: copy.metadata.description,
})

export default function Page() {
  return <SupportPage language="en" />
}
