import type { Metadata, Viewport } from "next"

import { RootShell } from "@/components/root-shell"
import { rootMetadata } from "@/lib/page-metadata"

export const metadata: Metadata = rootMetadata("en")

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootShell language="en">{children}</RootShell>
}
