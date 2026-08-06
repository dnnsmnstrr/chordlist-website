import { Apple } from "lucide-react"

import { Button } from "@/components/ui/button"
import { primaryAppLink, siteConfig } from "@/lib/site-config"
import { commonCopy } from "@/locales/en"

type AppCTAProps = {
  large?: boolean
}

export function AppCTA({ large = false }: AppCTAProps) {
  const primaryLabel = siteConfig.links.testFlight
    ? commonCopy.appCta.testFlight
    : siteConfig.links.appStore
      ? commonCopy.appCta.download
      : siteConfig.links.preorder
        ? commonCopy.appCta.preorder
        : commonCopy.appCta.comingSoon
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
