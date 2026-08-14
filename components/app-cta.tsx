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
const ctaState: "testFlight" | "download" | "preorder" | "comingSoon" = siteConfig.links.appStore
  ? "download"
  : siteConfig.links.preorder
    ? "preorder"
    : siteConfig.links.testFlight
      ? "testFlight"
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
 *
 * The beta aside is only for the pre-order window. Once the store link is live
 * the button already hands over the app, so there is nothing left to offer
 * early, and before a listing exists TestFlight is the button rather than the
 * small print.
 */
export function AppCTANote({ className }: AppCTANoteProps) {
  const betaLink = ctaState === "preorder" ? siteConfig.links.testFlight : null

  return (
    <p className={cn("text-pretty text-xs leading-relaxed text-muted-foreground", className)}>
      {commonCopy.appCta.note[ctaState]}
      {betaLink ? (
        <>
          {" "}
          {commonCopy.appCta.betaAside.prefix}{" "}
          <a href={betaLink} className="underline underline-offset-2 transition-colors hover:text-foreground">
            {commonCopy.appCta.betaAside.link}
          </a>
          {commonCopy.appCta.betaAside.suffix}
        </>
      ) : null}
    </p>
  )
}
