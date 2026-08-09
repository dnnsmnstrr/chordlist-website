import { access, copyFile, mkdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const appRoot = process.env.CHORDLIST_APP_REPO
  ? path.resolve(process.env.CHORDLIST_APP_REPO)
  : path.resolve(websiteRoot, "..", "chordlist-app")

const screenshotNames = [
  "01-Song-List---4-Chord-Library.png",
  "02-Song-Detail---Matching-Suggestions.png",
  "03-Creation-Flow---New-Song.png",
  "04-Search---Piano-Results.png",
  "05-Tag-Filter---Piano.png",
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

const pressArchiveSource = path.join(appRoot, "build", "press-kit", "chordlist-press-kit.zip")
if (await exists(pressArchiveSource)) {
  const pressDirectory = path.join(websiteRoot, "public", "press")
  await mkdir(pressDirectory, { recursive: true })
  await copyFile(pressArchiveSource, path.join(pressDirectory, "chordlist-press-kit.zip"))
}

console.log(
  `Synced iPhone (${lightCount} light, ${darkCount} dark) and ` +
    `iPad (${iPadLightCount} light, ${iPadDarkCount} dark) app screenshots.`,
)
