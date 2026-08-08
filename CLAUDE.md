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
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint, `--max-warnings=0` — warnings fail |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm check` | `lint && typecheck && build` — **run this before committing** |
| `pnpm sync:assets` | Copy app screenshots and the press-kit zip from the iOS app repo |
| `pnpm build:icons` | Regenerate every favicon asset in `public/` |
| `pnpm build:og` | Regenerate `public/og.png` |

There is no test suite. `pnpm check` is the gate.

## Layout

```
app/                 App Router pages (all server components unless noted)
  layout.tsx         Root layout: fonts, metadata, viewport, Vercel Analytics
  page.tsx           Home page — composes the section components
  docs/  faq/  press/  privacy/    One page.tsx each
  sitemap.ts  robots.ts            Metadata routes, driven by siteConfig.url
  globals.css        Tailwind v4 entry + design tokens
components/          Section and widget components (kebab-case files)
  ui/button.tsx      The only shadcn/base-ui primitive currently vendored
lib/site-config.ts   Single source of truth for facts about the product
lib/utils.ts         `cn()` — clsx + tailwind-merge
locales/en.ts        Single source of truth for all user-facing copy
scripts/             Node build scripts (.mjs, run directly, no bundler)
  lib/chordlist-mark.mjs   Shared logo geometry for icon + OG builds
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

Three categories of files in `public/` are **outputs — edit the generator, not the file**:

- **Icons** (`favicon.ico`, `icon.svg`, `icon-{light,dark}-32x32.png`, `apple-icon.png`) —
  `pnpm build:icons`.
- **`og.png`** — `pnpm build:og`. Both scripts render through Next's bundled `ImageResponse`
  (satori + resvg) and read fonts from `assets/fonts/`, so the builds are hermetic and offline.
  Shared logo geometry lives in `scripts/lib/chordlist-mark.mjs` and mirrors
  `components/chordlist-icon.tsx` — change the mark in both, or the header logo and the favicons
  drift apart. Each script has a `CONFIG` block at the top for copy, colors, and sizing.
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
2. Export `metadata` with `title`, `description`, and `alternates: { canonical: "/<route>" }`,
   sourced from a `<name>Copy.metadata` object in `locales/en.ts`.
3. Wrap in `<main className="min-h-screen bg-background text-foreground">` with `<SiteHeader />`
   and `<SiteFooter />`.
4. Add the route to `app/sitemap.ts`, and to `commonCopy.navigation` plus the footer/header nav if
   it should be linked.

## Content accuracy

`app/privacy/page.tsx`, `app/faq/page.tsx`, and `app/press/page.tsx` describe real product
behaviour: local file storage, TelemetryDeck analytics, optional chord-data contribution, StoreKit
and RevenueCat purchases, Vercel hosting and Web Analytics. Do not invent, soften, or embellish
claims about data handling, pricing, or availability — those strings are legal and press copy.
When the privacy policy changes materially, update `privacyCopy.lastUpdated`.

## Third-party services

`.projects/state.json` tracks resources provisioned via the Stripe Projects CLI (currently
RevenueCat). See `AGENTS.md` and `.agents/skills/stripe-projects-cli/` for that workflow.
`.projects/cache`, `.projects/vault`, and all `.env*` files are gitignored — never commit
credentials.
