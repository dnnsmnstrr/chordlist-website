"use client"

import { useState } from "react"
import { Copy, RefreshCw } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ChordlinkPersonalLinkProps = {
  copiedLabel: string
  copyLabel: string
  generateLabel: string
  note: string
  regenerateLabel: string
}

function newPublicId() {
  const random = new Uint32Array(1)
  crypto.getRandomValues(random)
  return String(100_000 + (random[0]! % 900_000))
}

export function ChordlinkPersonalLink({ copiedLabel, copyLabel, generateLabel, note, regenerateLabel }: ChordlinkPersonalLinkProps) {
  const [publicId, setPublicId] = useState<string>()
  const [copied, setCopied] = useState(false)
  const link = publicId ? `https://chordlist.app/link/${publicId}` : null

  function generate() {
    setPublicId(newPublicId())
    setCopied(false)
  }

  async function copy() {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      {link ? <code className="block overflow-x-auto text-sm">{link}</code> : null}
      <div className={cn("flex flex-wrap gap-3", link && "mt-4")}>
        <button className={buttonVariants({ variant: link ? "outline" : "default" })} onClick={generate} type="button">
          <RefreshCw />
          {link ? regenerateLabel : generateLabel}
        </button>
        {link ? (
          <button className={buttonVariants()} onClick={copy} type="button">
            <Copy />
            {copied ? copiedLabel : copyLabel}
          </button>
        ) : null}
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">{note}</p>
      <span aria-live="polite" className="sr-only">{copied ? copiedLabel : ""}</span>
    </div>
  )
}
