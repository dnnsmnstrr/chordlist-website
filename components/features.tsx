import { FileText, FolderHeart, HardDrive, Waypoints } from "lucide-react"

import { defaultLanguage, dictionary, type Language } from "@/locales"

export function Features({ language = defaultLanguage }: { language?: Language }) {
  const { home: homeCopy } = dictionary(language)

  // Paired by position against the copy, which `Localized` keeps as a four-tuple, so a
  // translation cannot drop an item and leave an icon without a card.
  const features = [
    { ...homeCopy.features.items[0], icon: FileText },
    { ...homeCopy.features.items[1], icon: HardDrive },
    { ...homeCopy.features.items[2], icon: FolderHeart },
    { ...homeCopy.features.items[3], icon: Waypoints },
  ] as const

  return (
    <section id="features" className="mx-auto w-full max-w-5xl px-6 py-20">
      <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
        {homeCopy.features.title}
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="bg-background p-6">
            <span className="flex size-9 items-center justify-center rounded-md bg-foreground text-background">
              <f.icon className="size-4" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-medium">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
