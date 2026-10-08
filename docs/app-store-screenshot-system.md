# App Store screenshot system

Shared identity and tokens: [DESIGN.md](../DESIGN.md).

The App Store images are generated from the same simulator captures used by the press kit and social posts. Nothing
in `public/app-store-screenshots/` should be edited by hand.

```text
chordlist-app/press-kit/raw-screenshots/   Current simulator captures, per language
scripts/sync-app-assets.mjs                Copies iPhone and iPad inputs into the website
scripts/build-app-store-screenshots.mjs    Validates, renders, and writes the upload set
scripts/lib/app-store-copy.mjs             The words on the images, per language
scripts/lib/vocabulary.mjs                 The shared VOCABULARY.md wording, for build scripts
scripts/lib/app-store-screenshot-template.mjs   Shared composition and device frames
public/app-store-screenshots/              Generated PNGs and manifest
app/screens/page.tsx                       Website gallery and download page
```

Run:

```bash
pnpm build:screens
```

The command first runs `pnpm sync:assets`, so it uses the latest app captures when the repositories are siblings. Set
`CHORDLIST_APP_REPO=/absolute/path/to/chordlist-app` for another checkout.

The build produces two treatments with identical copy and product screenshots:

- `public/app-store-screenshots/iphone/` and `ipad/` retain the colored-gradient treatment.
- `public/app-store-screenshots/analog/iphone/` and `analog/ipad/` use black-and-white photography.

Each treatment contains five 1242×2688 PNGs for the 6.5-inch iPhone slot and five 2048×2732 PNGs for the 13-inch
iPad slot. Both are App Store Connect-supported portrait sizes. The iPhone frame adds the Dynamic Island because the
raw simulator capture contains only the status bar; iPad images deliberately do not.

The build also writes one ZIP archive per treatment and device to
`public/app-store-screenshots/downloads/`. The public `/screens` page reads the manifest to display the four sets and
offers both complete ZIP downloads and the original individual PNGs.

The analog template follows `docs/visual-language.md`: sharp interface screenshots sit over atmospheric rehearsal
photography with crushed blacks, blooming highlights, deterministic grain, dust, and scratches. Every slide has its
own photograph and its own grain seed, so no two frames share a background. The template's scrims and vignette are
opt-in and off for the screenshots: stacked over the photograph they crush every slide to the same black. The creative
assets switch on only the left-column scrim, behind their words.
Photography is selected and focused separately for iPhone and iPad so the crop remains intentional. Type and device
screenshots are never baked into or filtered with the photograph.

Colors, source screenshots, and the format-specific geometry are data in the `CONFIG` block of
`scripts/build-app-store-screenshots.mjs`. The layout itself stays in the template module so every slide uses the same
typography and device treatment.

## Languages

`scripts/lib/app-store-copy.mjs` holds the words, keyed by language and then by slide id. Every language listed there
gets the full matrix of treatments and devices, so a translation is a new key rather than a second generator.

Product wording is read from `VOCABULARY.md` through `scripts/lib/vocabulary.mjs` rather than retyped, which is why the
German images say *Songtext*, *Akkordfolge*, and *Bibliothek* and cannot drift from the app, the site, and the listing.
A term that is missing a translation fails the build rather than falling back to English. Adding a language means adding
its block here and its column in `VOCABULARY.md`; the builder checks both before it renders anything, and warns when a
translated headline looks too wide for its column, since headlines are hand-broken and never wrap.

Each language is rendered from **its own** simulator captures — never the English ones, because a German headline over
an English interface is a listing that lies. Capture them in the app repository:

```bash
./scripts/capture-screenshots.sh --language de --device iphone --light
./scripts/capture-screenshots.sh --language de --device iphone --dark
./scripts/capture-screenshots.sh --language de --device ipad --light
./scripts/capture-screenshots.sh --language de --device ipad --dark
```

`pnpm sync:app` then copies whatever exists. English keeps the original paths on both sides of the copy, and every other
language nests under its code: captures at `public/app-screenshots/de/light/`, output at
`public/app-store-screenshots/de/…`, archives at `downloads/chordlist-de-<treatment>-<device>.zip`. The manifest carries
the language, and `/screens` lists each language's sets separately.

A language that has only been captured in one appearance still gets a full set: the slide keeps its art direction and
borrows the other appearance's capture. A language with no captures for a device is skipped rather than faked. Both
cases are printed at the end of the build with the command that fixes them — English is the exception and fails, because
that set has to exist.

## Creative assets

iOS 27 and iPadOS 27 add placements beyond the screenshots, described in Apple's
[asset best practices](https://developer.apple.com/app-store/asset-best-practices/). `pnpm build:creative` renders
them from the same captures, copy, and treatments:

| Asset | Size | Where it appears |
| --- | --- | --- |
| `header.png` | 3840×1646 | Product page header, above the app icon |
| `search.png` | 3840×2560 (3:2) | Search results, in place of the first screenshots |
| `universal.png` | 5244×2950 (16:9) | One master Apple crops into either of the above |
| `event-card.png` | 3840×2160 (16:9) | In-App Event card |
| `event-details.png` | 2160×3840 (9:16) | In-App Event details page |

```text
scripts/build-app-store-creative.mjs         Formats, safe areas, and art direction (CONFIG)
scripts/lib/app-store-creative-template.mjs  Landscape and event composition
scripts/lib/app-store-copy.mjs               creativeCopy — which words each asset carries
public/app-store-creative/                   Generated PNGs and manifest, per language and treatment
```

The header, search, and universal sizes are the canvases of Apple's own templates; the event sizes are the maximum
App Store Connect accepts, twice its minimum. Apple publishes no pixel insets for safe areas — its templates draw a
centred one and the crop varies by device — so each format's `safe` box in `CONFIG` is that centred area, and
everything with words or a device stays inside it. The universal asset's safe area is derived rather than chosen: the
middle that survives both the header crop and the search crop, inset by the stricter of their safe areas. Check each
one in App Store Connect's preview before submitting, and adjust `safe` there if Apple's crop disagrees.

Nothing new is written for these images. The header and universal assets carry the tagline, checked against
`VOCABULARY.md` like the Open Graph card; the search asset repeats the first screenshot's eyebrow and headline. Apple
shows them at about a tenth of their pixel size, so they carry no paragraph, and the builder warns when a headline has
to shrink below what reads at that size. In-App Event media has no words at all: App Store Connect sets the event's
name, badge, and description over it, and Apple applies its own crops and gradients.

Apple's content rules for every asset apply here too: no prices, discounts, URLs, copyright symbols, awards, other
platforms' logos, or Apple recognitions.

The images are opaque PNGs, as Apple requires. Each language and treatment also gets a ZIP of its five assets in
`public/app-store-creative/downloads/`, and `/screens` lists every file under the screenshot sets with that ZIP beside
each group.

