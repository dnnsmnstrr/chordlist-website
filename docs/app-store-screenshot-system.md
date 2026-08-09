# App Store screenshot system

The App Store images are generated from the same simulator captures used by the press kit and social posts. Nothing
in `public/app-store-screenshots/` should be edited by hand.

```text
chordlist-app/press-kit/raw-screenshots/   Current simulator captures
scripts/sync-app-assets.mjs                Copies iPhone and iPad inputs into the website
scripts/build-app-store-screenshots.mjs    Validates, renders, and writes the upload set
scripts/lib/app-store-screenshot-template.mjs   Shared composition and device frames
public/app-store-screenshots/              Generated PNGs and manifest
```

Run:

```bash
pnpm build:app-store
```

The command first runs `pnpm sync:assets`, so it uses the latest app captures when the repositories are siblings. Set
`CHORDLIST_APP_REPO=/absolute/path/to/chordlist-app` for another checkout.

The outputs are five 1242×2688 PNGs for the 6.5-inch iPhone slot and five 2048×2732 PNGs for the 13-inch iPad slot.
Both are App Store Connect-supported portrait sizes. The iPhone frame adds the Dynamic Island because the raw
simulator capture contains only the status bar; iPad images deliberately do not.

Copy, colors, source screenshots, and the format-specific geometry are data in the `CONFIG` block of
`scripts/build-app-store-screenshots.mjs`. The layout itself stays in the template module so every slide uses the same
typography and device treatment.
