# chordlist design audit

Source audit: 6 September 2026. Historical findings describe the baseline before design version 1.0.0.

Implementation rules are in [DESIGN.md](../DESIGN.md). This document preserves evidence and migration context;
do not copy an audited inconsistency into new UI. The repository links in the source index can evolve.

## Scope and sources

Make chordlist recognisable across the native app, website, backend administration, App Store artwork, social posts, video, email and press materials. Preserve the app’s native usability and the marketing’s musical character while removing accidental differences in typography, palette, marks and wording.

The shared identity is **a calm, personal songbook with a tactile musical atmosphere**. Songs and readable files are the subject. The interface makes collecting, finding and playing them straightforward.

This is a source-level audit of all three repositories and their marketing specifications and generators. It is not a rendered accessibility certification or a visual inspection of every exported image. Penpot originals, current Kickstart records and the running iOS app were not inspected. References to their workflow come from repository documentation; the press snapshot is explicitly dated 1 August 2026.

### Repository boundaries

| Surface | Repository | Responsibility |
| --- | --- | --- |
| Native app and capture masters | [dnnsmnstrr/chordlist](https://github.com/dnnsmnstrr/chordlist) | SwiftUI UI, song typography, appearance choices, vocabulary, icon source, simulator screenshots and recordings |
| Website and marketing | [dnnsmnstrr/chordlist-website](https://github.com/dnnsmnstrr/chordlist-website) | Web components, editorial imagery, social/OG/email/App Store generators, Remotion composition |
| Backend administration | [dnnsmnstrr/chordlist-backend](https://github.com/dnnsmnstrr/chordlist-backend) | Review and chordlink admin interfaces, operational states and service contracts |

Some repository documentation calls the app checkout `chordlist-app` or `progressions-swift-rork`. Those are historical/local names; use the actual repository link above and configure `CHORDLIST_APP_REPO` explicitly in cross-repository workflows.


## Shared foundations

| Shared characteristic | Evidence | Decision |
| --- | --- | --- |
| Neutral foundation | App defaults to `.neutral`; website uses achromatic OKLCH tokens; admin declares a matching intent; social defaults to `ink` | Keep neutral as the default identity |
| Clear foreground hierarchy | Native primary/secondary text, web foreground/muted tokens, admin ink/muted | Share semantic roles, with native platform implementations |
| Sans and mono pairing | Native system UI and monospaced lyrics; Geist/Geist Mono on web and video; system equivalents in email/admin | Standardise type roles rather than forcing one font onto every platform |
| Repeated key-and-stem mark | Website SVG, admin inline SVG and video use the same four rectangles and `270 × 613` viewBox | Generate derivatives from one geometry source |
| Restrained rounded surfaces | App capsules; web radius scale; admin rounded panels and pills; email 8px buttons and 16px cards | Define named geometry roles and explicit density variants |
| Musical texture | Photography guide, website ambient layer, analog App Store treatment and social photo templates | Keep expressive texture on editorial surfaces; protect UI legibility |
| Real product evidence | App captures feed website, social, store artwork and video | Preserve the capture-to-composition pipeline |
| Shared language | App `VOCABULARY.md` produces JSON consumed by website and image generators | Extend the existing ownership pattern instead of creating another glossary |


## Baseline inconsistencies

| Finding | Current source evidence | Required direction |
| --- | --- | --- |
| Admin neutral palette has drifted | Dark admin background `#252525`, panel `#343434`; website dark background approximately `#0A0A0A`, card `#171717`. Light admin text is `#252525`; website foreground approximately `#0A0A0A` | Align admin to shared core tokens; retain its denser layout |
| Email claims to mirror the website but uses a separate zinc palette | Email light text `#18181B`, muted `#71717A`; dark page `#09090B`, surface `#131316` | Generate email-compatible sRGB values from the same semantic palette; keep inline CSS and system fonts |
| Wordmark typography differs | Header uses Geist Mono; admin and email use system mono; video uses Geist Mono; home OG wordmark uses Geist Bold | Adopt mono for the wordmark; keep sans for headlines. Update OG layout after changing its font |
| Logo treatment differs | Header has a fixed light tile/dark glyph; video insets its glyph into a 44px tile; social `paper` reverses the tile | Standard identity lockup uses the fixed app-like tile. Campaign reversals must be named variants, not inferred from page theme |
| Mark geometry is copied | Same rectangles appear in TSX, admin HTML, video and a generator helper | Centralise the vector master and generate/import adapters |
| Video has its own warm palette | `#161411`, `#25221D`, `#FAFAF8`, `#A6A29A` plus paper effects | Register as an intentional `warm-stage` campaign theme; do not propagate into default UI |
| Colour choices are open-ended in video | `accentColor` accepts any nonempty string | Expose named campaign accents; validate any deliberate custom colour and its contrast |
| Accent text contrast needs review | `AppPrimaryColor.foregroundColor` returns white for every non-neutral colour | Measure all six colours in both appearances; choose a tested foreground per colour rather than assuming white works |
| Website theme values are duplicated | `.dark` and system-dark media blocks repeat the palette; dark sidebar primary remains blue | Generate both theme paths from one map; audit whether the blue sidebar token is used before changing its consumers |
| Press wording is stale | August snapshot says “Your lyrics and chords, as files!”; current vocabulary says “Your lyrics and chords, as files in your pocket.” | Reconcile the live press record and regenerate its snapshot/PDF before publication |
| Documentation contradicts current vocabulary | `AGENTS.md`/website guidance still mention German “Interpret”; current vocabulary specifies “Artist” | Treat the vocabulary table as authoritative and update the examples |
| Social guide counts five templates but lists six | `statement`, `progression`, `quote`, `screenshot`, `file`, `photo` | Generate the documented list from the registered templates |

The presence of multiple campaign treatments is intentional in existing documentation. Coloured-gradient and analog App Store sets, plus social `ink`, `paper` and `blueprint`, are existing variants—not evidence that every output should become identical.


## Marketing production

| Deliverable | Existing production format | Shared rule |
| --- | --- | --- |
| OG/social card | 1200×630 | One idea; deliberate line breaks; consistent lockup |
| Social post | 1080×1350 | Inspect thumbnail crop and actual display size |
| Story | 1080×1920 | Existing template reserves 190px top and 240px bottom |
| iPhone App Store artwork | 1242×2688 | Current genuine capture, separately composed typography |
| iPad App Store artwork | 2048×2732 output | Preserve distinction from the 2064×2752 raw capture |
| Email | 600px shell plus plain text alternative | Content and CTA work with images/styles unavailable |

These dimensions describe current generators, not a fresh verification of platform upload requirements. Recheck platform specifications when publishing. Do not perpetuate the social guide’s crop-ratio arithmetic as a universal platform rule; preview each actual destination crop.

Use the existing six social templates. Prefer `progression` and `file` when they make the subject concrete, `screenshot` to demonstrate behaviour, and `photo` for musical atmosphere.

Use locale-matched screenshots. Preserve the app’s reproducible fixture pipeline and 9:41 capture convention. Generated assets must record source capture, language, appearance, treatment and build provenance. Change a source definition and regenerate; never patch a generated PNG to fix wording.

Before publishing: inspect every changed format at intended display size; check wrapping, cropping, contrast, screenshot currency, alt text and claim accuracy. An export that builds successfully is not automatically visually correct.


## Ownership and enforcement proposal

### Proposed source of truth

Place the canonical `design.md` in the **app repository**, beside the existing `VOCABULARY.md` and canonical icon source. The delivered file is ready for that placement; no repository commit is made by this audit.

Add a small, dependency-free `design/tokens.json` there for common semantic roles, geometry and theme definitions. Keep native semantic mappings explicit rather than pretending SwiftUI system colours are fixed hex values. Export the canonical vector geometry from `chordlist.icon` into a versioned master; reconcile it with the currently repeated SVG before choosing the exact exported representation.

The website owns composition templates and campaign content. Its existing `docs/visual-language.md`, `docs/social-media-system.md` and `docs/app-store-screenshot-system.md` remain specialised guides and reference this shared specification. The backend consumes a small CSS/token export and mark, with no dependency on Swift or the website runtime.

### Proposed checks

| Check | Failure it prevents | Location |
| --- | --- | --- |
| Token schema validation | Missing roles, invalid colours and unknown themes | Shared export generation |
| Generated-output comparison | Hand edits and stale token/mark derivatives | All three repositories |
| Source version/hash manifest | Consumers silently drifting to different design versions | Website/admin vendored exports |
| Vocabulary/phrase validation | Incorrect brand casing and competing product wording | Extend existing app and marketing checks |
| Scoped literal-colour rule | New unregistered UI palettes | UI/template code only; allowlisted native mappings and campaign definitions |
| Contrast checks | Unsafe foreground/background combinations | Resolved token pairs and app appearance fixtures |
| Deterministic visual fixtures | Layout, crop and rendering regressions | Web/admin screenshots; native capture suite; marketing sample renders |

Vendor generated outputs so builds work without sibling checkouts or network access. Update consumers in separate PRs with the same design version and source commit. A version mismatch should be visible; CI should reject generated files that do not match their declared source, without requiring all repositories to deploy simultaneously.

Seed/freeze website ambient randomness in visual fixtures and retain the video paper seed. Otherwise background changes create noisy diffs unrelated to design regressions.

Add a concise pointer to `design.md` in each repository’s agent guidance and PR template. A visual PR should state affected surfaces, theme/locale coverage, before-and-after captures, and any intentional exception. Record exceptions with scope, rationale and owner; avoid undocumented one-off CSS.


## Adoption sequence

1. **Agree the baseline:** adopt this specification and correct stale vocabulary references, press tagline handling and repository names. Reconcile live Kickstart facts separately from design decisions.
2. **Unify the foundation:** extract semantic tokens, standardise the mono wordmark, consolidate mark geometry and align admin/email neutral palettes. Preserve the native app’s system styles.
3. **Register variation:** formalise `ink`, `paper`, `blueprint` and `warm-stage`; distinguish campaign variants from app appearance settings. Replace arbitrary video accent input with a named selection plus explicit custom override.
4. **Close interaction gaps:** audit accent contrast, control states, dynamic text and keyboard access. Replace duplicated theme definitions and check actual sidebar usage.
5. **Regenerate and review:** rebuild affected OG, social, email, store and video outputs using existing generators. Inspect representative light/dark, English/German, phone/tablet and compact admin cases.
6. **Enforce incrementally:** add generation checks and scoped token rules first, then deterministic visual comparisons for the affected flows. Keep existing repository-required build/test gates when implementation PRs are made.

Completion means the three repositories identify the same specification version, shared assets are generated from declared sources, deliberate campaign exceptions are named, and representative renders have passed review. A matching document copied into three repositories alone is insufficient.


## Source index

All links below refer to repository files read for this audit; branch links may evolve. File blob identifiers for key evidence are included to identify the inspected content precisely.

| Source | What it establishes |
| --- | --- |
| [AppPrimaryColor.swift](https://github.com/dnnsmnstrr/chordlist/blob/main/ChordListApp/Models/AppPrimaryColor.swift) | Seven appearance choices and current foreground policy; blob `8f8ede25b31790e4c901eda6f96c0fc526698c33` |
| [SongTextSize.swift](https://github.com/dnnsmnstrr/chordlist/blob/main/ChordListApp/Models/SongTextSize.swift) | Native lyric/chord font roles; blob `bca18ef042b96461265da0463e53abec47725bf9` |
| [SongRow.swift](https://github.com/dnnsmnstrr/chordlist/blob/main/ChordListApp/Views/SongRow.swift) | Row hierarchy, tags and spacing |
| [VOCABULARY.md](https://github.com/dnnsmnstrr/chordlist/blob/main/VOCABULARY.md) | Current terminology and phrases; blob `fe88ad539ea354e6b174d69cb6afb60d03b1c170` |
| [App AGENTS.md](https://github.com/dnnsmnstrr/chordlist/blob/main/AGENTS.md) | Native architecture, capture and vocabulary workflow |
| [Press-kit workflow](https://github.com/dnnsmnstrr/chordlist/blob/main/press-kit/README.md) | Icon ownership, captures, video handoff and Kickstart ownership |
| [Press snapshot](https://github.com/dnnsmnstrr/chordlist/blob/main/press-kit/Kickstart/press-kit.md) | Dated press copy and old tagline |
| [globals.css](https://github.com/dnnsmnstrr/chordlist-website/blob/main/app/globals.css) | Web palette, radii, ambient treatment and prose styles; blob `103557b164c6fa8325265da5753264a1990ad47a` |
| [Site header](https://github.com/dnnsmnstrr/chordlist-website/blob/main/components/site-header.tsx) and [hero](https://github.com/dnnsmnstrr/chordlist-website/blob/main/components/hero.tsx) | Wordmark, layout and type hierarchy |
| [ChordlistIcon](https://github.com/dnnsmnstrr/chordlist-website/blob/main/components/chordlist-icon.tsx) | Existing web mark geometry |
| [Ambient background](https://github.com/dnnsmnstrr/chordlist-website/blob/main/components/ambient-background.tsx) | Image inputs, randomisation and reduced-motion handling |
| [OG generator](https://github.com/dnnsmnstrr/chordlist-website/blob/main/scripts/build-og-image.mjs) | Sans wordmark, palette, fonts and tagline guard |
| [Email templates](https://github.com/dnnsmnstrr/chordlist-website/blob/main/scripts/lib/email-templates.mjs) | Current email palette, type and client adaptations |
| [Social generator](https://github.com/dnnsmnstrr/chordlist-website/blob/main/scripts/build-social.mjs) | Theme values, format dimensions and validation |
| [Social system](https://github.com/dnnsmnstrr/chordlist-website/blob/main/docs/social-media-system.md) | Six templates, composition and production rules |
| [Visual language](https://github.com/dnnsmnstrr/chordlist-website/blob/main/docs/visual-language.md) | Established photography direction and master handling |
| [App Store screenshot system](https://github.com/dnnsmnstrr/chordlist-website/blob/main/docs/app-store-screenshot-system.md) | Existing analog/gradient variants and locale capture policy |
| [Video composition](https://github.com/dnnsmnstrr/chordlist-website/blob/main/video/src/ChordlistDemo.tsx) and [schema](https://github.com/dnnsmnstrr/chordlist-website/blob/main/video/src/video-schema.ts) | Warm palette, mark treatment and unrestricted accent field |
| [Website guidance](https://github.com/dnnsmnstrr/chordlist-website/blob/main/CLAUDE.md) | Asset generators, shared vocabulary and factual-copy constraints |
| [Admin shell](https://github.com/dnnsmnstrr/chordlist-backend/blob/main/src/admin/admin-shell.ts) | Admin palette, mark, typography, controls and layout; blob `5bc968f26aacb081f6cf0e2619567f8889f7212c` |
| [Backend guidance](https://github.com/dnnsmnstrr/chordlist-backend/blob/main/AGENTS.md) | Service boundaries, structured errors and cross-repository contracts |

## Implementation record — design 1.0.0

The linked app, website and backend PRs introduce the nine-section agent guide, a versioned shared token/mark
bundle, offline generation and drift checking. Native colour labels resolve contrast against the chosen accent.
Web/admin/email share the neutral palette; web and marketing share the mono wordmark and app-derived mark.
Campaign backdrops remain distinct. Remaining runtime and visual checks are recorded in each PR.

The app SVG inspection corrected the initial audit: keys have square tops and rounded bottoms, whereas the old
web reconstruction rounded all four corners. The shared mark is derived from the actual app source.

The dated Kickstart snapshot is historical evidence. Reconcile current launch/pricing facts with the live record
before publishing a new press release; do not silently rewrite its recorded synchronization date.
