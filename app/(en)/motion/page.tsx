import { access } from "node:fs/promises"
import path from "node:path"

import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { MotionEditor } from "@/components/motion-editor"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { listSocialStarts } from "@/lib/motion/social-starts"
import { REMOTION_PUBLIC, listDefinitions, listOutputs, listPhotos, readCatalog, snippetUsage } from "@/lib/motion/store"
import { requireAdmin } from "@/lib/server/admin-auth"
import { motionEditorCopy } from "@/locales/en"

/// The motion wizard: write a definition into content/motion, preview it, and render it.
///
/// A local authoring tool like /editorial — it writes the checkout and starts renders on this
/// machine — so production 404s it rather than rendering buttons that could never work.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: motionEditorCopy.metadata.title,
  description: motionEditorCopy.metadata.description,
  robots: { index: false, follow: false },
}

export default async function MotionPage() {
  await requireAdmin("/motion")
  if (process.env.NODE_ENV === "production") notFound()

  const definitions = await listDefinitions()
  const catalog = await readCatalog()
  const recordingsSynced = await access(
    path.join(REMOTION_PUBLIC, "generated", "motion", "press", "chordlist-demo-light.mp4"),
  ).then(
    () => true,
    () => false,
  )

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div id="main-content" tabIndex={-1}>
        <MotionEditor
          saved={await Promise.all(definitions.map(async (entry) => ({ ...entry, outputs: await listOutputs(entry.slug) })))}
          socialStarts={await listSocialStarts(catalog)}
          catalog={catalog}
          usage={snippetUsage(definitions)}
          photos={await listPhotos()}
          recordingsSynced={recordingsSynced}
        />
      </div>
      <SiteFooter />
    </main>
  )
}
