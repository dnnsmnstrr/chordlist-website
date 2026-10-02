import assert from "node:assert/strict"
import test from "node:test"

import { approvalDigest, approvalState } from "../lib/blog-approval"
import { cadenceSlots, parseCadence, reflow } from "../lib/editorial-schedule"

const weekly = parseCadence({ start: "2026-10-10", everyDays: 7, skip: [] })
const post = { title: "A title", description: "A promise.", body: "Some words I wrote." }

test("an approval covers the exact words and nothing else", () => {
  const digest = approvalDigest(post)
  assert.equal(approvalState(post, digest), "approved")
  assert.equal(approvalState(post, null), "none")

  // Any edit to what a reader sees withdraws it — including one a refining pass makes.
  assert.equal(approvalState({ ...post, body: "Some words I wrote!" }, digest), "stale")
  assert.equal(approvalState({ ...post, title: "Another title" }, digest), "stale")
  assert.equal(approvalState({ ...post, description: "Another promise." }, digest), "stale")
})

test("the key visual is part of the approval, and a post without one keeps its old digest", () => {
  const digest = approvalDigest(post)
  assert.equal(approvalState({ ...post, cover: null, coverAlt: null }, digest), "approved")

  const cover = { cover: "/blog/a-post/photo.webp", coverAlt: "A piano." }
  assert.equal(approvalState({ ...post, ...cover }, digest), "stale")

  const withCover = approvalDigest({ ...post, ...cover })
  assert.equal(approvalState({ ...post, ...cover }, withCover), "approved")
  assert.equal(approvalState({ ...post, ...cover, cover: "/blog/a-post/other.webp" }, withCover), "stale")
  assert.equal(approvalState({ ...post, ...cover, coverAlt: "A guitar." }, withCover), "stale")
  assert.equal(approvalState(post, withCover), "stale")
})

test("line endings and surrounding whitespace do not count as an edit", () => {
  const digest = approvalDigest({ ...post, body: "One\nTwo" })
  assert.equal(approvalState({ ...post, body: "\nOne\r\nTwo\n\n" }, digest), "approved")
})

test("slots follow the cadence from its start and keep the weekday", () => {
  assert.deepEqual(cadenceSlots(weekly, "2026-10-02", 3), ["2026-10-10", "2026-10-17", "2026-10-24"])
  // Starting late lands on the next slot of the same rhythm, not on the day asked for.
  assert.deepEqual(cadenceSlots(weekly, "2026-10-12", 2), ["2026-10-17", "2026-10-24"])
  assert.deepEqual(cadenceSlots(weekly, "2026-10-17", 1), ["2026-10-17"])
})

test("skipped weeks stay empty", () => {
  const cadence = parseCadence({ ...weekly, skip: ["2026-10-17"] })
  assert.deepEqual(cadenceSlots(cadence, "2026-10-02", 2), ["2026-10-10", "2026-10-24"])
})

test("reflow follows the given order and never moves a live post", () => {
  const changes = reflow(
    [
      { slug: "live", published: "2026-10-10", live: true },
      { slug: "second", published: "2026-10-24", live: false },
      { slug: "first", published: "2026-10-17", live: false },
    ],
    weekly,
    "2026-10-12",
  )

  assert.deepEqual(changes, [
    { slug: "second", published: "2026-10-17" },
    { slug: "first", published: "2026-10-24" },
  ])
})

test("an overdue, unapproved post slips to the next free week rather than going out today", () => {
  const changes = reflow([{ slug: "late", published: "2026-10-10", live: false }], weekly, "2026-10-17")
  assert.deepEqual(changes, [{ slug: "late", published: "2026-10-24" }])
})

test("a malformed cadence is refused", () => {
  assert.throws(() => parseCadence({ start: "2026-02-30", everyDays: 7 }))
  assert.throws(() => parseCadence({ start: "2026-10-10", everyDays: 0 }))
  assert.throws(() => parseCadence({ start: "2026-10-10", everyDays: 7, skip: ["soon"] }))
})
