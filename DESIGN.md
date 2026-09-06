# chordlist — DESIGN.md

Design version: 1.0.0. Canonical source: [dnnsmnstrr/chordlist](https://github.com/dnnsmnstrr/chordlist).

Read this document before changing UI or marketing. These are the target implementation rules.
Historical findings and outstanding migration work live in [docs/design-audit.md](docs/design-audit.md).
Machine-readable values are in [design/tokens.json](design/tokens.json); generated files must not be hand-edited.
Run `python3 design/build.py --check` to verify the local bundle. To adopt a new canonical bundle in a consumer,
run `python3 design/sync.py /absolute/path/to/chordlist`, then review and commit the result.
Native SwiftUI uses semantic system colours and Dynamic Type; web and admin use the same core tokens.

## 1. Visual Theme & Atmosphere

A calm, personal songbook with a tactile musical atmosphere. Songs, chords and readable files take priority.
Default UI is neutral, spacious enough to read and restrained in decoration. Editorial imagery captures music
in motion: imperfect monochrome rehearsal photography, close crops, blooming light and tactile grain.
Keep real app screenshots sharp and separate from atmospheric imagery.

Write **chordlist** lowercase. Use **chordlink** for the NFC feature and **chordlist admin** for the console.
The current vocabulary in the app repository owns terminology and product phrases. German uses **du**,
`„…“`, comma decimals and **Artist**, **Songtext**, **Akkordfolge**, **Auto-Scroll**. Preserve user content as written.
Public copy is practical, direct and musician-first. Availability, pricing and data-handling claims come from
current product configuration, never from a visual template.

## 2. Color Palette & Roles

### Core UI tokens

The core palette is shared by web, admin and email. The committed sRGB values in `design/tokens.json` are authoritative for exports; the OKLCH values below explain their origin.

| Semantic token | Light | Dark | Usage |
| --- | --- | --- | --- |
| `surface.canvas` | `oklch(1 0 0)` / `#FFFFFF` | `oklch(.145 0 0)` / `#0A0A0A` | Page background |
| `surface.panel` | `oklch(1 0 0)` / `#FFFFFF` | `oklch(.205 0 0)` / `#171717` | Cards, popovers, admin panels |
| `surface.subtle` | `oklch(.97 0 0)` / `#F5F5F5` | `oklch(.269 0 0)` / `#262626` | Tags and quiet hover fills |
| `text.primary` | `oklch(.145 0 0)` / `#0A0A0A` | `oklch(.985 0 0)` / `#FAFAFA` | Primary text |
| `text.secondary` | `oklch(.439 0 0)` / `#525252` | `oklch(.708 0 0)` / `#A1A1A1` | Descriptions, secondary metadata |
| `action.primary.fill` | `oklch(.205 0 0)` / `#171717` | `oklch(.922 0 0)` / `#E5E5E5` | Primary action |
| `action.primary.label` | `oklch(.985 0 0)` / `#FAFAFA` | `oklch(.205 0 0)` / `#171717` | Text on primary action |
| `border.subtle` | `oklch(.922 0 0)` / `#E5E5E5` | white at 10% | Separators and card edges |
| `border.input` | `oklch(.922 0 0)` / `#E5E5E5` | white at 15% | Input edges |
| `brand.tile` | `#FAFAFA` | `#FAFAFA` | Standard icon tile |
| `brand.glyph` | `#0A0A0A` | `#0A0A0A` | Standard icon glyph |

SwiftUI maps these roles to semantic system colours and materials. Preserve `.primary`, `.secondary` and native background roles instead of replacing them with web hex values. The common contract is hierarchy, contrast and state meaning.

Separate interaction emphasis from status. `action.accent` follows the user’s app appearance choice; success, warning and destructive states keep their meanings regardless of that choice. On web, existing shadcn `accent` means a subtle surface, so do not alias it blindly to the app’s coloured tint.

Existing app choices remain neutral, blue, green, orange, pink, purple and teal. A colour picker must expose the selection through a checkmark/accessible state as well as colour. Neutral toggles may retain their native grey adaptation.

### Campaign themes

| Theme | Current palette foundation | Scope |
| --- | --- | --- |
| `ink` | `#0A0A0A`, `#FAFAFA`, muted `#A1A1A1` | Default social and OG direction; uses the core neutral muted value |
| `paper` | `#F3F0E8`, `#171717`, muted `#67635B` | Existing warm light social treatment |
| `blueprint` | `#102131`, `#F7F9FB`, muted `#A7B5C1` | Existing blue social treatment |
| `warm-stage` | `#161411`, `#25221D`, `#FAFAF8`, muted `#A6A29A` | Warm video treatment |

Campaign themes may change backdrop, decorative rules and editorial emphasis. They must not recolour a real app screenshot. Declare the theme in composition data so a campaign remains consistent across formats.


## 3. Typography Rules

| Role | Native app | Website and generated marketing | Admin and email |
| --- | --- | --- | --- |
| UI/body | System text styles | Geist Sans | System sans; admin may bundle Geist later |
| Headings | Native title/headline styles | Geist Sans, generally 600–700 | System sans, generally 600 |
| Wordmark | Canonical brand artwork where needed | Geist Mono; shared lockup | System mono fallback |
| Lyrics/file excerpts | System monospaced, preserving alignment | Geist Mono for literal file content | Monospace where content alignment matters |
| Chord bubbles | System rounded, bold | Rounded/weighted presentation when illustrating native UI; literal files remain mono | Readable compact chord display |
| Metadata/numbers | Caption; monospaced digits where useful | Mono for eyebrows, filenames and compact labels | System mono for operational metadata |

Preserve `SongTextSize`: small lyrics use subheadline, default body, large title3; chord labels use footnote, subheadline and body respectively, rounded and bold. Dynamic Type remains active.

Web starting scale: body 16px with 1.5–1.65 line height; compact admin body 15px/1.5; secondary labels 12–14px; h3 20px; h2 24px; page title 36–48px; hero 36–60px responsively. These consolidate existing patterns; do not apply export-canvas font sizes to web text.

Use tight tracking on large headings, normal tracking for reading. Preserve authored spaces in file excerpts. Never globally lowercase user content or translate stored section markers such as `[Verse]` and `[Chorus]`.


## 4. Component Stylings

| Component | Shared contract | Platform adaptation |
| --- | --- | --- |
| Brand lockup | Canonical glyph proportions and lowercase mono wordmark | Web/admin 32px tile; artwork scales proportionally; narrow web header may hide wordmark but retains accessible name |
| Primary action | One visually dominant action per decision area; explicit verb label | Native button styles; web shared Button/AppCTA; email table-based CTA |
| Secondary action | Outline or quiet treatment, clearly subordinate | Keep native navigation and contextual actions |
| Tag/filter | Quiet capsule unselected; clear selected state plus accessible semantics | App can use user tint; web/admin remain neutral by default |
| Song row | Title first, artist or chord summary second, tags tertiary | Preserve native list density and existing overflow count |
| Panel/callout | Border, quiet surface, concise heading and actionable content | Docs instructions may be roomier than admin records |
| Input | Persistent label, useful validation, visible focus | Keep native keyboards/autocorrection rules for musical input |
| Status | Explicit text, optional icon, colour as reinforcement | Admin production/local indicator remains visible and unambiguous |
| Empty/error/loading | Explain state and next action; preserve useful entered data | Use native progress indicators or web status regions |

State requirements: idle, hover where applicable, focused, pressed/selected, disabled, loading, success and error must be specified for interactive components. Derived input states must describe the current value; asynchronous responses must not restore stale state.


## 5. Layout Principles

Use spacing steps **4, 8, 12, 16, 20, 24, 32, 48, 64, 80**. Native controls can use platform spacing.
Website main shell: 64rem maximum width, 24px side gutters; prose: 42–48rem. Admin: 72rem maximum,
78rem for inventory. Email: 600px shell, 24px gutters, 18px on narrow screens.
Group related controls closely, separate sections generously, and keep one dominant action per decision area.
Do not stretch song/file content into a wide marketing grid. Keep whitespace in literal file excerpts.

## 6. Depth & Elevation

| Role | Rule |
| --- | --- |
| Base canvas | Flat background; no shadow |
| Panel | 1px subtle border; no shadow by default |
| Raised control/tab | `0 1px 2px rgb(0 0 0 / 8%)` |
| Brand tile | `0 0 0 1px rgb(0 0 0 / 8%), 0 1px 3px rgb(0 0 0 / 10%)` |
| Floating overlay | `0 8px 24px rgb(0 0 0 / 16%)`; retain visible border in dark mode |

Use surface hierarchy before shadows. Native sheets/popovers use system materials and elevation.
Radius roles: control 8px, base 10px, web panel 14px, roomy panel/email card 16px, pill fully rounded.
The standard logo is a fixed `#FAFAFA` tile with `#0A0A0A` glyph in both modes. Fit the glyph to the tile height,
centred horizontally, with no independent inset. Use the canonical app SVG geometry: square key tops and rounded
bottoms. Campaign backdrop variation never silently changes the standard logo.

## 7. Do’s and Don’ts

- Use semantic tokens and shared components. Do not introduce an independent neutral palette in a template.
- Use a mono wordmark and sans headings; do not use a headline font for the brand lockup.
- Retain native system styles and user-selected accents; do not hardcode web hex colours into SwiftUI chrome.
- Choose black/white labels using resolved accent contrast; do not assume white works on every tint.
- Keep screenshot pixels unfiltered; do not grain, blur, recolour or perspective-tilt the product evidence.
- Keep generated typography out of photographic masters; typeset it as a separate layer.
- Preserve `ink`, `paper`, `blueprint` and `warm-stage` as named campaigns; do not turn one into the default UI.
- Keep selected, focus, error and production states understandable without colour alone.
- Generate derivatives from their sources; never patch a PNG or generated token file by hand.
- Preserve readable file alignment and song spelling; never globally lowercase or translate user content.

## 8. Responsive Behavior

| Width/context | Required behaviour |
| --- | --- |
| Below 640px | Single-column web hero/CTAs; icon may stand alone with accessible brand name; preserve 24px gutters |
| 640–767px | Allow inline hero actions and wordmark where they fit; prose wraps naturally |
| Below 768px admin | Header wraps; tabs occupy their own row; intro stacks; toolbar groups wrap and use horizontal separators |
| Below 480px admin | Hide the secondary “admin” word only; actions occupy a separate row |
| 768px and above | Multi-column layout only when content fits; cap containers rather than stretching text |
| Email below 620px | Fluid shell with 18px gutters; keep inline fallback layout usable |
| Native Dynamic Type | Allow vertical growth and wrapping; preserve readable lyrics, native navigation and essential actions |

Main touch targets are at least 44×44pt native or 44×44px web; compact admin controls may use spacing/hit-area
adaptations. Keep visible 2px focus outlines with 2px offset. Test keyboard navigation, zoom, long German labels,
light/dark mode and text contrast (4.5:1 ordinary text; 3:1 large text and meaningful non-text controls).
Do not infer contrast from a token alone when photography or transparency sits behind it.

Hover/focus colour transitions use 150ms; small state transitions 200–250ms. Decorative motion stops when reduced
motion is enabled, including a change during the session. User-started autoscroll retains pause and speed controls.

## 9. Agent Prompt Guide

Use this starting instruction for new UI:

> Read DESIGN.md and the repository’s agent instructions. Reuse the shared design tokens and existing components.
> Keep neutral light/dark surfaces, the canonical fixed logo tile, a mono wordmark and sans UI headings.
> Preserve native SwiftUI semantics and Dynamic Type on iOS. Use real product captures for demonstrations.
> Implement all relevant control states and responsive behaviour. Run the design bundle check and the repository’s
> normal checks, then inspect changed surfaces at actual display size in light/dark and English/German.

For marketing:

> Use the existing composition generator and a named campaign theme. Keep one idea per asset, separately typeset
> copy, sharp screenshots, canonical logo geometry and deliberate line breaks. Regenerate all affected formats
> and inspect their crops and contrast. Do not change product facts to make a composition fit.

Quick reference: canvas **#FFFFFF / #0A0A0A**; panel **#FFFFFF / #171717**; text **#0A0A0A / #FAFAFA**;
secondary **#525252 / #A1A1A1**; action **#171717 / #E5E5E5**; logo **#FAFAFA + #0A0A0A**.

`python3 design/build.py --check` validates bundle provenance, token contrast and generated outputs.
`design/manifest.json` records the version and hashes; consumers vendor the bundle and build offline.
Visual PRs include the surfaces changed, light/dark and locale coverage, captures and any remaining verification gap.
The specialised website guides continue to govern photography, social composition and App Store artwork.
