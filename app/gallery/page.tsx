import type { Metadata } from "next"

import { ScreenshotGallery, type Screenshot } from "@/components/screenshot-gallery"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { galleryCopy } from "@/locales/en"

export const metadata: Metadata = {
  title: galleryCopy.metadata.title,
  description: galleryCopy.metadata.description,
  robots: { index: false, follow: false },
}

const images: readonly Screenshot[] = [
  {
    lightSrc: "/gallery/phone-on-sheet-music.png",
    darkSrc: "/gallery/phone-on-sheet-music.png",
    width: 1122,
    height: 1402,
    ...galleryCopy.images[0],
  },
  {
    lightSrc: "/gallery/guitarist-in-motion.png",
    darkSrc: "/gallery/guitarist-in-motion.png",
    width: 1536,
    height: 1024,
    ...galleryCopy.images[1],
  },
  {
    lightSrc: "/gallery/piano-with-sheet-music.png",
    darkSrc: "/gallery/piano-with-sheet-music.png",
    width: 1535,
    height: 1024,
    ...galleryCopy.images[2],
  },
  {
    lightSrc: "/gallery/piano-keys-in-motion.png",
    darkSrc: "/gallery/piano-keys-in-motion.png",
    width: 1539,
    height: 1022,
    ...galleryCopy.images[3],
  },
]

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article className="mx-auto w-full max-w-5xl px-6 py-16">
        <header className="max-w-2xl border-b border-border pb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{galleryCopy.eyebrow}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{galleryCopy.title}</h1>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{galleryCopy.introduction}</p>
        </header>

        <div className="mt-10">
          <ScreenshotGallery screenshots={images} variant="gallery" />
        </div>
      </article>

      <SiteFooter />
    </main>
  )
}
