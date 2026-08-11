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
| `pnpm typecheck` | Run TypeScript without emitting files. |
| `pnpm sync:app` | Copy current iPhone/iPad screenshots and the available press-kit archive from the app repository. |
| `pnpm sync:video` | Copy prepared demo clips and rebuild the Remotion asset manifest. |
| `pnpm sync:all` | Run both app-asset syncs. |
| `pnpm sync:assets` | Backward-compatible alias for `sync:app`, used by website dev and builds. |
| `pnpm build:icons` | Regenerate the favicon, app icon, and related icon assets in `public/`. |
| `pnpm build:og` | Regenerate the site, page, and blog Open Graph images. |
| `pnpm build:social` | Render social images and their manifest from `content/social/`. |
| `pnpm build:app-store` | Sync app captures, then generate the iPhone and iPad App Store upload sets. |
| `pnpm video:studio` | Sync current demo clips and open the interactive Remotion editor. |
| `pnpm video:render:both` | Render the light and dark vertical demo masters. |

There is currently no separate test suite; `pnpm check` is the project gate.

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

The script copies light and dark iPhone and iPad captures into `public/app-screenshots/`. If
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

Both commands run `sync:video` before opening or rendering. With the standard sibling checkout,
the app repository is found automatically; otherwise set `CHORDLIST_APP_REPO` to its absolute path.
Use `pnpm sync:all` when screenshots, the downloadable press archive, and video footage should all
be refreshed together. See [the Remotion editor guide](video/README.md) for timeline controls,
audio, manual shots, and repeatable render presets.

### Build App Store screenshots

```bash
pnpm build:app-store
```

This syncs the raw app captures first, validates them, and writes the generated upload sets and
manifest to `public/app-store-screenshots/`. Copy, screenshot selection, colours, and layout geometry
are configured in `scripts/build-app-store-screenshots.mjs`. The generated sets can be reviewed and
downloaded from `/screens`; each device and treatment also gets a ZIP archive.

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
