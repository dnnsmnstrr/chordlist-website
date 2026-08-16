"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

import { cn } from "@/lib/utils"

type CalendarPost = {
  slug: string
  scheduled: string | null
}

type SocialPostCalendarProps<Post extends CalendarPost> = {
  posts: Post[]
  onClose: () => void
  title: (post: Post) => string
}

/** Monday first, matching the en-GB dates the rest of the page prints. */
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })
const dayLabel = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", timeZone: "UTC" })

/** Months are counted from year zero so a range compares and steps as one number. */
function monthIndex(year: number, month: number) {
  return year * 12 + month
}

function monthOf(date: string) {
  const parsed = new Date(`${date}T00:00:00Z`)
  return monthIndex(parsed.getUTCFullYear(), parsed.getUTCMonth())
}

function firstOfMonth(index: number) {
  return new Date(Date.UTC(Math.floor(index / 12), index % 12, 1))
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

/**
 * The days of `index`'s month, padded with nulls to whole weeks so the grid rows
 * line up under the weekday header.
 */
function monthGrid(index: number) {
  const first = firstOfMonth(index)
  const leading = (first.getUTCDay() + 6) % 7
  const dayCount = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate()

  const cells: (Date | null)[] = Array.from({ length: leading }, () => null)
  for (let day = 1; day <= dayCount; day += 1) {
    cells.push(new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), day)))
  }
  while (cells.length % 7 !== 0) cells.push(null)

  return cells
}

export function SocialPostCalendar<Post extends CalendarPost>({
  posts,
  onClose,
  title,
}: SocialPostCalendarProps<Post>) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const byDate = useMemo(() => {
    const map = new Map<string, Post[]>()
    for (const post of posts) {
      if (!post.scheduled) continue
      const existing = map.get(post.scheduled)
      if (existing) {
        existing.push(post)
      } else {
        map.set(post.scheduled, [post])
      }
    }
    return map
  }, [posts])

  const unscheduled = useMemo(() => posts.filter((post) => !post.scheduled).length, [posts])

  /*
    Paging is bounded by the schedule itself: past the last post there is nothing
    to look at, and an endlessly empty grid reads as a broken calendar.
  */
  const bounds = useMemo(() => {
    const months = [...byDate.keys()].map(monthOf)
    if (months.length === 0) return null
    return { first: Math.min(...months), last: Math.max(...months) }
  }, [byDate])

  const [month, setMonth] = useState(() => {
    const now = new Date()
    const current = monthIndex(now.getUTCFullYear(), now.getUTCMonth())
    if (!bounds) return current
    return Math.min(Math.max(current, bounds.first), bounds.last)
  })

  const today = isoDate(new Date())
  const cells = useMemo(() => monthGrid(month), [month])
  const monthEntries = useMemo(
    () =>
      [...byDate.entries()]
        .filter(([date]) => monthOf(date) === month)
        .sort(([first], [second]) => first.localeCompare(second)),
    [byDate, month],
  )
  const scheduledThisMonth = monthEntries.reduce((count, [, list]) => count + list.length, 0)

  const step = useCallback(
    (delta: number) => {
      setMonth((current) => {
        if (!bounds) return current
        return Math.min(Math.max(current + delta, bounds.first), bounds.last)
      })
    },
    [bounds],
  )

  useEffect(() => {
    closeButtonRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
      if (event.key === "ArrowRight") step(1)
      if (event.key === "ArrowLeft") step(-1)
    }

    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose, step])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="social-calendar-title"
      className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Posting calendar</p>
          <h2 id="social-calendar-title" className="truncate text-base font-semibold tracking-tight">
            {monthLabel.format(firstOfMonth(month))}
            <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
              {scheduledThisMonth} scheduled
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <MonthButton
            direction="previous"
            onClick={() => step(-1)}
            disabled={!bounds || month <= bounds.first}
          />
          <MonthButton direction="next" onClick={() => step(1)} disabled={!bounds || month >= bounds.last} />
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close the calendar"
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {weekdays.map((weekday) => (
              <div
                key={weekday}
                className="pb-1 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
              >
                {weekday}
              </div>
            ))}

            {cells.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} aria-hidden="true" />

              const key = isoDate(date)
              const scheduled = byDate.get(key) ?? []

              return (
                <div
                  key={key}
                  className={cn(
                    "flex min-h-20 flex-col gap-1 rounded-lg border p-1.5 sm:min-h-28 sm:p-2",
                    scheduled.length > 0 ? "border-border bg-card" : "border-border/50 bg-muted/20",
                    key === today && "border-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[11px] text-muted-foreground",
                      key === today && "font-semibold text-foreground",
                    )}
                  >
                    {date.getUTCDate()}
                  </span>
                  {/*
                    A day column on a phone is about six characters wide, which turns every
                    title into an ellipsis. Below sm the grid keeps only the shape of the
                    month — one dot per post — and the list under it carries the titles.
                  */}
                  {scheduled.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:hidden">
                      {scheduled.map((post) => (
                        <span key={post.slug} className="size-1.5 rounded-full bg-foreground/60" />
                      ))}
                    </div>
                  )}
                  <div className="hidden flex-col gap-1 sm:flex">
                    {scheduled.map((post) => (
                      <span
                        key={post.slug}
                        title={title(post)}
                        className="truncate rounded-md bg-foreground/10 px-1.5 py-1 text-xs leading-tight text-foreground"
                      >
                        {title(post)}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <ul className="mt-6 flex flex-col gap-3 sm:hidden">
            {monthEntries.map(([date, scheduled]) => (
              <li key={date} className="flex gap-3">
                <span className="w-16 shrink-0 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {dayLabel.format(new Date(`${date}T00:00:00Z`))}
                </span>
                <span className="min-w-0 text-sm leading-tight">
                  {scheduled.map((post) => title(post)).join(", ")}
                </span>
              </li>
            ))}
          </ul>

          {unscheduled > 0 && (
            <p className="mt-6 font-mono text-xs text-muted-foreground">
              {unscheduled} post{unscheduled === 1 ? "" : "s"} without a scheduled date
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function MonthButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "previous" | "next"
  onClick: () => void
  disabled: boolean
}) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "previous" ? "Previous month" : "Next month"}
      className="flex size-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  )
}
