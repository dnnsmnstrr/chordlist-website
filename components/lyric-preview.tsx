export function LyricPreview() {
  return (
    <section id="preview" className="mx-auto w-full max-w-5xl px-6 py-20">
      <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
        One song, one file.
      </h2>
      <p className="mt-3 max-w-xl text-pretty leading-relaxed text-muted-foreground">
        Chords sit right above the words, so you can read and play at a glance.
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-border">
        <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
          <span className="size-3 rounded-full border border-border" />
          <span className="size-3 rounded-full border border-border" />
          <span className="size-3 rounded-full border border-border" />
          <span className="ml-2 font-mono text-xs text-muted-foreground">let-it-be.md</span>
        </div>
        <pre className="overflow-x-auto bg-background p-6 font-mono text-sm leading-relaxed text-foreground">
{`# Let It Be

## Verse

[C]When I find myself in [G]times of trouble
[Am]Mother Mary [F]comes to me
[C]Speaking words of [G]wisdom, let it [F]be [C]

## Chorus

[Am]Let it [G]be, let it [F]be
[C]Let it be, let it [G]be`}
        </pre>
      </div>
    </section>
  )
}
