import { Apple } from "lucide-react"

import { Button } from "@/components/ui/button"
import { primaryAppLink, primaryAppLinkLabel } from "@/lib/site-config"

type AppCTAProps = {
  large?: boolean
}

export function AppCTA({ large = false }: AppCTAProps) {
  const label = large && primaryAppLink ? `${primaryAppLinkLabel} on iOS` : primaryAppLinkLabel

  if (!primaryAppLink) {
    return (
      <Button size={large ? "lg" : "default"} className="gap-2" disabled>
        <Apple aria-hidden="true" />
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
          <Apple aria-hidden="true" />
          {label}
        </a>
      }
    />
  )
}

