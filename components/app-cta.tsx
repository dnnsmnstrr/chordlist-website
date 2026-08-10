import { Apple } from "lucide-react"

import { Button } from "@/components/ui/button"
import { primaryAppLink, siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"
import { commonCopy } from "@/locales/en"

type AppCTAProps = {
  large?: boolean
}

/**
 * Which CTA the configured links add up to. Mirrors primaryAppLink's order of
 * preference, so the button label and the note below it can never disagree.
 */
const ctaState: "testFlight" | "download" | "preorder" | "comingSoon" = siteConfig.links.testFlight
  ? "testFlight"
  : siteConfig.links.appStore
    ? "download"
    : siteConfig.links.preorder
      ? "preorder"
      : "comingSoon"

export function AppCTA({ large = false }: AppCTAProps) {
  const primaryLabel = commonCopy.appCta[ctaState]
  const label = large && primaryAppLink ? `${primaryLabel} ${commonCopy.appCta.largeSuffix}` : primaryLabel
  const icon = large ? <Apple aria-hidden="true" /> : null

  if (!primaryAppLink) {
    return (
      <Button size={large ? "lg" : "default"} className="gap-2" disabled>
        {icon}
        {label}
      </Button>
    )
  }

  return (
    <Button
      size={large ? "lg" : "default"}
      className="gap-2"
      nativeButton={false}
      render={
        <a href={primaryAppLink}>
          {icon}
          {label}
        </a>
      }
    />
  )
}

type AppCTANoteProps = {
  className?: string
}

/**
 * The small print under a large CTA: what the button actually gets you, which
 * device it needs, and — while the app is in beta — that TestFlight is involved.
 */
export function AppCTANote({ className }: AppCTANoteProps) {
  return (
    <p className={cn("text-pretty text-xs leading-relaxed text-muted-foreground", className)}>
      {commonCopy.appCta.note[ctaState]}
    </p>
  )
}
