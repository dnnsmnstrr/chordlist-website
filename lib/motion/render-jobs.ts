import "server-only"

import { spawn } from "node:child_process"
import path from "node:path"

/**
 * Render jobs started from the /motion wizard. Each one runs the same two steps as
 * `pnpm build:motion --only <slug>` — sync the inputs, then render — as child processes of the dev
 * server, and reads the render script's JSON events for its progress.
 *
 * State lives on globalThis so a hot reload of this module does not forget a running job. It is a
 * local tool: one person, one dev server, so a job is keyed by slug and a second start of the same
 * slug while one runs is refused rather than queued.
 */

export type RenderJob = {
  slug: string
  state: "running" | "done" | "failed"
  stage: "sync" | "bundle" | "render" | "finished"
  progress: number
  message: string
  startedAt: number
}

const store = globalThis as typeof globalThis & { chordlistMotionJobs?: Map<string, RenderJob> }
const jobs = (store.chordlistMotionJobs ??= new Map())

const root = process.cwd()

function run(command: string, args: string[], onLine: (line: string) => void): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: root, env: process.env })
    let buffer = ""
    const read = (chunk: Buffer) => {
      buffer += chunk.toString()
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""
      lines.forEach(onLine)
    }
    child.stdout.on("data", read)
    child.stderr.on("data", read)
    child.on("close", (code) => {
      if (buffer) onLine(buffer)
      resolve(code ?? 1)
    })
    child.on("error", () => resolve(1))
  })
}

export function renderJob(slug: string): RenderJob | null {
  return jobs.get(slug) ?? null
}

export function startRender(slug: string): RenderJob {
  const current = jobs.get(slug)
  if (current?.state === "running") return current

  const job: RenderJob = { slug, state: "running", stage: "sync", progress: 0, message: "", startedAt: Date.now() }
  jobs.set(slug, job)

  void (async () => {
    const synced = await run(process.execPath, [path.join("scripts", "sync-motion-assets.mjs")], () => {})
    if (synced !== 0) {
      Object.assign(job, { state: "failed", stage: "finished", message: "Copying the media into place failed. Run pnpm sync:motion to see why." })
      return
    }

    job.stage = "bundle"
    const tsx = path.join(root, "node_modules", ".bin", "tsx")
    const code = await run(tsx, [path.join("scripts", "build-motion.ts"), "--only", slug, "--json"], (line) => {
      let event: { type?: string; progress?: number; message?: string }
      try {
        event = JSON.parse(line)
      } catch {
        return // Remotion's own log lines; only the script's JSON events carry state.
      }
      if (event.type === "progress" || event.type === "rendered") {
        job.stage = "render"
        job.progress = event.progress ?? job.progress
      }
      if (event.type === "error") job.message = event.message ?? "The render failed."
    })

    Object.assign(job, code === 0
      ? { state: "done", stage: "finished", progress: 1 }
      : { state: "failed", stage: "finished", message: job.message || "The render failed. Run pnpm build:motion in a terminal to see the full log." })
  })()

  return job
}
