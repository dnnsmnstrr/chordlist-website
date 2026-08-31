<!-- stripe-projects-cli managed:claude-md:start -->
look at AGENTS.md for your rules
<!-- stripe-projects-cli managed:claude-md:end -->

# chordlist-website

Marketing and documentation site for **chordlist**, a local-first songbook app for iPhone and
iPad that stores lyrics and chords as plain Markdown files. The site is a small, static-leaning
Next.js App Router project deployed on Vercel; every merge to `main` deploys automatically.

The repository is linked to a [v0](https://v0.app) project, so commits may also arrive from v0
chats. Keep changes small and idiomatic so they survive that round trip.

## Commands

Use **pnpm** (there is a `pnpm-lock.yaml` and a `pnpm-workspace.yaml`; do not introduce npm or
yarn lockfiles).

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server on http://localhost:3000 (runs `sync:assets` first via `predev`) |
| `pnpm build` | Production build (runs `sync:assets` first via `prebuild`) |
| `pnpm build:all` | Sync app inputs, regenerate all visual assets and App Store sets, then build the site |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint, `--max-warnings=0` — warnings fail |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm check` | `lint && typecheck && build` — **run this before committing** |
| `pnpm sync:assets` | Copy app screenshots and the press-kit zip from the iOS app repo |
| `pnpm build:icons` | Regenerate every favicon asset in `public/` |
| `pnpm build:og` | Regenerate `public/og.png`, one card per static page in `public/og/`, **and** one per blog post in `public/blog/og/` |
| `pnpm build:social` | Regenerate every social asset in `public/social/` from `content/social/` |
| `pnpm build:emails` | Regenerate every email in `public/emails/` from `content/emails/` |

There is no test suite. `pnpm check` is the gate.

## Layout

```
app/                 App Router pages (all server components unless noted)
  (en)/              English route group — everything except the German home
    layout.tsx       English root layout: rootMetadata("en") around <RootShell>
    page.tsx         Home page — three lines around <HomePage language="en" />
    docs/  faq/  support/  press/  privacy/    One page.tsx each
    blog/            Index, [slug] post page, and rss.xml route handler
  (de)/              German route group
    layout.tsx       German root layout: rootMetadata("de") around <RootShell>
    de/page.tsx      The German home page, at /de
    de/support/      The German support page, at /de/support
  global-not-found.tsx  The 404, with its own document — see Localization
  sitemap.ts  robots.ts            Metadata routes, driven by siteConfig.url
  globals.css        Tailwind v4 entry + design tokens + the .post-body block
components/          Section and widget components (kebab-case files)
  root-shell.tsx     The <html>/<body> both root layouts render, per language
  home-page.tsx      The home page tree, taking a language
  ui/button.tsx      The only shadcn/base-ui primitive currently vendored
content/blog/        Blog posts as Markdown + frontmatter — the filename is the URL
content/social/      Social asset definitions — frontmatter builds the image, body is the caption
lib/site-config.ts   Single source of truth for facts about the product
lib/blog.ts          Reads content/blog: validation, visibility, tags, related posts
lib/markdown.ts      marked configuration — Markdown to HTML
lib/page-metadata.ts Per-page canonical, hreflang, Open Graph, and Twitter metadata
lib/frontmatter.ts   Splits a YAML frontmatter block from a Markdown body
lib/utils.ts         `cn()` — clsx + tailwind-merge
locales/en.ts        Single source of truth for all user-facing copy
locales/index.ts     Language registry: languages, dictionary(), homeHref
locales/copy-variants.ts  Alternative home-page wordings, selected by NEXT_PUBLIC_COPY_VARIANT
scripts/             Node build scripts (.mjs, run directly, no bundler)
  lib/chordlist-mark.mjs   Shared logo geometry for icon + OG builds
  lib/social-templates.mjs Layouts, shared frame, and type fitting for the social build
public/              Static assets, incl. generated icons and synced screenshots
assets/fonts/        Geist TTFs used by the OG/icon image builds (not the web fonts)
```

## Conventions

These are strongly held in this codebase — follow them rather than generic Next.js habits.

### Copy lives in `locales/en.ts`, never in JSX

Every visible string — headings, body text, button labels, `aria-label`s, alt text, metadata
titles and descriptions — is exported from `locales/en.ts` as a `const` object and imported into
the component. Components contain layout and behaviour only. When adding a section, add its copy
object (`homeCopy`, `docsCopy`, `faqCopy`, `pressCopy`, `privacyCopy`, `commonCopy`,
`metadataCopy`, plus small per-component objects like `pianoCopy` and `screenshotGalleryCopy`)
and read from it.

Copy objects use `as const`, and dynamic values are functions (e.g. `count: (count: number) => …`).
Keep the shape locale-agnostic: `locales/de.ts` is typed against these objects, so their structure
is a contract.

Components on a translated route read `dictionary(language)` from `@/locales` instead of importing
`@/locales/en` directly — see Localization. Everything else still imports `@/locales/en`, which is
correct for a page that only exists in English.

#### Inline markup in copy

Copy strings may carry three tags and nothing else: `<code>` for something the reader has to find
or type — a menu path, a filename, a button label — plus `<strong>` and `<em>`. `lib/inline-markup.ts`
turns a string into tokens and `components/inline-markup.tsx` renders them as React elements, so a
copy string can only ever produce those three elements; everything else in it is text, and React
escapes it. Nothing here goes near `dangerouslySetInnerHTML` — `lib/markdown.ts` is the tool for
authored Markdown, and it is far too much authority for one sentence of UI copy.

Tags rather than Markdown backticks because most copy strings are template literals interpolating
`siteConfig`, and a backtick inside one would end the string. An unknown or unclosed tag renders as
itself rather than swallowing the sentence.

Wherever those words are needed as words rather than elements — JSON-LD, a `<title>`, an Open Graph
description, an `aria-label` — pass them through `plainInlineText()`, which strips the tags.
`components/structured-data.tsx` does this for the FAQ, so a rich result quotes the page rather than
its markup.

#### The question search and its aliases

`/faq` and `/support` render the same `FaqSearch`, whose own words live in `commonCopy.faqSearch`
— it is chrome, so both pages and both languages share them. A page passes what differs as plain
string props: a `title` to sit beside the field, and an `emptyHint` where it has somewhere better
to send a reader than "nothing matched".

While a search is active every match opens and the matched words are wrapped in a `<mark>`,
including inside a `<code>` span. `findSearchMatches()` in `lib/text-search.ts` folds one character
at a time and records where each came from, so a query for "kaufe" highlights the "Käufe" actually
on screen — reusing `normalizeForSearch` there would decompose the umlaut and shift every offset
after it.

Every question in both lists carries a `keywords` list — words a reader might search for that the
answer does not use ("money back", "subscription", "telemetry", "abo"). Nothing renders them;
`lib/faq.ts` folds them into what the search matches on, and `tests/faq-search.test.ts` asserts that
plausible queries still reach the question they are about. They are search terms rather than claims,
so "subscription" belongs on the one-time purchase answer: it is the word a reader who believes
otherwise will type, and the answer they land on is what corrects them. The German lists also carry
the key English terms — "refund", "unlock", "shipping" — because a German reader who knows the app's
English wording should not have to translate their own question first. `searchAliases()` in
`locales/en.ts` widens each list to `string[]`, because a tuple would force every translation to
invent exactly as many synonyms as English has.

#### Copy variants

`locales/copy-variants.ts` holds alternative wordings of the home page — currently `files`
(shipping), `progressions`, and `setlist` — and `dictionary()` applies the one named by
`NEXT_PUBLIC_COPY_VARIANT` at build time. Every component is unchanged by this: it asks for a
dictionary and gets the active wording. `/copy` renders all of them side by side.

A variant replaces **whole sections** of `homeCopy`, never single strings, so a half-rewritten page
is impossible to produce by accident. Two things are deliberately out of reach: the `<h1>`, which
renders `commonCopy.tagline` from `VOCABULARY.md` and is checked by `scripts/build-og-image.mjs`; and
the order of `features.items`, whose positions are paired to icons in `components/features.tsx`.
Variants are `Record<Language, …>`, so a new language does not compile until its variants are written
— the same honesty rule as `Dictionary`. An unknown env value throws rather than falling back.
[Marketing plan](docs/marketing-plan.md) is why the alternatives exist and which to ship when.

**Blog posts are the one carve-out, and it is about chrome vs. content, not an exception to the
rule.** `locales/en.ts` owns every string the site renders *around* content — including all the blog
chrome: the `/blog` heading and intro, the search label and placeholder, tag labels, the result
count, the empty state, the related-posts heading, the closing CTA. Post titles, descriptions, and
bodies are authored content and live in `content/blog/*.md`. The test: a string that would be
*translated* alongside the UI belongs in `locales/`; an article that would be *rewritten* for another
market belongs in `content/`. What does not relax — no blog string is ever hardcoded in a `.tsx`
file; blog components read from `blogCopy` or from parsed Markdown.

### Product facts live in `lib/site-config.ts`

URLs, contact addresses, social handles, `launchDate`, `minimumOSVersion`, and `freeSongLimit`
come from `siteConfig`. `locales/en.ts` imports `siteConfig` and interpolates it, so a fact is
never written twice. The app name is `siteConfig.name` (lowercase "chordlist") — do not hardcode it.

Store-link handling is deliberate: `links.testFlight`, `links.appStore`, and `links.preorder` are
nullable, and `primaryAppLink` picks the first non-null in that order. `components/app-cta.tsx`
derives its label from which link is set and renders a disabled button when all are null. To
change the site-wide CTA, edit those config values — not the component.

### Styling

- Tailwind CSS v4, configured entirely in `app/globals.css` (`@theme inline`, `@custom-variant`).
  There is no `tailwind.config.*`; `components.json` intentionally has an empty `tailwind.config`.
- Use semantic tokens (`bg-background`, `text-muted-foreground`, `border-border`) — never raw
  colors. Tokens are defined for `:root`, `.dark`, and `@media (prefers-color-scheme: dark)` with a
  `:root:not(.light)` guard, so both the class-based and system dark modes must keep working.
- Page sections follow the shell `mx-auto w-full max-w-5xl px-6 py-20`, with
  `text-balance` on headings and `text-pretty` on body copy.
- Fonts are the Geist pair loaded via `next/font/google` into `--font-geist-sans` /
  `--font-geist-mono`; `font-mono` is the site's accent voice (eyebrows, filenames, the wordmark).
- Merge classes with `cn()` from `@/lib/utils`.

### Components

- Server components by default. Add `"use client"` only for real interactivity — currently
  `screenshot-gallery.tsx`, `piano-keyboard.tsx`, and `docs-sidebar.tsx`. Prefer a CSS-only
  solution first: `collapsible-section.tsx` is a plain `<details>` element for exactly this reason.
- Named exports, `function` declarations, `PascalCase` components in `kebab-case.tsx` files.
- Props are declared as a local `type XProps = { … }` above the component.
- The `Button` in `components/ui/button.tsx` wraps **@base-ui/react**, not Radix. To render a link,
  pass `nativeButton={false}` with `render={<a …>}` — do not use an `asChild` prop.
- Icons come from `lucide-react` and always carry `aria-hidden="true"`.
- Imports use the `@/*` path alias, ordered: external packages, then `@/components`, `@/lib`,
  `@/locales`.
- No semicolons, double quotes, 2-space indent, ~120 column width (the vendored shadcn
  `button.tsx` uses single quotes as it came from the generator; leave it be).

### TypeScript

`strict` plus `noUncheckedIndexedAccess` are on, so indexing an array yields `T | undefined` —
handle it (see the `splitFrontmatter` guards in `components/lyric-preview.tsx`). `typedRoutes` is
enabled in `next.config.mjs`, so `<Link href>` values are checked against real routes.

## Generated and synced assets

Five categories of files in `public/` are **outputs — edit the generator, not the file**:

- **Icons** (`favicon.ico`, `icon.svg`, `icon-{light,dark}-32x32.png`, `apple-icon.png`) —
  `pnpm build:icons`.
- **`og.png` and its per-language siblings (`og-de.png`), the page cards in `public/og/`, and the
  per-post cards in `public/blog/og/`** —
  `pnpm build:og`, which runs `scripts/build-og-image.mjs`, then `scripts/build-page-og.mjs`, then
  `scripts/build-blog-og.mjs`. The page script writes one card per route listed in its `CONFIG.pages`,
  which is what `lib/page-metadata.ts` points each route's `og:image` at. The blog script writes one
  card per post, including future-dated ones, so a scheduled post already has its card when it goes
  live. Run it after adding a post or a page and commit the PNG. All scripts render through Next's bundled `ImageResponse`
  (satori + resvg) and read fonts from `assets/fonts/`, so the builds are hermetic and offline.
  `build-og-image.mjs` writes one card per entry in its `CONFIG.cards` — English keeps `og.png`
  because every untranslated page falls back to it, and each translation gets an `og-<code>.png`
  beside it, which `rootMetadata()` names from the language code. Each card's headline is checked
  against the tagline in `VOCABULARY.md` and the build fails if they have drifted apart.
  Shared logo geometry lives in `scripts/lib/chordlist-mark.mjs` and mirrors
  `components/chordlist-icon.tsx` — change the mark in both, or the header logo and the favicons
  drift apart. Each script has a `CONFIG` block at the top for copy, colors, and sizing.
- **Social assets** (`public/social/<slug>/<format>.png` plus `manifest.json`) — `pnpm build:social`,
  which renders every definition in `content/social/` into the `card`, `post`, and `story` formats it
  declares. Layouts live in `scripts/lib/social-templates.mjs`; copy, colours, and the format matrix
  live in the script's `CONFIG` block. It is deliberately separate from `build:og`: that build owns
  `public/og.png` and the page and post cards, which must not change when a campaign does. Deleting a
  definition prunes its images on the next run. `docs/social-media-system.md` is the design source of
  truth, `docs/social-media-plan.md` is the posting calendar, and `.agents/skills/social-asset/SKILL.md`
  carries the workflow.
- **Email templates** (`public/emails/<slug>/<language>.{html,txt}` plus `manifest.json`) —
  `pnpm build:emails`, which renders every definition in `content/emails/`. Layout and the
  email-client workarounds live in `scripts/lib/email-templates.mjs`; the footer, languages, and
  site facts live in the script's `CONFIG` block. A slug must exist in every language and the
  frontmatter `language` must match the filename, so a half-translated campaign fails the build
  rather than reaching an inbox. `/emails` previews each one. Nothing in these emails is an image:
  clients block images by default, so the lockup is the wordmark as text.
- **App screenshots** (`public/app-screenshots/{light,dark}/`, plus `<code>/` for every other
  language) and `public/press/chordlist-press-kit.zip` — produced by the iOS app repository's
  automated screenshot tests and copied in by `pnpm sync:assets`, which `predev`/`prebuild` run for
  you. The script looks for a sibling `../progressions-swift-rork` checkout, or `$CHORDLIST_APP_REPO`;
  when neither exists it exits cleanly and the committed copies are used. It discovers language
  directories by reading the tree, so a newly captured language needs no change here. Adding a
  screenshot means adding its filename to `screenshotNames` in `scripts/sync-app-assets.mjs` **and**
  to the `screenshots` arrays in `components/app-showcase.tsx` / `app/press/page.tsx`, plus its copy
  in `locales/en.ts`.
- **App Store screenshot sets** (`public/app-store-screenshots/`, plus `manifest.json` and the ZIPs
  in `downloads/`) — `pnpm build:screens`. Art direction lives in the script's `CONFIG` block; the
  words live in `scripts/lib/app-store-copy.mjs`, keyed by language and then slide, and read shared
  product wording from `VOCABULARY.md` through `scripts/lib/vocabulary.mjs`. Each language renders
  from its own captures, never English ones. `docs/app-store-screenshot-system.md` is the source of
  truth; `/screens` is the review and download page.

`public/songs/morning-light.md` is a real sample song file: it is both rendered by
`components/lyric-preview.tsx` (read at build time with `fs.readFile`) and offered as a download,
so it must stay valid chordlist Markdown — YAML frontmatter with `chords`, then lyrics with chord
lines above the words.

## Adding a page

1. Create `app/(en)/<route>/page.tsx` as a server component — inside the `(en)` group, which is
   where every English route lives. The group is invisible in the URL.
2. Export `metadata` from `pageMetadata()` in `lib/page-metadata.ts`, passing the route path plus a
   title and description from a `<name>Copy.metadata` object in `locales/en.ts`. It writes the
   canonical URL, the `hreflang` set, the feed link, and the Open Graph and Twitter blocks, all of
   which Next replaces rather than merges — a page that declares them by hand ends up advertising
   the home page's `og:url`. Passing `extra.alternates` merges on top of the generated
   `canonical`/`languages`/`types` rather than replacing them. Add the route to
   `CONFIG.pages` in `scripts/build-page-og.mjs` and run `pnpm build:og` so it has its own card,
   or pass `image` to point at an existing one.
3. Wrap in `<main className="min-h-screen bg-background text-foreground">` with `<SiteHeader />`
   and `<SiteFooter />`. Put `id="main-content" tabIndex={-1}` on the content element **after**
   `<SiteHeader />` — the `<article>` or listing wrapper — not on `<main>`, which contains the
   header: the root layout's skip link targets that id, and landing on `<main>` would leave the
   nav in front of the first Tab and of sequential reading.
4. Add the route to `app/sitemap.ts` (now `async` — it derives post URLs from `lib/blog.ts`), and to
   `commonCopy.navigation` plus the footer/header nav if it should be linked.

`components/structured-data.tsx` holds every JSON-LD block: `StructuredData` (home — Organization,
WebSite, SoftwareApplication), `FaqStructuredData`, and `BlogPostStructuredData`. Each one emits the
Organization and WebSite nodes **in full**, because a validator reading a single page does not fetch
another to resolve a bare `{"@id": …}` — a post whose `author` is only a reference fails Article
rich-result validation. The `@id`s are stable across the blocks, so a crawler that reads several
pages still collapses them into one publisher. Keep new blocks self-contained the same way. Every
human-readable value is read from `siteConfig` or `locales/en.ts` — a block that restates copy can
drift from the page and turn a rich result into a lie. The same content accuracy rules apply here:
no `offers` node until pricing is final.

## Blog

Posts are Markdown files in `content/blog/<slug>.md`. **The filename is the slug and therefore the
permanent URL** — never rename one. `docs/blog-editorial-guidelines.md` is the source of truth for
voice, structure, accuracy, linking, and editorial review. To draft, edit, or publish a post, follow
`.agents/skills/blog-post/SKILL.md` (or run `/blog-post`); it carries the operational workflow,
frontmatter reference, verified site targets, image handling, and validation steps.

Frontmatter is `title`, `description`, `created`, `published`, `tags`, and the optional
`cover`/`coverAlt` pair and `draft` flag. `lib/blog.ts` validates all of it and throws with the
filename in the message, so a bad date, a `cover` without a `coverAlt`, or an unknown tag fails
`pnpm build` rather than shipping broken.

**Scheduling.** In production, a post whose `published` date is in the future — or that carries
`draft: true` — is hidden from the index, the sitemap, the RSS feed, and its own URL (which 404s).
`/blog`, `/blog/[slug]`, `app/sitemap.ts`, and `app/blog/rss.xml` all export `revalidate = 3600`, so a
scheduled post goes live within about an hour of its date with no redeploy. `generateStaticParams`
prerenders only visible slugs; a future URL renders on demand, hits `notFound()`, and starts resolving
once the date passes. Keep the four `revalidate` values in step.

**Previews show unreleased posts.** `showsUnreleasedPosts()` in `lib/blog.ts` reads `VERCEL_ENV`, so
branch previews and the dev server list drafts and future-dated posts while production hides them.
Each one renders a "Draft" or "Scheduled for …" badge (`PostStatusBadge`), so a preview is never
mistaken for the live site, and `PostMeta.isPublic` carries the flag to the client. The check fails
closed: with no `VERCEL_ENV`, only `NODE_ENV !== "production"` reveals them, so `pnpm build &&
pnpm start` reproduces production exactly and an unfamiliar host hides drafts by default. This is why
nobody should edit `published` just to preview a post.

`blogTags` in `lib/blog-tags.ts` is a closed vocabulary. Adding a tag means adding it there **and** adding
its label to `blogCopy.tags` — the label map is typed against the list, so a missing label is a
typecheck error.

`lib/markdown.ts` output goes into `dangerouslySetInnerHTML` and raw HTML in a post is passed through
on purpose (so an author can hand-write a sized `<img>` or a `<picture>`). That is safe only because
posts are repo-committed. Never point it at user-submitted or fetched input.

Post typography is the `.post-body` block in `app/globals.css`, whose values are copied from the
helper components in `app/docs/page.tsx` so posts and docs look identical. There is no `prose` plugin
and we are not adding one.

Images go in `public/blog/<slug>/` and are referenced with ordinary Markdown; they render as plain
lazy `<img>` and bypass `next/image`. Only a `cover` goes through `next/image`. `readdir` on
`content/blog` is invisible to the bundle tracer, which is why `next.config.mjs` carries
`outputFileTracingIncludes` for the four blog-aware routes — remove it and production breaks on the
first revalidation.

## Internal tools and sign-in

`/emails`, `/screens`, `/copy`, `/gallery`, `/social/posts`, `/social/editor`, `/translations`, and
`/api/translations/*` are behind a Supabase Auth login at `/login` (`/logout` signs out).
`lib/admin-routes.ts` is the single list of protected prefixes and the `ADMIN_EMAILS` allowlist.

`proxy.ts` refreshes the session and redirects; it is **not** the authorization, because a proxy
matcher does not reliably cover Server Functions. Every protected page calls `requireAdmin()` and
every protected route handler calls `refuseUnlessAdmin()` — `tests/admin-routes.test.ts` fails if
one of them stops. Adding a tool means adding its prefix to `lib/admin-routes.ts`, both matcher
forms to `proxy.ts`, the guard to the page, and the file to that test.

Being signed in is not sufficient: Supabase accepts sign-ups by default, so `ADMIN_EMAILS` decides
who gets in and an unset value means nobody. Guarded pages are dynamic by construction — read the
ordering comment in `lib/supabase/server.ts` before touching it.

## Content accuracy

`app/privacy/page.tsx`, `app/faq/page.tsx`, `app/press/page.tsx`, and `supportCopy` in every
language describe real product
behaviour: local file storage, TelemetryDeck analytics, optional chord-data contribution, StoreKit
and RevenueCat purchases, Vercel hosting and Web Analytics. Do not invent, soften, or embellish
claims about data handling, pricing, or availability — those strings are legal and press copy.
When the privacy policy changes materially, update `privacyCopy.lastUpdated`.

## Third-party services

Repo skills live in `.agents/skills/<name>/SKILL.md` and are mirrored into `.cursor/rules/<name>.mdc`
with Cursor's frontmatter dialect. There are three: `stripe-projects-cli`, `blog-post`, and
`social-asset`.

`.projects/state.json` tracks resources provisioned via the Stripe Projects CLI (currently
RevenueCat). See `AGENTS.md` and `.agents/skills/stripe-projects-cli/` for that workflow.
`.projects/cache`, `.projects/vault`, and all `.env*` files are gitignored — never commit
credentials.

## Localization

Copy lives in `locales/`. `en.ts` is the whole site; `de.ts` covers **the home page and the chrome
around it**, plus the two pages a reader can be sent to from outside the site — `locale`,
`commonCopy`, `metadataCopy`, `homeCopy`, `imprintCopy`, `supportCopy`, `pianoCopy` and
`screenshotGalleryCopy`. `docsCopy`, `faqCopy`, `pressCopy`, `screensCopy`, `privacyCopy`,
`blogCopy` and `galleryCopy` are English only, so those pages exist at their English URLs and
nothing links a reader to a translation that is not there. A German answer that has to link into
one of them says so in the link's own label rather than pretending a translation exists.

Each German object is typed `Localized<typeof …>` (see `locales/types.ts`): the English shape with
its wording set free, and functions mapped to a function of the same arguments returning a `string`
so interpolated copy stays callable. Adding a key to `en.ts` therefore fails the German build
instead of silently rendering English, which is what keeps a partial translation honest.

### How a language reaches the page

`locales/index.ts` is the registry. Components take a `language` and call `dictionary(language)`;
they do **not** import `@/locales/en` at module scope, which is what lets one component render in
either language instead of needing a copy per locale.

```tsx
export function Hero({ language = defaultLanguage }: { language?: Language }) {
  const { common, home } = dictionary(language)
```

`Dictionary` names exactly the objects a translated route may use. That is the honest boundary of
the translation: a component cannot reach for `docsCopy` through it and quietly render English
inside a German page, because it is not in the type. Translating another page means adding its copy
object to `Dictionary` and to every language, which will not compile until each one has it.

The default is `defaultLanguage`, so the English pages that render `<SiteHeader />` with no props
are unchanged.

**Routing is subpath-based.** English is at `/`, every other language hangs off `homeHref` —
currently `{ en: "/", de: "/de" }`. Each further translated page keeps its own map beside it —
`imprintHref` in `lib/legal-routes.ts`, `supportHref` in `lib/support-routes.ts` — rather than one
path-rewriting rule, which would imply `/de/docs` exists. `translatedRoutes` in
`lib/page-metadata.ts` is the list of those maps. `siteAlternateLanguages()`
in `lib/page-metadata.ts` reads it, so widening `homeHref` widens the `hreflang` set, the sitemap
entries, and the language switcher together.

**There is one root layout per language**, in the route groups `app/(en)` and `app/(de)`. Route
groups do not appear in URLs, so every existing route is byte-identical to before. The reason for
the split is that `<html lang>` and the skip link are outside any page, and a root layout cannot
read the route it wraps without `headers()`, which would opt the whole static site into dynamic
rendering. Both layouts are three lines around `<RootShell language={…}>`, and their metadata comes
from `rootMetadata(language)` — so the two cannot drift.

The cost of that split is that a URL matching nothing belongs to neither group, which is why
`app/global-not-found.tsx` exists: without it the 404 renders a bare `<html>` with no fonts, no
stylesheet, and no `lang`.

`components/language-switcher.tsx` takes the alternates rather than deriving them, so it appears
only on routes that actually have a translation.

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

`scripts/lib/vocabulary.mjs` is the same reader for the Node build scripts, which is how translated
image copy — currently the App Store sets in `scripts/lib/app-store-copy.mjs` — stays in step with
the app without a second glossary.
