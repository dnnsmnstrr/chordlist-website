import { execFile, spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

/**
 * `pnpm dev`: runs `next dev` and restarts it when it has grown too large.
 *
 * The dev server leaks a few megabytes on every render and every saved file. That is React's
 * development-only async debugging, bundled into Next — every tracked Promise keeps the one that
 * triggered it, and Turbopack's never-ending hot-reload loop turns that into a chain nothing frees
 * (react/react#36836, unfixed upstream as of Next 16.3.8). Production builds are unaffected. Over a
 * long writing session it reaches ten gigabytes, so this watches the server and starts a fresh one
 * past a limit. The browser reconnects on its own; a page that was mid-request reloads.
 *
 * DEV_MEMORY_LIMIT_GB sets the limit (default 4). 0 turns the watch off. Arguments after `pnpm dev`
 * are passed through to `next dev`.
 */

const run = promisify(execFile)
const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const nextBin = path.join(websiteRoot, "node_modules", ".bin", "next")

const limitGB = Number(process.env.DEV_MEMORY_LIMIT_GB ?? 4)
const CHECK_EVERY_MS = 15_000
/** A fresh server compiles routes on first request; give it time before judging its size. */
const GRACE_MS = 60_000

const GB = 1024 ** 3
const units = { KB: 1024, MB: 1024 ** 2, GB }

let child = null
let restarting = false
let checking = false
let stopping = false
let startedAt = 0

function log(message) {
  console.log(`\x1b[2m[dev]\x1b[22m ${message}`)
}

function start() {
  startedAt = Date.now()
  // Its own process group, so a restart takes `next dev` and the server it forks down together.
  child = spawn(nextBin, ["dev", ...process.argv.slice(2)], {
    cwd: websiteRoot,
    stdio: "inherit",
    detached: true,
  })

  child.on("exit", (code, signal) => {
    if (restarting) return
    if (!stopping) log(`next dev exited (${signal ?? code}).`)
    process.exit(code ?? 0)
  })
}

function killGroup(signal) {
  if (!child?.pid) return
  try {
    process.kill(-child.pid, signal)
  } catch {
    // Already gone.
  }
}

function waitForExit(timeoutMs) {
  return new Promise((resolve) => {
    if (!child || child.exitCode !== null || child.signalCode !== null) return resolve()
    const timer = setTimeout(() => {
      killGroup("SIGKILL")
      resolve()
    }, timeoutMs)
    child.once("exit", () => {
      clearTimeout(timer)
      resolve()
    })
  })
}

/** Every process descended from `root`, including itself. */
async function descendants(root) {
  const { stdout } = await run("ps", ["-A", "-o", "pid=,ppid="])
  const children = new Map()
  for (const line of stdout.trim().split("\n")) {
    const [pid, ppid] = line.trim().split(/\s+/).map(Number)
    if (!children.has(ppid)) children.set(ppid, [])
    children.get(ppid).push(pid)
  }

  const found = [root]
  for (let index = 0; index < found.length; index += 1) {
    found.push(...(children.get(found[index]) ?? []))
  }
  return found
}

/**
 * Bytes a process really costs. On macOS that is the footprint Activity Monitor shows, which counts
 * compressed memory — the leak mostly lives there, so RSS alone reads 1.5 GB for a server using 11.
 * Elsewhere RSS is the honest number.
 */
async function memoryOf(pid) {
  if (process.platform === "darwin") {
    try {
      const { stdout } = await run("footprint", [String(pid)])
      const match = stdout.match(/Footprint:\s*([\d.]+)\s*(KB|MB|GB)/)
      if (match) return Number(match[1]) * units[match[2]]
    } catch {
      // Fall through to RSS.
    }
  }
  const { stdout } = await run("ps", ["-o", "rss=", "-p", String(pid)])
  return Number(stdout.trim()) * 1024 || 0
}

async function check() {
  if (!child?.pid || restarting || Date.now() - startedAt < GRACE_MS) return

  let total = 0
  for (const pid of await descendants(child.pid)) {
    total += await memoryOf(pid).catch(() => 0)
  }
  if (total < limitGB * GB) return

  restarting = true
  log(`next dev is using ${(total / GB).toFixed(1)} GB (limit ${limitGB} GB) — restarting it.`)
  killGroup("SIGTERM")
  await waitForExit(10_000)
  restarting = false
  start()
}

function stop(signal) {
  stopping = true
  killGroup(signal)
  // If the server ignores the signal, do not leave the terminal hanging.
  setTimeout(() => process.exit(0), 5_000).unref()
}

process.on("SIGINT", () => stop("SIGINT"))
process.on("SIGTERM", () => stop("SIGTERM"))

start()

if (limitGB > 0) {
  log(`Restarting next dev above ${limitGB} GB. Set DEV_MEMORY_LIMIT_GB to change, 0 to disable.`)
  setInterval(() => {
    // `footprint` can be slow on a large process; never let two checks overlap.
    if (checking) return
    checking = true
    check()
      .catch((error) => log(`Memory check failed: ${error.message}`))
      .finally(() => (checking = false))
  }, CHECK_EVERY_MS)
}
