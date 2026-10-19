import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"

import { readChordPro, renderChordlistMarkdown } from "../lib/vendor/chordpro"

// `pnpm test` runs from the repository root.
const websiteRoot = process.cwd()
const backendRoot = process.env.CHORDLIST_BACKEND_REPO
  ? path.resolve(process.env.CHORDLIST_BACKEND_REPO)
  : path.resolve(websiteRoot, "..", "chordlist-backend")
const source = path.join(backendRoot, "src", "ingestion", "chordpro", "chordpro.ts")

async function readOrNull(filePath: string) {
  try {
    return await readFile(filePath, "utf8")
  } catch {
    return null
  }
}

// The converter and the backend importer must read ChordPro identically. The module's behavior is
// tested in chordlist-backend; here it only has to be the same file.
test("the vendored ChordPro module matches the backend's copy", async (context) => {
  const canonical = await readOrNull(source)
  if (canonical === null) {
    context.skip("chordlist-backend is not checked out beside this repository")
    return
  }
  const vendored = await readFile(path.join(websiteRoot, "lib", "vendor", "chordpro.ts"), "utf8")
  assert.equal(vendored, canonical, "Run `pnpm sync:chordpro` and commit lib/vendor/chordpro.ts.")
})

test("the vendored module converts ChordPro into a chordlist song file", () => {
  const document = readChordPro("{title: Open Road}\n{artist: Example Ensemble}\n[G]Alpha words [D]here")
  const result = renderChordlistMarkdown(document, { mode: "song" })

  assert.equal(
    result.markdown,
    "---\ntitle: Open Road\nartist: Example Ensemble\nchords: G D\n---\n\n[Verse]\nG           D\nAlpha words here\n",
  )
})
