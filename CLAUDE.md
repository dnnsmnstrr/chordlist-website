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

There is no test suite. `pnpm check` is the gate.

## Layout

```
app/                 App Router pages (all server components unless noted)
  layout.tsx         Root layout: fonts, metadata, viewport, Vercel Analytics
  page.tsx           Home page — composes the section components
  docs/  faq/  press/  privacy/    One page.tsx each
  blog/              Index, [slug] post page, and rss.xml route handler
  sitemap.ts  robots.ts            Metadata routes, driven by siteConfig.url
  globals.css        Tailwind v4 entry + design tokens + the .post-body block
components/          Section and widget components (kebab-case files)
  ui/button.tsx      The only shadcn/base-ui primitive currently vendored
content/blog/        Blog posts as Markdown + frontmatter — the filename is the URL
content/social/      Social asset definitions — frontmatter builds the image, body is the caption
lib/site-config.ts   Single source of truth for facts about the product
lib/blog.ts          Reads content/blog: validation, visibility, tags, related posts
lib/markdown.ts      marked configuration — Markdown to HTML
lib/page-metadata.ts Per-page canonical, Open Graph, and Twitter metadata
lib/frontmatter.ts   Splits a YAML frontmatter block from a Markdown body
lib/utils.ts         `cn()` — clsx + tailwind-merge
locales/en.ts        Single source of truth for all user-facing copy
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
The file name implies a future i18n split; keep the shape locale-agnostic.

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

Four categories of files in `public/` are **outputs — edit the generator, not the file**:

- **Icons** (`favicon.ico`, `icon.svg`, `icon-{light,dark}-32x32.png`, `apple-icon.png`) —
  `pnpm build:icons`.
- **`og.png`, the page cards in `public/og/`, and the per-post cards in `public/blog/og/`** —
  `pnpm build:og`, which runs `scripts/build-og-image.mjs`, then `scripts/build-page-og.mjs`, then
  `scripts/build-blog-og.mjs`. The page script writes one card per route listed in its `CONFIG.pages`,
  which is what `lib/page-metadata.ts` points each route's `og:image` at. The blog script writes one
  card per post, including future-dated ones, so a scheduled post already has its card when it goes
  live. Run it after adding a post or a page and commit the PNG. All scripts render through Next's bundled `ImageResponse`
  (satori + resvg) and read fonts from `assets/fonts/`, so the builds are hermetic and offline.
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
- **App screenshots** (`public/app-screenshots/{light,dark}/`) and
  `public/press/chordlist-press-kit.zip` — produced by the iOS app repository's automated
  screenshot tests and copied in by `pnpm sync:assets`, which `predev`/`prebuild` run for you. The
  script looks for a sibling `../progressions-swift-rork` checkout, or `$CHORDLIST_APP_REPO`; when
  neither exists it exits cleanly and the committed copies are used. Adding a screenshot means
  adding its filename to `screenshotNames` in `scripts/sync-app-assets.mjs` **and** to the
  `screenshots` arrays in `components/app-showcase.tsx` / `app/press/page.tsx`, plus its copy in
  `locales/en.ts`.

`public/songs/morning-light.md` is a real sample song file: it is both rendered by
`components/lyric-preview.tsx` (read at build time with `fs.readFile`) and offered as a download,
so it must stay valid chordlist Markdown — YAML frontmatter with `chords`, then lyrics with chord
lines above the words.

## Adding a page

1. Create `app/<route>/page.tsx` as a server component.
2. Export `metadata` from `pageMetadata()` in `lib/page-metadata.ts`, passing the route path plus a
   title and description from a `<name>Copy.metadata` object in `locales/en.ts`. It writes the
   canonical URL and the Open Graph and Twitter blocks, which Next replaces rather than merges — a
   page that declares them by hand ends up advertising the home page's `og:url`. Add the route to
   `CONFIG.pages` in `scripts/build-page-og.mjs` and run `pnpm build:og` so it has its own card,
   or pass `image` to point at an existing one.
3. Wrap in `<main className="min-h-screen bg-background text-foreground">` with `<SiteHeader />`
   and `<SiteFooter />`. Put `id="main-content" tabIndex={-1}` on the content element **after**
   `<SiteHeader />` — the `<article>` or listing wrapper — not on `<main>`, which contains the
   header: the root layout's skip link targets that id, and landing on `<main>` would leave the
   nav in front of the first Tab and of sequential reading.
4. Add the route to `app/sitemap.ts` (now `async` — it derives post URLs from `lib/blog.ts`), and to
   `commonCopy.navigation` plus the footer/header nav if it should be linked.

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

## Content accuracy

`app/privacy/page.tsx`, `app/faq/page.tsx`, and `app/press/page.tsx` describe real product
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

Copy lives in `locales/`. `en.ts` is the site as it ships today; `de.ts` is a partial German
translation of `locale`, `commonCopy`, `metadataCopy` and `homeCopy`. The remaining objects —
`docsCopy`, `faqCopy`, `pressCopy`, `screensCopy`, `privacyCopy`, `blogCopy`, `galleryCopy`,
`screenshotGalleryCopy`, `pianoCopy` — are still English only, and every page still imports
`@/locales/en` directly. Locale selection and routing are not wired up yet.

Each German object is typed `Localized<typeof …>` (see `locales/types.ts`): the English shape with
its wording set free. Adding a key to `en.ts` therefore fails the German build instead of silently
rendering English, which is what keeps a partial translation honest.

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
