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
| `pnpm build:emails` | Render the email templates and their manifest from `content/emails/`. |
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
pnpm build:emails
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

### Switch the home page copy

Three wordings of the home page live in [`locales/copy-variants.ts`](locales/copy-variants.ts) and are
readable side by side at `/copy`, an unlisted `noindex` review page:

| Variant | Leads with |
| --- | --- |
| `files` *(default)* | Ownership — plain Markdown, offline, your files stay yours |
| `progressions` | *Finish a song and see what else you can already play* |
| `setlist` | *Find a song, play it, keep moving* |

A variant replaces whole sections of `homeCopy`, in every language, so the page is never half
rewritten. Select one at build time:

```bash
NEXT_PUBLIC_COPY_VARIANT=setlist pnpm build
```

Unset ships the default; an unknown value fails the build. On Vercel it is an environment variable on
a preview branch, so a variant can be read on a real URL before it is promoted. See
[Marketing plan](docs/marketing-plan.md#positioning-the-copy-experiment) for which one to ship when.

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

The backend's private `chordlink_storefront_settings.sales_enabled` value is the authoritative
launch gate. The header switch in the protected chordlink admin changes it. Checkout remains
disabled unless the availability response explicitly enables sales, stock remains, and the server
has `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `CHORDLINK_STRIPE_PRICE_ID`, and
`BREVO_API_KEY`. The Brevo key is part of the sales gate because the online withdrawal function
must immediately confirm receipt by email. Before enabling sales:

1. Have the bilingual seller identity, delivery promise, total-price, withdrawal, model form,
   return-cost, and §19 UStG wording reviewed. The ten-unit run is still a distance sale.
2. Confirm that the packaged chordlink fits the intended Deutsche Post letter product.
3. In Stripe, create `chordlink — first edition` at EUR 9.99 including German postage and put its
   live `price_…` ID in `CHORDLINK_STRIPE_PRICE_ID` on Vercel.
4. Add `STRIPE_SECRET_KEY` as a Vercel sensitive environment variable and
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` as the corresponding public key. Prefer a dedicated `rk_…`
   restricted key with Checkout Sessions write access and Prices read access; the checkout verifies
   the live Price still says EUR 9.99 before it creates a session. Never expose the secret key
   through a `NEXT_PUBLIC_` variable.
5. Register the Supabase `chordlink-stripe-webhook` function as a Stripe webhook destination for
   `checkout.session.completed` and `checkout.session.async_payment_succeeded`, configure its
   signing secret, and test one immediate and one delayed-payment event.
6. Set `CHORDLINK_AVAILABILITY_URL` to the backend's public `chordlink-availability` endpoint. The
   page and buy form read its `salesEnabled` flag before creating a session. The check fails closed:
   without a valid response, while sales are disabled, or once the edition is gone, Checkout cannot
   open. The request bypasses Next.js caching so closing the switch takes effect on the next page or
   form request.
7. Confirm `BREVO_API_KEY` can send from `support@chordlist.app`. Submit a test through
   `/de/chordlink/widerruf` and verify that both the operator notice and the immediate customer
   confirmation contain the declaration timestamp.
8. Open sales with the switch in the protected chordlink admin. This database value replaces the
   former readiness booleans in `siteConfig.chordlink`; do not add a second launch flag there.

The buy link opens a local order page backed by a custom Checkout Session and Stripe Elements. It
collects one German shipping address and payment details, then puts the product, seller, delivery
time, and €9.99 total including postage immediately above a button whose complete label is
`zahlungspflichtig bestellen`. Its return URL includes `{CHECKOUT_SESSION_ID}`. The server retrieves
that session before showing the localized confirmation page; invalid or unpaid sessions return to
the product page. The signed webhook separately allocates the physical unit, so the browser redirect
is never treated as fulfillment proof.

Never add a unit number, Checkout Session, buyer email, delivery address, or Apple offer code to
Vercel Analytics. Individual `/link/*` requests redirect to the shared setup route and are noindex.

### Internal tools and sign-in

`/emails`, `/screens`, `/copy`, `/gallery`, `/social/posts`, `/social/editor`, `/translations`, and
the `/api/translations` endpoints are internal tools, not part of the marketing site. They sit
behind a Supabase Auth login at `/login`; `/logout` signs out.

Two checks, and they are not the same check:

1. **`proxy.ts`** (Next 16's rename of `middleware.ts`) refreshes the Supabase session cookie and
   turns an expired one into a redirect. It is *not* the authorization. Next's own documentation
   warns that Server Functions are POSTs to the route that defines them, so a matcher change or a
   refactor can move one out from under the proxy without anything failing loudly.
2. **`requireAdmin()`** runs inside every protected page, and `refuseUnlessAdmin()` inside every
   protected route handler. This is what actually decides access. It calls `supabase.auth.getUser()`
   rather than `getSession()`, because the session comes from a cookie the browser sent and
   revalidating the token with Supabase is what makes the answer worth acting on.

**Being signed in is not enough.** A Supabase project accepts new sign-ups by default, so
authenticating proves only that somebody made an account. `ADMIN_EMAILS` is a comma-separated
allowlist, and an unset value means *nobody* — never everybody.

To set it up:

1. Create the administrator account yourself in the Supabase dashboard (Authentication → Users →
   Add user). Consider turning off public sign-ups for the project while you are there; the
   allowlist already covers it, but two locks are cheap.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `ADMIN_EMAILS` on
   Vercel and in `.env.local`. The first two are safe in the browser; the secret key is never used
   by this site.

The proxy matcher is scoped to those paths alone, so every marketing page still renders statically
and never pays for a proxy hop. Note that guarded pages are necessarily **dynamic** — see the
ordering comment in `lib/supabase/server.ts` for why `cookies()` is read before the configuration
check, and `tests/admin-routes.test.ts` for the test that keeps it that way.

Static files under `public/` are **not** covered — `/emails/*.html` and `/social/*` are served
directly by the CDN. The pages that index them are behind the login; the generated files themselves
stay reachable to anyone who knows the URL.

#### Resetting that password

A Supabase recovery email sends the administrator back to the site with an **implicit-flow**
fragment on the end of the URL: `#access_token=…&refresh_token=…&type=recovery`. A fragment is
never sent to a server, so Next only ever sees the path — which is why this is handled entirely in
the browser, and why there is no server action anywhere that takes an access token. That token is a
bearer credential for the account; the only thing that holds it is Supabase's own client, for the
few seconds it takes to set a new password, and the fragment is scrubbed out of the address on
every path through the flow.

Three pieces:

- **`lib/supabase/password-recovery.ts`** decides what a fragment is — a recovery link, an expired
  or reused one, or an ordinary `#anchor` — and whether a new password is acceptable. It is pure,
  and it deliberately returns a *verdict* rather than the tokens it read, so there is no way to get
  one out of it and into component state or a request body. `tests/password-recovery.test.ts`.
- **`components/password-recovery-gate.tsx`** rides along in `components/root-shell.tsx`, so it is
  on every page in both languages. Recovery emails sent before this existed point at `/`, and those
  still work: the gate notices the fragment wherever it lands and floats the form over the page.
  It renders nothing otherwise, and the panel — with supabase-js behind it — is loaded on demand,
  so an ordinary visit never pays for any of it.
- **`app/(en)/account/update-password/page.tsx`** is where new links should point. It is `noindex`
  and nothing links to it; opened without a fragment it says the link has expired, rather than
  showing a page that appears to ignore the link somebody just clicked.

The panel is a client component and talks to Supabase directly, with `createClient` from
**`@supabase/supabase-js`** — not `createBrowserClient` from `@supabase/ssr`, which pins
`flowType: "pkce"` and would refuse every link already sitting in an inbox. The session is created
with `persistSession: false` and `autoRefreshToken: false`: it exists to carry one
`updateUser({ password })` call and is signed out immediately afterwards, so it never reaches local
storage and closing the tab is enough to end it.

In the Supabase dashboard, under **Authentication → URL Configuration**, add
`https://chordlist.app/account/update-password` to the redirect allow-list (Vercel preview URLs
too, if you want to test one), and pass it as the `redirectTo` of `resetPasswordForEmail`. Nothing
needs to change in `.env` — the flow uses the same two `NEXT_PUBLIC_SUPABASE_*` values as the login.

Nothing in this repository *sends* a reset email, and that is deliberate rather than missing: there
is one administrator account and it is created by hand, so a new link is sent from the dashboard
under **Authentication → Users**. The expired-link message says so, rather than sending somebody to
a sign-in page that has no such form. If a self-service "forgot password" field on `/login` is ever
wanted, `resetPasswordForEmail` with this path as its `redirectTo` is the call it would make, and
the flow above already handles what comes back.

### chordlink availability notifications

While chordlink is not on sale, the product page offers a "Get notified" form in place of the buy
button. The list lives at **Brevo** rather than in the backend: its double opt-in sends the
confirmation, records the consent that German law expects to be produced on demand, and owns
unsubscribing. No email address is stored on this site or in the chordlink inventory, and the two
are deliberately kept apart — buying a chordlink does not add anyone to the list.

There are two lists, chosen by the same availability response that gates checkout:

| State | List | Mailed when |
| --- | --- | --- |
| Sales not open yet | `BREVO_INTEREST_LIST_ID` | the switch opens |
| Edition sold out | `BREVO_WAITLIST_LIST_ID` | a further batch is seeded |

Which list a signup lands on is decided on the server from the backend's own answer, never from the
submitted form, so nobody can put themselves on the restock list while the first edition is selling.

To turn it on:

1. In Brevo, create the two contact lists and a **double opt-in template**, and add a `LANGUAGE` and
   a `SIGNUP_REASON` contact attribute so a later campaign can segment on them.
2. Point the template's confirmation button at the site; the request sends the localized
   `redirectionUrl` (`/chordlink/notified`, `/de/chordlink/notified`), which is where a confirmed
   subscriber lands.
3. Set `BREVO_API_KEY` as a Vercel sensitive environment variable, plus
   `BREVO_INTEREST_DOI_TEMPLATE_ID`, `BREVO_INTEREST_LIST_ID`, and `BREVO_WAITLIST_LIST_ID`.
4. Sign Brevo's data-processing agreement and keep `privacyCopy.sections.chordlinkNotifications`
   accurate if what is stored changes.

The form fails closed the same way checkout does: it is rendered only when the key, the template,
and the list for the *current* state are all configured, and only when availability could actually
be read. An outage shows no form, because a form that takes an address and drops it is worse than
none — the visitor leaves believing they will hear from us. A submission that Brevo rejects says so
rather than thanking anybody. An address already on the list is reported as a fresh success, so the
form cannot be used to test whether a given person is subscribed.

Measurement is deliberately the free path: `/chordlink` page views in Vercel Web Analytics at the
top of the funnel and confirmed Brevo contacts at the bottom. Vercel custom events are a Pro
feature, so nothing here depends on them.

### Email templates

Emails are built from `content/emails/` rather than written in Brevo's editor, so the wording is
reviewed in a pull request and the layout is fixed once instead of per campaign:

```bash
pnpm build:emails
```

One definition per language — `<slug>.<language>.md`, frontmatter plus a Markdown body — produces
`public/emails/<slug>/<language>.{html,txt}` and a `manifest.json`. `/emails` previews every one in
an iframe at the width a client renders it. Paste the HTML into Brevo and keep the `.txt` beside it
as the plain-text alternative; a message with no text part scores worse with spam filters and some
readers never see anything else.

A slug must exist in **every** language before the build passes, and the frontmatter `language` must
match the filename. That is the same honesty rule the `Dictionary` type enforces on the site: a
half-translated campaign is not something to discover at send time, with half the list already
mailed in the wrong language.

Four definitions ship. `chordlink-confirm` is the double opt-in mail and is the one the signup flow
actually depends on — its button must keep the `{{ doubleoptin }}` merge field, which is what Brevo
replaces with the confirmation link. `chordlink-on-sale` and `chordlink-restock` are the campaigns
for the two lists. `chordlist-announcement` is a deliberately empty skeleton to copy for the next
announcement.

Layout lives in `scripts/lib/email-templates.mjs` and is shaped by three constraints rather than
taste: Outlook on Windows renders with Word, so structure is tables and there is no flexbox or
`border-radius`; several clients strip `<style>`, so everything that must render is inlined and the
`<style>` block carries only the dark palette and the narrow breakpoint; and images are blocked by
default on first open, so **nothing in these emails is an image** — the lockup is the wordmark in
the same mono voice the site uses. Campaign mail carries `{{ unsubscribe }}`; transactional mail
does not, because a confirmation message has nothing to unsubscribe from yet. Every footer carries
the operator, legal name, and postal address, which a commercial email from Germany has to state.

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
