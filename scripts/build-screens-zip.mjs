/**
 * Bundles the app screenshots into one archive for the /screens page.
 *
 *   pnpm build:screens
 *
 * The output is a committed asset, like the icons and the OG cards: a static file
 * under public/ is served straight from the CDN, so the download needs no runtime
 * filesystem access from a serverless function.
 *
 * The archive is written by hand rather than with a zip dependency. PNGs are
 * already compressed, so every entry uses the STORE method and no deflate is
 * needed — which reduces "write a zip" to writing three well-specified record
 * types. Verify the result with `unzip -t` after changing anything here.
 */
import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

/* ─────────────────────────────── CONFIG ─────────────────────────────── */

const CONFIG = {
  source: "public/app-screenshots",
  // Only these subfolders are bundled, so a stray file next to them is ignored.
  folders: ["light", "dark"],
  output: "public/app-screenshots/chordlist-app-screenshots.zip",
}

/* ───────────────────────────── END CONFIG ───────────────────────────── */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)

  for (let i = 0; i < 256; i += 1) {
    let c = i
    for (let bit = 0; bit < 8; bit += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[i] = c >>> 0
  }

  return table
})()

function crc32(buffer) {
  let crc = 0xffffffff

  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }

  return (crc ^ 0xffffffff) >>> 0
}

/** MS-DOS date and time, which is what the zip format stores. */
function dosDateTime(date) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2)
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  return { time, day }
}

function buildZip(entries, modified = new Date()) {
  const { time, day } = dosDateTime(modified)
  const locals = []
  const centrals = []
  let offset = 0

  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8")
    const crc = crc32(entry.data)
    const size = entry.data.length

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0) // local file header signature
    local.writeUInt16LE(20, 4) // version needed
    local.writeUInt16LE(0, 6) // flags
    local.writeUInt16LE(0, 8) // method: 0 = stored
    local.writeUInt16LE(time, 10)
    local.writeUInt16LE(day, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(size, 18) // compressed size
    local.writeUInt32LE(size, 22) // uncompressed size
    local.writeUInt16LE(name.length, 26)
    local.writeUInt16LE(0, 28) // extra field length
    locals.push(local, name, entry.data)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0) // central directory signature
    central.writeUInt16LE(20, 4) // version made by
    central.writeUInt16LE(20, 6) // version needed
    central.writeUInt16LE(0, 8)
    central.writeUInt16LE(0, 10)
    central.writeUInt16LE(time, 12)
    central.writeUInt16LE(day, 14)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(size, 20)
    central.writeUInt32LE(size, 24)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt16LE(0, 30) // extra
    central.writeUInt16LE(0, 32) // comment
    central.writeUInt16LE(0, 34) // disk number
    central.writeUInt16LE(0, 36) // internal attributes
    central.writeUInt32LE(0, 38) // external attributes
    central.writeUInt32LE(offset, 42) // offset of local header
    centrals.push(central, name)

    offset += local.length + name.length + size
  }

  const centralDirectory = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0) // end of central directory signature
  end.writeUInt16LE(0, 4) // disk number
  end.writeUInt16LE(0, 6) // disk with central directory
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(centralDirectory.length, 12)
  end.writeUInt32LE(offset, 16)
  end.writeUInt16LE(0, 20) // comment length

  return Buffer.concat([...locals, centralDirectory, end])
}

async function main() {
  const sourceDirectory = path.join(projectRoot, CONFIG.source)
  const entries = []

  for (const folder of CONFIG.folders) {
    let files

    try {
      files = await readdir(path.join(sourceDirectory, folder), { withFileTypes: true })
    } catch {
      continue
    }

    for (const file of files.filter((f) => f.isFile() && f.name.endsWith(".png")).sort((a, b) => a.name.localeCompare(b.name))) {
      entries.push({
        name: `${folder}/${file.name}`,
        data: await readFile(path.join(sourceDirectory, folder, file.name)),
      })
    }
  }

  if (entries.length === 0) throw new Error(`No screenshots found in ${CONFIG.source}`)

  const zip = buildZip(entries)
  await writeFile(path.join(projectRoot, CONFIG.output), zip)

  console.log(`Wrote ${CONFIG.output} (${entries.length} images, ${(zip.length / 1024).toFixed(0)} kB).`)
}

await main()
