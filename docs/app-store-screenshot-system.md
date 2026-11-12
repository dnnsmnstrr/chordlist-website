# App Store screenshot system

Shared identity and tokens: [DESIGN.md](../DESIGN.md).

The App Store images are generated from the same simulator captures used by the press kit and social posts. Nothing
in `public/app-store-screenshots/` should be edited by hand.

```text
chordlist-app/press-kit/raw-screenshots/   Current simulator captures, per language
scripts/sync-app-assets.mjs                Copies iPhone, iPad, and both iPhone Duo displays into the website
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

- `public/app-store-screenshots/iphone/`, `ipad/`, `duo-outer/`, and `duo/` retain the colored-gradient treatment.
- `public/app-store-screenshots/analog/iphone/`, `analog/ipad/`, `analog/duo-outer/`, and `analog/duo/` use
  black-and-white photography.

The iPhone treatment contains five 1242×2688 PNGs for the 6.5-inch slot, and iPad contains five 2048×2732 PNGs for
the 13-inch slot. App Store Connect lists the iPhone Duo as two sizes, and each has its own set:

| Set | Folder | Size | Slides |
| --- | --- | --- | --- |
| iPhone Duo (folded), the outer display | `duo-outer/` | 1398×2034 portrait | The same five as the iPhone |
| iPhone Duo (unfolded), the inner display | `duo/` | 2853×2007 landscape | The same five as the iPhone |

These are App Store Connect-supported sizes. The iPhone frame adds the Dynamic Island because the raw simulator
capture contains only the status bar; the iPad and both Duo frames deliberately draw nothing over the capture.

The outer display puts its clock and Wi-Fi in a column down the right edge, with the toolbar buttons under them, and
search is a round button at the bottom right until it is tapped. The capture contains all of that, so the frame shows
it whole, at the capture's own aspect, with a corner radius that stays clear of the column. Unlike the iPhone, the
device does not bleed off the bottom of the canvas: that would cut the search button, the one thing that tells this
display apart at a glance.

The app repository captures seven screens for the outer display and no `06-Settings.png`, on purpose — a simulator
keyboard covers the menu there. No slide on any device uses the Settings screen, and none may be added to the outer
set. `05-Tag-Filter.png` and `08-Paywall.png` are synced but unused, as they are for the iPhone.

The build also writes one ZIP archive per treatment and device to
`public/app-store-screenshots/downloads/`. The public `/screens` page reads the manifest to display up to eight device-and-treatment sets and
offers both complete ZIP downloads and the original individual PNGs.

The analog template follows `docs/visual-language.md`: sharp interface screenshots sit over atmospheric rehearsal
photography with crushed blacks, blooming highlights, deterministic grain, dust, and scratches. Every slide has its
own photograph and its own grain seed, so no two frames share a background. The template's scrims and vignette are
opt-in and off for the screenshots: stacked over the photograph they crush every slide to the same black. The creative
assets switch on only the left-column scrim, behind their words.
Photography is selected and focused separately for each device so the crop remains intentional. Type and device
screenshots are never baked into or filtered with the photograph. The unfolded Duo canvas is landscape and uses the
full capture in a horizontal device frame. Its words sit in one row rather than a stack (`copy.layout: "split"`):
eyebrow and a one-line headline flush with the display's left edge, the supporting line against its right edge, resting
on the headline. The row lines up with the display itself, inside the bezel, not with the device frame. Joining the headline's two lines is what leaves the height for a larger device. No unfolded capture
may show the empty "No Song Selected" detail column: the library slide has a song open beside the list, and the
stage slide shows the song sheet full-width. The folded Duo canvas is portrait but much shorter than the iPhone's,
so it uses the iPhone's stack — words above, device below — with a tighter copy block, and reads the iPhone's copy
unchanged because it shows the same screens.

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
./scripts/capture-screenshots.sh --language de --device duo-outer --light
./scripts/capture-screenshots.sh --language de --device duo-outer --dark
./scripts/capture-screenshots.sh --language de --device duo --light
./scripts/capture-screenshots.sh --language de --device duo --dark
```

For English, omit `--language de`. Fold the Duo in DeviceHub for `--device duo-outer` and unfold it for
`--device duo`; the script waits and asks when the fold is wrong. Then run `pnpm build:screens` to sync the raw
images and regenerate both treatments. The Duo is captured in English only so far, so the German sets skip both Duo
displays — a language without captures for a device is omitted for that device, like the existing iPhone and iPad sets.

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
| `duo-header.png` | 3840×1646 | An alternative header showing both iPhone Duo displays |
| `duo-event-card.png` | 3840×2160 (16:9) | Event card for an event announcing iPhone Duo support |
| `duo-event-details.png` | 2160×3840 (9:16) | Event details page for the same event |

The three `duo-*` assets are the same placements with the iPhone Duo in them: the unfolded display behind, the folded
one in front of it, and on the portrait details page the folded display alone. They are alternatives, not additions
Apple asks for — upload the Duo header in place of the regular one, or use the event pair for an In-App Event about
Duo support. They need Duo captures, so a language without them builds the other five and skips these.

```text
scripts/build-app-store-creative.mjs         Formats, safe areas, and art direction (CONFIG)
scripts/lib/app-store-creative-template.mjs  Landscape and event composition
scripts/lib/app-store-copy.mjs               creativeCopy — which words each asset carries
public/app-store-creative/                   Generated PNGs and manifest, per language and treatment
```

The header, search, and universal sizes are the canvases of Apple's own templates; the event sizes are the maximum
App Store Connect accepts, twice its minimum. Apple publishes no pixel insets for safe areas — its templates draw a
centered one and the crop varies by device — so each format's `safe` box in `CONFIG` is that centered area, and
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

The images are opaque PNGs, as Apple requires. Each language and treatment also gets a ZIP of its assets in
`public/app-store-creative/downloads/`, and `/screens` lists every file under the screenshot sets with that ZIP beside
each group.

