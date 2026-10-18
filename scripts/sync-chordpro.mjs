import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

/**
 * Copies the shared ChordPro module from chordlist-backend, where it is canonical and tested, into
 * `lib/vendor/chordpro.ts`. The website's converter and the backend's importer then read ChordPro
 * with the same code, byte for byte.
 *
 * The backend checkout is looked for beside this one, or at `$CHORDLIST_BACKEND_REPO`. When neither
 * exists — a Vercel build, say — this exits cleanly and the committed copy is used, the same way
 * `sync:app` treats the app repository. `tests/chordpro-vendor.test.ts` fails while the two differ.
 */

const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const backendRoot = process.env.CHORDLIST_BACKEND_REPO
  ? path.resolve(process.env.CHORDLIST_BACKEND_REPO)
  : path.resolve(websiteRoot, "..", "chordlist-backend")

export const chordProSource = path.join(backendRoot, "src", "ingestion", "chordpro", "chordpro.ts")
export const chordProDestination = path.join(websiteRoot, "lib", "vendor", "chordpro.ts")

async function readOrNull(filePath) {
  try {
    return await readFile(filePath, "utf8")
  } catch {
    return null
  }
}

const source = await readOrNull(chordProSource)
if (source === null) {
  console.log(`Backend repository not found at ${backendRoot}; using the committed ChordPro module.`)
  process.exit(0)
}

if ((await readOrNull(chordProDestination)) === source) {
  console.log("ChordPro module is up to date.")
} else {
  await writeFile(chordProDestination, source)
  console.log(`Copied the ChordPro module from ${path.relative(websiteRoot, chordProSource)}.`)
}
