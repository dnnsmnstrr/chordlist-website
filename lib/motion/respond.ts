import "server-only"

import { NextResponse } from "next/server"

import { MotionError } from "@/lib/motion/store"

/** A wizard error the person can act on is a 409 with its message; anything else is a 500. */
export function motionFailure(error: unknown) {
  if (error instanceof MotionError) return NextResponse.json({ error: error.message }, { status: 409 })
  return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
}
