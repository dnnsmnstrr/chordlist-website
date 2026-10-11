import { createReadStream } from "node:fs"
import { stat } from "node:fs/promises"
import path from "node:path"
import { Readable } from "node:stream"

import { NextResponse } from "next/server"

import { REMOTION_PUBLIC, assertLocal } from "@/lib/motion/store"
import { refuseUnlessAdmin } from "@/lib/server/admin-auth"

/// Remotion's public directory (video/public), served to the wizard's in-page Player, which runs in
/// the Next app rather than in Remotion's own server. Byte ranges are honoured, because a <video>
/// that cannot seek cannot be scrubbed. Never reaches outside that directory.
export const dynamic = "force-dynamic"

const TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const refusal = await refuseUnlessAdmin()
  if (refusal) return refusal

  try {
    assertLocal()
  } catch {
    return new NextResponse(null, { status: 404 })
  }

  const segments = (await params).path
  const file = path.resolve(REMOTION_PUBLIC, ...segments)
  const type = TYPES[path.extname(file).toLowerCase()]
  if (!file.startsWith(`${REMOTION_PUBLIC}${path.sep}`) || !type) return new NextResponse(null, { status: 404 })

  const size = await stat(file).then((info) => info.size, () => null)
  if (size === null) return new NextResponse(null, { status: 404 })

  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "")
  if (range) {
    const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]))
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1
    if (start > end || start >= size) {
      return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } })
    }
    const stream = Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream
    return new NextResponse(stream, {
      status: 206,
      headers: {
        "Content-Type": type,
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
      },
    })
  }

  const stream = Readable.toWeb(createReadStream(file)) as ReadableStream
  return new NextResponse(stream, {
    headers: { "Content-Type": type, "Content-Length": String(size), "Accept-Ranges": "bytes" },
  })
}
