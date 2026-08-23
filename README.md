# chordlist website

Marketing, documentation, press, and blog site for **chordlist**, the local-first songbook app for
iPhone and iPad. It is a Next.js App Router project deployed on Vercel.

## Local development

Use pnpm; `pnpm-lock.yaml` is the repository's source of truth.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). `pnpm dev` runs the app-asset sync first, so a
sibling `../chordlist-app` checkout automatically supplies its latest screenshots. If the app lives
elsewhere, set `CHORDLIST_APP_REPO` to its absolute path.

## Important scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Sync app assets, then start the local development server. |
| `pnpm check` | Run ESLint, TypeScript, and a production build. This is the required pre-commit check. |
| `pnpm build` | Sync app assets and create the production build. |
| `pnpm build:all` | Sync app assets, regenerate every visual asset, build the App Store sets, and create the production build. |
| `pnpm start` | Serve an existing production build locally. |
| `pnpm lint` | Run ESLint with warnings treated as failures. |
| `pnpm test` | Run the chordlink URL-contract and AASA tests. |
| `pnpm typecheck` | Run TypeScript without emitting files. |
| `pnpm sync:app` | Copy current iPhone/iPad screenshots and the available press-kit archive from the app repository. |
| `pnpm sync:video` | Copy prepared demo clips and rebuild the Remotion asset manifest. |
| `pnpm sync:all` | Run both app-asset syncs. |
| `pnpm sync:assets` | Backward-compatible alias for `sync:app`, used by website dev and builds. |
| `pnpm build:icons` | Regenerate the favicon, app icon, and related icon assets in `public/`. |
| `pnpm build:og` | Regenerate the site, page, and blog Open Graph images. |
| `pnpm build:social` | Render social images and their manifest from `content/social/`. |
| `pnpm build:screens` | Sync app captures, then generate the iPhone and iPad App Store upload sets. |
| `pnpm video:studio` | Sync current demo clips and open the interactive Remotion editor. |
| `pnpm video:render:campaign` | Render the short, standard, and documentary light promo cuts. |
| `pnpm video:render:both` | Render the light and dark vertical demo masters. |

`pnpm check` remains the full project gate; run `pnpm test` alongside it for the chordlink route contract.

## Core workflows

### Make a website change

1. Put UI copy in `locales/en.ts`, product facts and links in `lib/site-config.ts`, and layout or
   behaviour in `app/` or `components/`.
2. Run `pnpm dev` and review the affected routes in light and dark mode.
3. Run `pnpm check` before committing.

The site uses Tailwind CSS v4 tokens defined in `app/globals.css`. Components should use semantic
tokens such as `bg-background` and `text-muted-foreground` instead of raw colours.

### Sync app screenshots and the press kit

Simulator captures are owned by the `chordlist-app` repository. From this repository, run:

```bash
pnpm sync:assets
```

The script copies light and dark iPhone and iPad captures into `public/app-screenshots/`. Captures in
another language come along with them: English stays at the root and every other language nests under
its code (`public/app-screenshots/de/light/`), mirroring the app repository. If
`chordlist-app/build/press-kit/chordlist-press-kit.zip` exists, it also updates the downloadable
archive in `public/press/`.

When adding or renaming a screenshot, update all of the following:

- `screenshotNames` in `scripts/sync-app-assets.mjs`;
- the screenshot lists in `components/app-showcase.tsx` and `app/press/page.tsx`;
- the corresponding copy in `locales/en.ts`; and
- any social or App Store definitions that name the file.

Commit the synced outputs with the code that references them.

### Generate website artwork

Generated files in `public/` should not be edited by hand. Change their source or generator, run the
matching command, visually inspect the result, and commit both the source change and output.

```bash
pnpm build:all

# Or regenerate one asset family:
pnpm build:icons
pnpm build:og
pnpm build:social
```

`pnpm build:all` is the release-oriented one-shot workflow. It syncs app inputs before any generator
uses them, regenerates all visual outputs, builds the App Store screenshots, and finishes by proving
the website can compile for production.

- Icon and Open Graph generators are configured in `scripts/`.
- Blog Open Graph cards are generated for every post, including scheduled posts.
- Social definitions live in `content/social/<slug>.md`; rendered images and metadata go to
  `public/social/`.

See [Social media system](docs/social-media-system.md) and
[Visual language](docs/visual-language.md) for formats and review rules.

### Edit and render demo videos

The iOS repository owns recording and chapter extraction; this repository owns video composition,
branding, copy, animation, and final exports. Prepare the footage in `chordlist-app` first:

```bash
scripts/capture-video.sh --no-open
scripts/prepare-video-editor-assets.sh
```

Then work from this repository:

```bash
pnpm video:studio
pnpm video:render:both
```

The Studio exposes three linked compositions: a roughly 15-second short cut, the standard
roughly 30-second promo, and a roughly 45-second documentary cut with explanatory scene copy.
Run `pnpm video:render:campaign` to render all three light versions.

Both commands run `sync:video` before opening or rendering. With the standard sibling checkout,
the app repository is found automatically; otherwise set `CHORDLIST_APP_REPO` to its absolute path.
Use `pnpm sync:all` when screenshots, the downloadable press archive, and video footage should all
be refreshed together. See [the Remotion editor guide](video/README.md) for timeline controls,
audio, manual shots, and repeatable render presets.

### Build App Store screenshots

```bash
pnpm build:screens
```

This syncs the raw app captures first, validates them, and writes the generated upload sets and
manifest to `public/app-store-screenshots/`. Screenshot selection, colours, and layout geometry are
configured in `scripts/build-app-store-screenshots.mjs`; the words are in
`scripts/lib/app-store-copy.mjs`, one block per language, built on the shared `VOCABULARY.md`
wording. Every language there gets its own sets, rendered from that language's captures. The
generated sets can be reviewed and downloaded from `/screens`; each language, device, and treatment
also gets a ZIP archive.

See [App Store screenshot system](docs/app-store-screenshot-system.md) for supported sizes,
treatments, and the full pipeline.

### Add or publish a blog post

1. Add `content/blog/<slug>.md`. The filename becomes the permanent URL, so choose it carefully.
2. Include valid frontmatter: `title`, `description`, `created`, `published`, and `tags`; `cover`,
   `coverAlt`, and `draft` are optional.
3. Add images under `public/blog/<slug>/`.
4. Run `pnpm build:og` to generate the post's share card.
5. Run `pnpm check` and review the post plus its Open Graph image.

Draft and future-dated posts appear in local and Vercel preview builds but stay hidden in production.
Scheduled posts become public through hourly revalidation without requiring a new deployment. See
[Blog editorial guidelines](docs/blog-editorial-guidelines.md) before publishing.

## Project map

```text
app/                 Routes, layouts, metadata routes, and global styles
components/          Shared sections and interactive components
content/blog/        Markdown blog posts
content/social/      Social asset definitions and captions
docs/                Editorial and generated-asset documentation
lib/                 Site configuration, content parsing, and shared utilities
locales/en.ts        User-facing website copy
scripts/             Asset sync and image-generation scripts
public/              Static, generated, and synced assets
video/               Remotion demo editor, render presets, and disposable local media
```

## Deployment

Vercel deploys every merge to `main` automatically. Pull requests and branches receive preview
deployments. Run `pnpm check` locally before merging; it reproduces the production compilation and
catches invalid content as well as code errors.

The repository is also linked to its [v0 project](https://v0.app/chat/projects/prj_AsUQPET3z9WZP5VoDtZIfAsTxWwR),
so changes may arrive as commits from v0 chats.

### chordlink launch gate

The public product routes are `/chordlink` and `/de/chordlink`; shared setup routes sit behind
`/link/<public-id>`. `lib/chordlink.ts` treats two-to-six digit IDs as opaque strings. The shipped
three-digit edition rule and generic fallback are data, so a future two-digit dark-edition rule can
be inserted without changing an NFC URL.

`siteConfig.chordlink` is the only checkout switch. The Payment Link remains disabled until all of
`sellerAddressConfirmed`, `legalTextReviewed`, and `postageDimensionsConfirmed` are true and both a
live `stripePaymentLink` and its `stripePaymentLinkId` are present. Before changing those values:

1. Have the bilingual seller, withdrawal, return-cost, and §19 UStG wording reviewed and replace the
   launch-gate notice with the complete postal identity and return address.
2. Confirm that the packaged chordlink fits the intended Deutsche Post letter product.
3. In Stripe, create `chordlink — first edition` at EUR 9.99 including German postage, fix quantity
   at one, require a German delivery address, and cap the Payment Link at ten completed payments.
4. Set the completion URL to
   `https://chordlist.app/chordlink/complete?session_id={CHECKOUT_SESSION_ID}`. The server retrieves
   that session before showing the localized confirmation page; invalid or unpaid sessions return
   to the product page.
5. Put the live Payment Link URL and `plink_…` ID in site/backend configuration. Add a dedicated
   `STRIPE_CHECKOUT_SESSION_READ_KEY` sensitive environment variable with read-only Checkout Session
   access, configure the signed Supabase webhook, test one delayed-payment event, and only then
   enable the readiness flags.

Never add a unit number, Checkout Session, buyer email, delivery address, or Apple offer code to
Vercel Analytics. Individual `/link/*` requests redirect to the shared setup route and are noindex.

### Public chordlink model

`public/model.html` is a self-contained 3D configurator and STL exporter that can also be downloaded
and shared as one file. Its public default is deliberately unnumbered:

- `/model.html` — unnumbered model.
- `/model.html?nfc=1` — unnumbered model with the NFC cavity enabled.
- `/model.html?nfc=1&numbering=1` — opt-in personal numbering controls.

The product page uses `ChordlinkModelViewer` to render the optimized static
`/models/chordlink.glb` directly on a transparent stage. The DIY page has a single model action that
opens the full generator with the NFC cavity enabled.

The bilingual instructions at `/chordlink/diy` and `/de/chordlink/diy` recommend six-digit personal
link IDs so separate home-made tags can have independent actions. These IDs are public routing
identifiers, not globally unique credentials. The DIY page
must continue to state that self-printed tags are outside the official edition and do not include
the paid unlimited entitlement.

## Localization

Copy lives in `locales/`. `en.ts` is the site as it ships today; `de.ts` is a partial German
translation of `locale`, `commonCopy`, `metadataCopy` and `homeCopy`. The remaining objects —
`docsCopy`, `faqCopy`, `pressCopy`, `screensCopy`, `privacyCopy`, `blogCopy`, `galleryCopy`,
`screenshotGalleryCopy`, `pianoCopy` — are still English only, and every page still imports
`@/locales/en` directly. Locale selection and routing are not wired up yet.

Each German object is typed `Localized<typeof …>` (see `locales/types.ts`): the English shape with
its wording set free. Adding a key to `en.ts` therefore fails the German build instead of silently
rendering English, which is what keeps a partial translation honest.

### Translation editor

```bash
pnpm dev   # then http://localhost:3000/translations
```

A table of every app string across every language, editable in place, plus the shared glossary and
a button that provisions a new language.

Strings carry a badge for where they came from: `share extension` for the extension's own catalog,
`debug` for wording only compiled into debug builds. Debug strings are hidden by default — nobody
using the app will ever read the debug menu — and the toggle says how many are being held back.
That comes from `string-origins.json`, which the app repository generates from the compiler's own
extraction; without it nothing is badged rather than anything being guessed at.

**It only runs locally.** Editing means writing files in the `chordlist-app` checkout beside this
one; a deployed build can reach neither the filesystem nor that repository, so the route 404s in
production and the API refuses with an explanation. It finds the app repository the same way
`sync:app` does — `../chordlist-app`, or `CHORDLIST_APP_REPO`.

Each edit writes straight through to the file it came from. There is no save button, because a
staged buffer that can disagree with disk is the drift this whole arrangement exists to prevent.
Writes land in:

| Edited | Written to |
| --- | --- |
| A string or plural | `scripts/translations/<language>.json`, then straight into the String Catalogs |
| A glossary term or phrase | `VOCABULARY.md`, then `vocabulary.json` |
| A new language | both of the above, plus `LANGUAGES` in `apply-translations.py` |

The editor writes the *sources* and hands off to the app repository's own scripts —
`apply-translations.py` and `build-vocabulary.py` — for everything derived from them, rather than
deriving it a second time in TypeScript. So an edit reaches the String Catalogs immediately, and
there is exactly one implementation of each derivation to keep correct. Commit the result in the
app repository.

Run `scripts/sync-string-catalogs.sh` there only when you have added or changed a string in Swift,
which is what re-extracts the keys.

Provisioning deliberately stops short of the steps that need judgement or that risk a file worth
protecting: `knownRegions` in the Xcode project, a `case` in the capture script, a fixture set of
songs a speaker would recognise, and `locales/<code>.ts` here. The UI lists them when it finishes.
A provisioned language starts empty rather than machine-translated — an untranslated string is
visible and fails the build, a plausible wrong one is not.

### Shared wording

Terms the app and the site both use — *Songtext*, *Akkordfolge*, *Interpret*, the tagline, the
product description — are not retyped here. They come from `VOCABULARY.md` in the chordlist-app
repository, which is the single source of truth for wording across the app, this site, the App
Store listing and the press kit.

`pnpm sync:app` copies the generated `vocabulary.json` into `locales/`, exactly as it copies
screenshots, and `locales/vocabulary.ts` exposes it:

```ts
import { phrase, term } from "@/locales/vocabulary"

phrase("tagline", "de")   // Deine Songtexte und Akkorde – als Dateien in deiner Tasche.
term("lyrics", "de")      // Songtext
```

Both throw on an unknown key rather than falling back, so a term that has been renamed in the app
repository surfaces at build time. To change a shared word, edit `VOCABULARY.md` in chordlist-app,
run `scripts/build-vocabulary.py` there, then `pnpm sync:app` here. The committed copy means a
build without the app repository checked out still works.
