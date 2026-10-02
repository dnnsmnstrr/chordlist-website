/**
 * The blog's release cadence, and how the plan turns into dates.
 *
 * The cadence lives in `content/blog-schedule.json`; the dates live in each post's `published`
 * field, which is what `lib/blog.ts` reads. There is no third list of "the plan": the queue is
 * simply every post that is not live yet, in date order, and changing the plan means reassigning
 * that queue to the cadence's next free slots. So a date is only ever written in one place.
 *
 * Pure and free of node:fs, so `/editorial` and the tests share it.
 */

export type Cadence = {
  /** The first release date, YYYY-MM-DD. */
  start: string
  /** Days between releases — 7 for weekly. */
  everyDays: number
  /** Slot dates to leave empty, e.g. a holiday week. */
  skip: string[]
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

export function addDays(date: string, days: number) {
  const parsed = new Date(`${date}T00:00:00Z`)
  parsed.setUTCDate(parsed.getUTCDate() + days)
  return parsed.toISOString().slice(0, 10)
}

export function todayISO(now: Date = new Date()) {
  return now.toISOString().slice(0, 10)
}

export function parseCadence(value: unknown): Cadence {
  const record = (value ?? {}) as Record<string, unknown>
  const { start, everyDays, skip } = record

  if (!isIsoDate(start)) throw new Error(`content/blog-schedule.json: "start" must be a YYYY-MM-DD date`)
  if (typeof everyDays !== "number" || !Number.isInteger(everyDays) || everyDays < 1 || everyDays > 60) {
    throw new Error(`content/blog-schedule.json: "everyDays" must be a whole number of days between 1 and 60`)
  }
  const skipList = skip ?? []
  if (!Array.isArray(skipList) || !skipList.every(isIsoDate)) {
    throw new Error(`content/blog-schedule.json: "skip" must be a list of YYYY-MM-DD dates`)
  }

  return { start, everyDays, skip: [...new Set(skipList)].sort() }
}

/**
 * The next `count` release dates on or after `from`, in order.
 *
 * Slots are anchored to `start`, so moving `from` forward never shifts the weekday: a Saturday
 * cadence stays on Saturdays however late the plan is reflowed.
 */
export function cadenceSlots(cadence: Cadence, from: string, count: number): string[] {
  const slots: string[] = []
  let slot = cadence.start

  if (slot < from) {
    const behind = Math.ceil((Date.parse(`${from}T00:00:00Z`) - Date.parse(`${slot}T00:00:00Z`)) / 86_400_000)
    slot = addDays(slot, Math.ceil(behind / cadence.everyDays) * cadence.everyDays)
  }

  while (slots.length < count) {
    if (!cadence.skip.includes(slot)) slots.push(slot)
    slot = addDays(slot, cadence.everyDays)
  }

  return slots
}

export type PlannedPost = {
  slug: string
  published: string
  /** Live posts are history: the plan never moves them. */
  live: boolean
}

/**
 * Assigns every post that is not live yet to the cadence's slots, in the order given.
 *
 * Slots start tomorrow at the earliest — a post moved onto today would go live the moment it was
 * approved, before anyone had a chance to look at the schedule — and never reuse a date a live
 * post already holds. Returns only the posts whose date changes.
 */
export function reflow(
  queue: readonly PlannedPost[],
  cadence: Cadence,
  today: string,
): { slug: string; published: string }[] {
  const pending = queue.filter((post) => !post.live)
  const taken = new Set(queue.filter((post) => post.live).map((post) => post.published))
  const occupied = { ...cadence, skip: [...cadence.skip, ...taken] }
  const slots = cadenceSlots(occupied, addDays(today, 1), pending.length)

  return pending.flatMap((post, index) => {
    const slot = slots[index]
    return slot !== undefined && slot !== post.published ? [{ slug: post.slug, published: slot }] : []
  })
}

export type EditorialStage = "idea" | "writing" | "stale" | "approved" | "live" | "draft"

/** Where a post stands, in the order the plan cares about: live first, then why it is not. */
export function editorialStage(post: {
  isPublic: boolean
  draft: boolean
  wordCount: number
  approval: "none" | "approved" | "stale"
}): EditorialStage {
  if (post.isPublic) return "live"
  if (post.draft) return "draft"
  if (post.approval === "approved") return "approved"
  if (post.approval === "stale") return "stale"
  return post.wordCount === 0 ? "idea" : "writing"
}
