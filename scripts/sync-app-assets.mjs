import { access, copyFile, mkdir, readFile, readdir, rm } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const appRoot = process.env.CHORDLIST_APP_REPO
  ? path.resolve(process.env.CHORDLIST_APP_REPO)
  : path.resolve(websiteRoot, "..", "chordlist-app")

// Named for the screen alone, matching ScreenshotTests in the app repository. The names deliberately
// say nothing about what is on the fixture data, so tweaking a fixture never renames a file that the
// press page, the social posts, and the App Store builder all reference by path.
const screenshotNames = [
  "01-Song-List.png",
  "02-Song-Detail.png",
  "03-Creation-Flow.png",
  "04-Search.png",
  "05-Tag-Filter.png",
  "06-Settings.png",
  "07-Song-Suggestions.png",
]

async function exists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function syncScreenshots(sourceDirectory, destinationDirectory) {
  if (!(await exists(sourceDirectory))) return 0

  await mkdir(destinationDirectory, { recursive: true })
  let copied = 0

  for (const name of screenshotNames) {
    const source = path.join(sourceDirectory, name)
    if (!(await exists(source))) continue

    await copyFile(source, path.join(destinationDirectory, name))
    copied += 1
  }

  // Drop anything the app repository no longer produces. Without this a renamed shot leaves its
  // predecessor behind, and the stale file keeps serving on the pages that still point at it.
  const expected = new Set(screenshotNames)
  for (const entry of await readdir(destinationDirectory)) {
    if (!entry.endsWith(".png") || expected.has(entry)) continue
    await rm(path.join(destinationDirectory, entry))
    console.log(`Removed stale screenshot ${path.join(destinationDirectory, entry)}`)
  }

  return copied
}

if (!(await exists(appRoot))) {
  console.log(`App repository not found at ${appRoot}; using the committed website assets.`)
  process.exit(0)
}

const publicScreenshots = path.join(websiteRoot, "public", "app-screenshots")
const rawScreenshots = path.join(appRoot, "press-kit", "raw-screenshots")
const lightCount = await syncScreenshots(path.join(rawScreenshots, "light"), path.join(publicScreenshots, "light"))
const darkCount = await syncScreenshots(
  path.join(rawScreenshots, "dark"),
  path.join(publicScreenshots, "dark"),
)
const iPadLightCount = await syncScreenshots(
  path.join(rawScreenshots, "ipad", "light"),
  path.join(publicScreenshots, "ipad", "light"),
)
const iPadDarkCount = await syncScreenshots(
  path.join(rawScreenshots, "ipad", "dark"),
  path.join(publicScreenshots, "ipad", "dark"),
)

// The shared wording, so a term changed in the app repository's VOCABULARY.md reaches the site
// without anyone retyping it. Committed here too, so a build without the app repository present
// still has the last synced copy — same contract as the screenshots above.
const vocabularySource = path.join(appRoot, "vocabulary.json")
let vocabularyTerms = 0
if (await exists(vocabularySource)) {
  const destination = path.join(websiteRoot, "locales", "vocabulary.json")
  await mkdir(path.dirname(destination), { recursive: true })
  await copyFile(vocabularySource, destination)
  vocabularyTerms = JSON.parse(await readFile(destination, "utf8")).terms.length
}

const pressArchiveSource = path.join(appRoot, "build", "press-kit", "chordlist-press-kit.zip")
if (await exists(pressArchiveSource)) {
  const pressDirectory = path.join(websiteRoot, "public", "press")
  await mkdir(pressDirectory, { recursive: true })
  await copyFile(pressArchiveSource, path.join(pressDirectory, "chordlist-press-kit.zip"))
}

console.log(
  `Synced iPhone (${lightCount} light, ${darkCount} dark) and ` +
    `iPad (${iPadLightCount} light, ${iPadDarkCount} dark) app screenshots` +
    (vocabularyTerms ? `, and ${vocabularyTerms} vocabulary terms.` : "."),
)
