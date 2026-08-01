import { ArrowRightLeft, FileText, FolderHeart, HardDrive } from "lucide-react"

const FEATURES = [
  {
    icon: FileText,
    title: "Plain markdown",
    body: "Every song is a readable .md file. Write lyrics and chords with nothing but text you already understand.",
  },
  {
    icon: HardDrive,
    title: "Works offline",
    body: "Browse, edit, search, and transpose your existing library without a connection. Online import runs only when you request it.",
  },
  {
    icon: FolderHeart,
    title: "Your files stay yours",
    body: "Chordlist does not upload your song library. Choose where the files live and share them only when you decide to.",
  },
  {
    icon: ArrowRightLeft,
    title: "No lock-in",
    body: "Export and move your files anytime. Open them in any editor — the data always belongs to you.",
  },
]

export function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-5xl px-6 py-20">
      <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
        Built around files you own.
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
        {FEATURES.map((f) => (
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
